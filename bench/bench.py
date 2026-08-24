#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
vLLM-Omni × Ascend NPU 性能摸底脚本
=====================================
口径（与团队约定一致）：
  1. 预热 warmup 次推理（默认 1 次，结果丢弃，用于触发编译等初始化）
  2. 正式推理 runs 次（默认 3 次，串行执行，每次完成后等待日志落盘）
  3. 推理时间以 vllm-omni 服务端日志中的 e2e_total_ms 为准，
     最终结果 = 三次 e2e_total_ms 的平均值
  4. 输出结构化 JSON 到 results/<model_id>.json，供 fill_results.py 回填网站

用法示例
--------
1) 附加模式（服务已在运行，不重启，不中断）：
   python3 bench/bench.py \\
     --model-id minimax-h3 \\
     --endpoint http://127.0.0.1:8000/v1/videos/sync \\
     --log-proc 3608248 \\
     --form 'prompt=...' --form 'width=1344' --form 'height=768' \\
     --resolution 1344x768 --frames 209 --duration 8.7 --steps 50 \\
     --machine 'Atlas 800I A3' --framework 'vllm-omni xxxx' --deploy '4× NPU' \\
     --out results/minimax-h3.json

2) 自起服务模式（脚本负责拉起/压测/回收服务）：
   python3 bench/bench.py \\
     --model-id wan22-i2v-a14b \\
     --serve 'vllm serve Wan-AI/Wan2.2-I2V-A14B-Diffusers --omni --port 8091' \\
     --port 8091 --ready-timeout 1800 \\
     --endpoint http://127.0.0.1:8091/v1/videos/sync \\
     ...（其余同上）

3) 异步任务接口（/v1/videos 创建任务 + 轮询 + 完成后记时）：
     增加 --mode async，脚本自动 POST 创建任务、轮询 GET /v1/videos/<id> 至 completed。

日志读取：
  --log-file PATH   直接读日志文件（自起服务模式自动使用）
  --log-proc PID    通过 /proc/<pid>/fd/1 读正在运行服务的日志
                    （适用于服务跑在另一个容器/命名空间、日志路径不可见的情况）
"""

import argparse
import functools
import json
import os
import re
import subprocess
import sys
import time
from datetime import datetime

# 非终端环境下 stdout 为块缓冲，实时进度会看不到；统一改为行缓冲
print = functools.partial(print, flush=True)

ANSI_RE = re.compile(r"\x1b\[[0-9;]*m")
# 部署版本日志样例：
#   | e2e_total_ms | 238,895.491 |        （带千位分隔符）
E2E_TABLE_RE = re.compile(r"\|\s*e2e_total_ms\s*\|\s*([\d,]+(?:\.\d+)?)\s*\|")
# 摘要行： [OmniTiming] req=video_sync-xxx total=238.90s engine=238.90s stages=[0:238.89s]
OMNI_TIMING_RE = re.compile(r"\[OmniTiming\]\s+req=(\S+).*?total=([\d.]+)s")
REQ_ID_RE = re.compile(r"RequestE2EStats \[request_id=([^\]]+)\]")


class LogReader:
    """读取服务日志的尾部。支持普通文件与 /proc/<pid>/fd/1（跨命名空间）。"""

    def __init__(self, source, tail_bytes=2_000_000):
        self.source = source          # "file:/path" 或 "proc:PID"
        self.tail_bytes = tail_bytes
        self._fd = None

    def _open(self):
        if self.source.startswith("file:"):
            return os.open(self.source[5:], os.O_RDONLY)
        if self.source.startswith("proc:"):
            pid = int(self.source[5:])
            return os.open(f"/proc/{pid}/fd/1", os.O_RDONLY)
        raise ValueError(f"无法识别的日志来源: {self.source}")

    def read_tail(self):
        if self._fd is None:
            self._fd = self._open()
        size = os.fstat(self._fd).st_size
        n = min(self.tail_bytes, size)
        data = os.pread(self._fd, n, max(0, size - n)) if n > 0 else b""
        return data.decode("utf-8", errors="replace")

    def close(self):
        if self._fd is not None:
            os.close(self._fd)
            self._fd = None


def parse_e2e_ms(log_text):
    """从日志文本中解析出 [(req_id, e2e_total_ms), ...]，按出现顺序。

    每条 e2e_total_ms 记录与它之前最近的一个 RequestE2EStats 表头（request_id）配对，
    避免同日志里其他表格干扰。
    """
    clean = ANSI_RE.sub("", log_text)
    pairs = []
    last_rid = None
    for line in clean.splitlines():
        m = REQ_ID_RE.search(line)
        if m:
            last_rid = m.group(1)
            continue
        m = E2E_TABLE_RE.search(line)
        if m:
            pairs.append((last_rid or "unknown", float(m.group(1).replace(",", ""))))
    return pairs


class CurlClient:
    """用 curl 发请求（multipart / JSON），同步接口直接等返回，异步接口负责轮询。"""

    def __init__(self, timeout=3600):
        self.timeout = timeout

    def _run(self, cmd):
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=self.timeout)
        if proc.returncode != 0:
            raise RuntimeError(
                f"curl 失败 rc={proc.returncode}\ncmd: {' '.join(cmd)}\nstderr: {proc.stderr[-500:]}"
            )
        return proc.stdout

    def post_form(self, endpoint, form_fields, output=None):
        cmd = ["curl", "-sS", "-X", "POST", endpoint]
        for k, v in form_fields.items():
            cmd += ["-F", f"{k}={v}"]
        cmd += ["-o", output if output else "/dev/null"]
        self._run(cmd)

    def post_json(self, endpoint, data, output=None):
        cmd = ["curl", "-sS", "-X", "POST", endpoint,
               "-H", "Content-Type: application/json", "-d", data]
        cmd += ["-o", output if output else "/dev/null"]
        self._run(cmd)

    def async_video_job(self, endpoint, form_fields, poll_interval=5):
        """POST 创建任务 → 轮询 GET /v1/videos/<id> 至 completed，返回 request_id。"""
        base = endpoint.rsplit("/v1/videos", 1)[0]
        cmd = ["curl", "-sS", "-X", "POST", endpoint]
        for k, v in form_fields.items():
            cmd += ["-F", f"{k}={v}"]
        resp = self._run(cmd)
        try:
            job_id = json.loads(resp)["id"]
        except Exception:
            raise RuntimeError(f"无法从创建响应中解析任务 id: {resp[:300]}")
        deadline = time.time() + self.timeout
        while True:
            out = self._run(["curl", "-sS", f"{base}/v1/videos/{job_id}"])
            try:
                status = json.loads(out).get("status")
            except Exception:
                status = None
            if status == "completed":
                return job_id
            if time.time() > deadline:
                raise TimeoutError(f"异步任务 {job_id} 超时（{self.timeout}s）未完成")
            time.sleep(poll_interval)


def wait_for_ready(port, timeout):
    """自起服务模式下，等端口就绪。"""
    deadline = time.time() + timeout
    while time.time() < deadline:
        proc = subprocess.run(
            ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}",
             f"http://127.0.0.1:{port}/health"],
            capture_output=True, text=True, timeout=10)
        if proc.returncode == 0 and proc.stdout.strip() != "000":
            return True
        time.sleep(5)
    return False


def main():
    ap = argparse.ArgumentParser(description="vLLM-Omni NPU 性能摸底（e2e_total_ms 口径）")
    ap.add_argument("--model-id", required=True, help="网站 data.js 中的模型 id")
    ap.add_argument("--endpoint", required=True, help="推理接口，如 http://127.0.0.1:8000/v1/videos/sync")
    ap.add_argument("--mode", choices=["sync", "async"], default="sync",
                    help="sync=同步接口（含 /v1/videos/sync、/v1/images/*）; async=/v1/videos 任务+轮询")
    ap.add_argument("--form", action="append", default=[],
                    help="multipart 表单字段，格式 key=value，可多次传入（--data 二选一）")
    ap.add_argument("--data", default=None, help="JSON 请求体（用于 /v1/images/generations 等）")
    ap.add_argument("--warmup", type=int, default=1, help="预热次数（结果丢弃），默认 1")
    ap.add_argument("--runs", type=int, default=3, help="正式推理次数，默认 3")
    ap.add_argument("--settle", type=float, default=3.0, help="每次推理后等待日志落盘的秒数，默认 3")
    ap.add_argument("--timeout", type=int, default=3600, help="单次请求超时（秒），默认 3600")
    ap.add_argument("--log-file", default=None, help="日志文件路径")
    ap.add_argument("--log-proc", default=None, help="服务进程 PID（经 /proc/<pid>/fd/1 读日志）")
    ap.add_argument("--serve", default=None, help="自起服务模式：完整的 vllm serve 命令")
    ap.add_argument("--port", type=int, default=None, help="自起服务模式的端口（就绪探测用）")
    ap.add_argument("--ready-timeout", type=int, default=1800, help="自起服务就绪等待上限（秒）")
    ap.add_argument("--out", required=True, help="结果 JSON 输出路径，如 results/minimax-h3.json")
    # 结果元数据（对应网站性能表的列）
    ap.add_argument("--task", default="", help="任务类型（如 t2va / ref2va / fl2va / t2i / i2i），回填到「任务」列")
    ap.add_argument("--resolution", default="", help="分辨率，如 1344x768")
    ap.add_argument("--frames", type=int, default=None, help="帧数（计算每帧时间用）")
    ap.add_argument("--duration", default="", help="时长（如 8.7s）")
    ap.add_argument("--fps", default="", help="帧率（fps），回填到「帧率 (fps)」列")
    ap.add_argument("--steps", type=int, default=None, help="推理步数")
    ap.add_argument("--machine", default="", help="机型，如 Atlas 800I A3")
    ap.add_argument("--cards", type=int, default=None, help="卡数（NPU 卡数，回填到「卡数」列）")
    ap.add_argument("--framework", default="", help="框架版本（仅标 vllm-omni 版本），如 vllm-omni v0.25.0")
    ap.add_argument("--deploy", default="", help="部署配置说明（仅记录在结果 JSON，不进网站表格）")
    ap.add_argument("--note", default="", help="备注")
    args = ap.parse_args()

    form_fields = {}
    for item in args.form:
        if "=" not in item:
            ap.error(f"--form 格式应为 key=value，收到: {item}")
        k, v = item.split("=", 1)
        form_fields[k] = v

    if args.data and args.form:
        ap.error("--data 与 --form 二选一")

    # ---------- 日志读取器 ----------
    if args.serve:
        log_path = os.path.join("results", "logs", f"{args.model_id}.log")
        os.makedirs(os.path.dirname(log_path), exist_ok=True)
        logf = open(log_path, "ab", buffering=0)
        print(f"[bench] 启动服务: {args.serve}")
        server = subprocess.Popen(args.serve, shell=True, stdout=logf, stderr=subprocess.STDOUT)
        log_reader = LogReader(f"file:{log_path}")
    elif args.log_file:
        log_reader = LogReader(f"file:{args.log_file}")
    elif args.log_proc:
        log_reader = LogReader(f"proc:{args.log_proc}")
    else:
        ap.error("必须提供 --serve（自起服务）、--log-file 或 --log-proc 之一")

    client = CurlClient(timeout=args.timeout)
    started_server = False
    try:
        if args.serve:
            started_server = True
            if args.port is None:
                raise RuntimeError("自起服务模式必须提供 --port")
            if not wait_for_ready(args.port, args.ready_timeout):
                raise TimeoutError(f"服务在 {args.ready_timeout}s 内未就绪（端口 {args.port}）")
            print(f"[bench] 服务就绪: http://127.0.0.1:{args.port}")

        def send_one():
            if args.mode == "async":
                return client.async_video_job(args.endpoint, form_fields)
            if args.data:
                client.post_json(args.endpoint, args.data)
            else:
                client.post_form(args.endpoint, form_fields)
            return None

        # ---------- 预热（丢弃） ----------
        for i in range(args.warmup):
            print(f"[bench] 预热 {i + 1}/{args.warmup} ...")
            send_one()
            time.sleep(args.settle)

        # ---------- 重新取基线，再正式跑 runs 次 ----------
        baseline = parse_e2e_ms(log_reader.read_tail())
        print(f"[bench] 基线 e2e 记录数: {len(baseline)}")
        runs = []
        for i in range(args.runs):
            print(f"[bench] 正式推理 {i + 1}/{args.runs} ...")
            job_rid = send_one()
            time.sleep(args.settle)
            now = parse_e2e_ms(log_reader.read_tail())
            fresh = now[len(baseline):]
            if not fresh:
                raise RuntimeError("日志中未发现新的 e2e_total_ms 记录，请确认 --log-file/--log-proc 指向正确日志")
            # 优先按请求 id 匹配（异步模式），否则取最后一条新增记录
            picked = None
            if job_rid:
                for rid, ms in fresh:
                    if job_rid in rid or rid in job_rid:
                        picked = (rid, ms)
                        break
            if picked is None:
                picked = fresh[-1]
            rid, ms = picked
            runs.append({"n": i + 1, "req_id": rid, "e2e_total_ms": round(ms, 3)})
            print(f"[bench]   第 {i + 1} 次: e2e_total_ms = {ms:.1f} ms ({rid})")

        avg = sum(r["e2e_total_ms"] for r in runs) / len(runs)
        result = {
            "model_id": args.model_id,
            "metric": "e2e_total_ms",
            "method": f"预热 {args.warmup} 次（丢弃）+ 正式 {args.runs} 次，取服务端日志 e2e_total_ms 平均值",
            "env": {
                "machine": args.machine,
                "cards": args.cards,
                "framework": args.framework,
            },
            "config": {
                "endpoint": args.endpoint,
                "mode": args.mode,
                "task": args.task,
                "resolution": args.resolution,
                "frames": args.frames,
                "duration": args.duration,
                "fps": args.fps,
                "steps": args.steps,
                "deploy": args.deploy,
                "form": form_fields,
                "data": args.data,
            },
            "runs": runs,
            "avg_e2e_total_ms": round(avg, 3),
            "avg_e2e_s": round(avg / 1000.0, 3),
            "per_frame_ms": round(avg / args.frames, 3) if args.frames else None,
            "note": args.note,
            "timestamp": datetime.now().isoformat(timespec="seconds"),
        }
        os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
        with open(args.out, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        print(f"[bench] 平均 e2e_total_ms = {avg:.1f} ms（{args.runs} 次）")
        print(f"[bench] 结果已写入 {args.out}")
    finally:
        log_reader.close()
        if started_server:
            print("[bench] 停止服务 ...")
            server.terminate()
            try:
                server.wait(timeout=30)
            except subprocess.TimeoutExpired:
                server.kill()


if __name__ == "__main__":
    main()

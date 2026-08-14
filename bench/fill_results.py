#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把 bench/bench.py 输出的 results/<model_id>.json 回填到网站数据文件
====================================================================
按 data.js 中该模型 perf.columns 的列序生成行数据，写入 perf.rows。

用法：
  python3 bench/fill_results.py --dry-run results/minimax-h3.json
  python3 bench/fill_results.py results/minimax-h3.json results/z-image-turbo.json ...
  （不指定结果文件时，回填 results/ 下全部 *.json）
"""

import argparse
import glob
import json
import os
import re
import sys

DATA_JS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "js", "data.js")


def bracket_scan(text, start):
    """从 start 处的 '[' 开始，返回与之匹配的 ']' 之后的位置。start 必须指向 '['。"""
    depth = 0
    in_str = False
    esc = False
    i = start
    while i < len(text):
        ch = text[i]
        if in_str:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == '"':
                in_str = False
        else:
            if ch == '"':
                in_str = True
            elif ch == "[":
                depth += 1
            elif ch == "]":
                depth -= 1
                if depth == 0:
                    return i + 1
        i += 1
    raise ValueError("括号不匹配，data.js 可能损坏")


def js_string(v):
    """把 Python 值渲染成 JS 字符串字面量（对双引号与反斜杠转义）。"""
    s = "" if v is None else str(v)
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ") + '"'


def locate_model_block(text, model_id):
    """返回 (模型起始位置, perf 起始位置)。perf 起始 = 该模型块内 'perf: {' 的位置。"""
    m = re.search(r'id:\s*"' + re.escape(model_id) + r'"', text)
    if not m:
        raise ValueError(f"data.js 中未找到模型 id: {model_id}")
    perf_m = re.search(r"perf:\s*\{", text[m.end():])
    if not perf_m:
        raise ValueError(f"模型 {model_id} 缺少 perf 块")
    return m.start(), m.end() + perf_m.start()


def row_from_result(result, columns):
    c = result.get("config", {})
    e = result.get("env", {})
    avg_ms = result["avg_e2e_total_ms"]
    avg_s = avg_ms / 1000.0
    frames = c.get("frames")
    per_frame = round(avg_ms / frames, 1) if frames else None
    note = result.get("note") or ""
    if note:
        note += "；"
    note += f"预热 1 次 + {len(result['runs'])} 次平均（服务端 e2e_total_ms）"

    values = {
        "分辨率": c.get("resolution", ""),
        "帧数 / 时长": (f"{frames} 帧 / {c['duration']}s" if frames and c.get("duration")
                        else (f"{frames} 帧" if frames else "")),
        "推理步数": c.get("steps", ""),
        "层数": c.get("layers", ""),
        "机型": e.get("machine", ""),
        "框架版本": e.get("framework", ""),
        "部署配置": c.get("deploy", ""),
        "端到端时间 (s)": f"{avg_s:.2f}",
        "每帧时间 (ms)": f"{per_frame:.1f}" if per_frame is not None else "",
        "单张耗时 (s)": f"{avg_s:.2f}",
        "吞吐 (张/s)": c.get("throughput", ""),
        "备注": note,
    }
    return [js_string(values.get(col, "")) for col in columns]


def fill_one(text, result, dry_run=False):
    model_id = result["model_id"]
    model_start, perf_start = locate_model_block(text, model_id)

    # 解析 columns
    cols_m = re.search(r"columns:\s*\[", text[perf_start:])
    if not cols_m:
        raise ValueError(f"模型 {model_id} 的 perf 块缺少 columns")
    cols_open = perf_start + cols_m.end() - 1  # 指向 '['
    cols_end = bracket_scan(text, cols_open)
    cols_body = text[cols_open + 1:cols_end - 1]
    columns = re.findall(r'"([^"]*)"', cols_body)

    # 解析 rows（当前可能为 [] 或已有数据）
    rows_m = re.search(r"rows:\s*\[", text[cols_end:])
    if not rows_m:
        raise ValueError(f"模型 {model_id} 的 perf 块缺少 rows")
    rows_open = cols_end + rows_m.end() - 1
    rows_end = bracket_scan(text, rows_open)

    row_literal = "[" + ", ".join(row_from_result(result, columns)) + "]"
    new_text = text[:rows_open + 1] + row_literal + text[rows_end - 1:]
    if dry_run:
        print(f"[dry-run] {model_id} 将写入行:")
        print("   " + row_literal)
    return new_text


def main():
    ap = argparse.ArgumentParser(description="回填压测结果到 data.js")
    ap.add_argument("files", nargs="*", help="结果 JSON 文件；缺省时处理 results/*.json")
    ap.add_argument("--dry-run", action="store_true", help="只打印将写入的行，不修改文件")
    args = ap.parse_args()

    files = args.files or sorted(glob.glob("results/*.json"))
    if not files:
        ap.error("未找到结果文件（results/*.json 为空），请先运行 bench/bench.py")

    with open(DATA_JS, encoding="utf-8") as f:
        text = f.read()
    new_text = text
    for fp in files:
        with open(fp, encoding="utf-8") as f:
            result = json.load(f)
        new_text = fill_one(new_text, result, dry_run=args.dry_run)

    if args.dry_run:
        print("\n[dry-run] 未修改 data.js")
    else:
        with open(DATA_JS, "w", encoding="utf-8") as f:
            f.write(new_text)
        print(f"已回填 {len(files)} 个结果到 {DATA_JS}")


if __name__ == "__main__":
    main()

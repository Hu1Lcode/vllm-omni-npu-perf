#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
vLLM-Omni NPU 模型画廊 —— 静态站点 + 数据文件读写服务
=========================================================
用法：
    python3 server.py [--port 8899] [--bind 0.0.0.0]

功能：
  1. 静态服务整个项目目录（等价于 python3 -m http.server）；
  2. GET  /api/data  —— 返回 user-data.json 内容（不存在时返回 {}）；
  3. PUT  /api/data  —— 把请求体（JSON 对象）原子写入 user-data.json。

前端通过该服务访问时，详情页部署脚本的「保存/重置」直接读写 user-data.json；
直接双击 index.html（无服务）时自动回退到浏览器 localStorage。
"""

import argparse
import json
import os
import sys
import tempfile
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(ROOT, "user-data.json")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        if self.path in ("/api/data", "/api/data/"):
            try:
                with open(DATA_FILE, encoding="utf-8") as f:
                    body = f.read()
            except FileNotFoundError:
                body = "{}"
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body.encode("utf-8"))
            return
        super().do_GET()

    def do_PUT(self):
        if self.path not in ("/api/data", "/api/data/"):
            self.send_error(404)
            return
        length = int(self.headers.get("Content-Length", 0) or 0)
        raw = self.rfile.read(length)
        try:
            data = json.loads(raw.decode("utf-8"))
        except Exception as e:
            self.send_error(400, f"请求体不是合法 JSON: {e}")
            return
        if not isinstance(data, dict):
            self.send_error(400, "期望一个 JSON 对象")
            return
        # 原子写入：先写临时文件再替换，避免写一半损坏
        fd, tmp = tempfile.mkstemp(dir=ROOT, prefix=".user-data-", suffix=".tmp")
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            os.replace(tmp, DATA_FILE)
        except Exception:
            try:
                os.unlink(tmp)
            except OSError:
                pass
            self.send_error(500, "写入失败")
            return
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode("utf-8"))

    def log_message(self, fmt, *args):
        msg = fmt % args
        if "/api/data" in msg:
            sys.stderr.write("[data] %s\n" % msg)
        else:
            sys.stderr.write("%s\n" % msg)


def main():
    ap = argparse.ArgumentParser(description="静态站点 + user-data.json 读写服务")
    ap.add_argument("--port", type=int, default=8899, help="监听端口（默认 8899）")
    ap.add_argument("--bind", default="0.0.0.0", help="绑定地址（默认 0.0.0.0）")
    args = ap.parse_args()
    server = ThreadingHTTPServer((args.bind, args.port), Handler)
    print(f"服务已启动: http://{args.bind}:{args.port}/  （数据文件: {DATA_FILE}）", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n已停止", flush=True)


if __name__ == "__main__":
    main()

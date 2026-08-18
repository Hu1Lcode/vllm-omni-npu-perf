#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
vLLM-Omni NPU 模型画廊 —— 静态站点 + 部署脚本同步服务
=========================================================
用法：
    python3 server.py [--port 8899] [--bind 0.0.0.0]

功能：
  1. 静态服务整个项目目录（等价于 python3 -m http.server）；
  2. GET /api/scripts/<模型id>.sh —— 返回 scripts/ 下对应脚本内容，
     详情页据此渲染「部署推理脚本」区块（改脚本 → 刷新页面即生效）。
"""

import argparse
import os
import re
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
SCRIPTS_DIR = os.path.join(ROOT, "scripts")

# 只允许 <字母数字-_>.sh 的文件名，防止路径穿越
SCRIPT_NAME_RE = re.compile(r"^[A-Za-z0-9_-]+\.sh$")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        if self.path.startswith("/api/scripts/"):
            name = self.path[len("/api/scripts/"):]
            if not SCRIPT_NAME_RE.fullmatch(name):
                self.send_error(400, "invalid script name")   # send_error 的消息须为 ASCII
                return
            path = os.path.join(SCRIPTS_DIR, name)
            if not os.path.isfile(path):
                self.send_error(404, "script not found")
                return
            with open(path, encoding="utf-8") as f:
                body = f.read()
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body.encode("utf-8"))
            return
        super().do_GET()

    def log_message(self, fmt, *args):
        msg = fmt % args
        if "/api/scripts" in msg:
            sys.stderr.write("[scripts] %s\n" % msg)
        else:
            sys.stderr.write("%s\n" % msg)


def main():
    ap = argparse.ArgumentParser(description="静态站点 + 部署脚本同步服务")
    ap.add_argument("--port", type=int, default=8899, help="监听端口（默认 8899）")
    ap.add_argument("--bind", default="0.0.0.0", help="绑定地址（默认 0.0.0.0）")
    args = ap.parse_args()
    server = ThreadingHTTPServer((args.bind, args.port), Handler)
    print(f"服务已启动: http://{args.bind}:{args.port}/  （部署脚本同步: /api/scripts/<模型id>.sh）", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n已停止", flush=True)


if __name__ == "__main__":
    main()

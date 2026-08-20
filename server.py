#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
vLLM-Omni NPU 模型画廊 —— 静态站点 + models/ 内容同步服务
=========================================================
用法：
    python3 server.py [--port 8899] [--bind 0.0.0.0]

功能：
  1. 静态服务整个项目目录（等价于 python3 -m http.server）；
  2. 三个模型内容 API（均从 models/<模型id>/ 读取，改文件 → 刷新页面即生效）：
     - GET /api/models/<id>/readme —— 返回 README.md（markdown）
     - GET /api/models/<id>/script —— 返回 deploy.sh
     - GET /api/models/<id>/perf   —— 返回 perf.json
"""

import argparse
import json
import os
import re
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(ROOT, "models")

# 只允许 <字母数字_- .> 的模型 id（模型 id 可能含小数点，如 wan21-t2v-1.3b），防止路径穿越
MODEL_ID_RE = re.compile(r"^[A-Za-z0-9_.-]+$")


def model_file_path(model_id, filename):
    """返回 models/<model_id>/<filename> 的绝对路径（文件名白名单，防穿越）。"""
    if not MODEL_ID_RE.fullmatch(model_id):
        return None
    return os.path.join(MODELS_DIR, model_id, filename)


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        # /api/models/<id>/readme|script|perf
        api_m = re.fullmatch(r"/api/models/([^/]+)/(readme|script|perf)", self.path)
        if api_m:
            model_id, kind = api_m.group(1), api_m.group(2)
            filename = {"readme": "README.md", "script": "deploy.sh", "perf": "perf.json"}[kind]
            path = model_file_path(model_id, filename)
            if path is None:
                self.send_error(400, "invalid model id")   # send_error 的消息须为 ASCII
                return
            if not os.path.isfile(path):
                self.send_error(404, "not found for this model")
                return
            if kind == "perf":
                try:
                    with open(path, encoding="utf-8") as f:
                        data = json.load(f)
                    body = json.dumps(data, ensure_ascii=False)
                    ctype = "application/json; charset=utf-8"
                except ValueError:
                    self.send_error(500, "perf.json is invalid")
                    return
            else:
                with open(path, encoding="utf-8") as f:
                    body = f.read()
                ctype = "text/markdown; charset=utf-8" if kind == "readme" else "text/plain; charset=utf-8"
            self.send_response(200)
            self.send_header("Content-Type", ctype)
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body.encode("utf-8"))
            return
        super().do_GET()

    def log_message(self, fmt, *args):
        msg = fmt % args
        if "/api/models" in msg:
            sys.stderr.write("[models] %s\n" % msg)
        else:
            sys.stderr.write("%s\n" % msg)


def main():
    ap = argparse.ArgumentParser(description="静态站点 + models/ 内容同步服务")
    ap.add_argument("--port", type=int, default=8899, help="监听端口（默认 8899）")
    ap.add_argument("--bind", default="0.0.0.0", help="绑定地址（默认 0.0.0.0）")
    args = ap.parse_args()
    server = ThreadingHTTPServer((args.bind, args.port), Handler)
    print(f"服务已启动: http://{args.bind}:{args.port}/  （模型内容同步: /api/models/<模型id>/readme|script|perf）", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n已停止", flush=True)


if __name__ == "__main__":
    main()

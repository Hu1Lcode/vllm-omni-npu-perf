#!/usr/bin/env bash
# ============================================================
# Qwen-Image-2512 —— 部署推理脚本
# 系列: Qwen-Image 系列 ｜ 组织: Qwen ｜ 仓库: Qwen/Qwen-Image-2512
# 任务: 文生图
# 由 scripts/generate_scripts.py 从 assets/js/data.js 自动生成；
# 可直接编辑本文件——页面（经 server.py）会同步显示修改；
# 也可改 data.js 的 serve 字段后重新生成覆盖本文件。
# ============================================================

# ---------- 部署推理服务 · vllm serve ----------
vllm serve Qwen/Qwen-Image-2512 --omni --port 8091

# 显存受限时追加
#   --vae-use-slicing --vae-use-tiling

# ---------- 客户端调用 · /v1/images/generations ----------
curl -X POST http://localhost:8091/v1/images/generations \
  -H "Content-Type: application/json" \
  -d '{"prompt": "a cup of coffee on the table", "size": "1024x1024", "seed": 42}' \
  | jq -r '.data[0].b64_json' | base64 -d > coffee.png


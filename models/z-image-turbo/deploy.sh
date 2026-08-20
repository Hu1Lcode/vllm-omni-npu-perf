#!/usr/bin/env bash
# ============================================================
# Z-Image-Turbo —— 部署推理脚本
# 系列: Z-Image 系列 ｜ 组织: Tongyi-MAI ｜ 仓库: Tongyi-MAI/Z-Image-Turbo
# 任务: 文生图
# 由 generate_models.py 从 assets/js/data.js 自动生成；
# 可直接编辑本文件——页面（经 server.py）会同步显示修改；
# 也可改 data.js 的 serve 字段后重新生成覆盖本文件。
# ============================================================

# ---------- 部署推理服务 · vllm serve ----------
vllm serve Tongyi-MAI/Z-Image-Turbo --omni --port 8000

# 注意：num_heads=30，仅支持 tensor_parallel_size=2

# ---------- 客户端调用 · /v1/images/generations ----------
curl -X POST http://localhost:8000/v1/images/generations \
  -H "Content-Type: application/json" \
  -d '{"prompt": "a black and white cat wearing a princess tiara", "size": "1024x1024", "num_inference_steps": 9, "seed": 42}' \
  | jq -r '.data[0].b64_json' | base64 -d > cat.png


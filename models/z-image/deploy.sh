#!/usr/bin/env bash
# ============================================================
# Z-Image —— 部署推理脚本
# 系列: Z-Image 系列 ｜ 组织: Tongyi-MAI ｜ 仓库: Tongyi-MAI/Z-Image
# 任务: 文生图
# 由 generate_models.py 从 assets/js/data.js 自动生成；
# 可直接编辑本文件——页面（经 server.py）会同步显示修改；
# 也可改 data.js 的 serve 字段后重新生成覆盖本文件。
# ============================================================

# ---------- 部署推理服务 · vllm serve ----------
export PYTORCH_NPU_ALLOC_CONF=expandable_segments:True
export TASK_QUEUE_ENABLE=2
vllm serve Tongyi-MAI/Z-Image --omni --port 8091 --vae-use-slicing --vae-use-tiling

# 注: NPU 支持状态待验证，建议优先使用官方矩阵列出的 Z-Image-Turbo。

# ---------- 客户端调用 · /v1/images/generations ----------
curl http://localhost:8091/v1/images/generations \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Tongyi-MAI/Z-Image",
    "prompt": "A cinematic view of a futuristic city at sunset",
    "size": "1024x1024",
    "guidance_scale": 4.0,
    "num_inference_steps": 50,
    "seed": 42
  }' \
  | jq -r '.data[0].b64_json' | base64 -d > teapot.png
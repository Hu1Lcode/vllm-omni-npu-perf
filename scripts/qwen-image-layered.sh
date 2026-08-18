#!/usr/bin/env bash
# ============================================================
# Qwen-Image-Layered —— 部署推理脚本
# 系列: Qwen-Image 系列 ｜ 组织: Qwen ｜ 仓库: Qwen/Qwen-Image-Layered
# 任务: 图像编辑
# 由 scripts/generate_scripts.py 从 assets/js/data.js 自动生成；
# 修改请改 data.js 中该模型的 serve 字段后重新生成。
# ============================================================

# ---------- 部署推理服务 · vllm serve ----------
vllm serve Qwen/Qwen-Image-Layered --omni --port 8093

# ---------- 客户端调用 · /v1/chat/completions（图层分解） ----------
curl -s http://localhost:8093/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":[
        {"type":"text","text":""},
        {"type":"image_url","image_url":{"url":"data:image/png;base64,<BASE64>"}}]}],
      "extra_body":{"height":1024,"width":1024,"layers":4,"resolution":1024,"cfg_scale":4.0,"num_inference_steps":50,"seed":42}}'

# 响应 content[] 中每个元素对应一层图像（layers 默认 4）


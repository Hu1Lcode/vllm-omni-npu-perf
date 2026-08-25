#!/usr/bin/env bash
# ============================================================
# Qwen-Image-Edit-2511 —— 部署推理脚本
# 系列: Qwen-Image 系列 ｜ 组织: Qwen ｜ 仓库: Qwen/Qwen-Image-Edit-2511
# 任务: 图像编辑
# 由 generate_models.py 从 assets/js/data.js 自动生成；
# 可直接编辑本文件——页面（经 server.py）会同步显示修改；
# 也可改 data.js 的 serve 字段后重新生成覆盖本文件。
# ============================================================

# ---------- 部署推理服务 · vllm serve ----------
export PYTORCH_NPU_ALLOC_CONF=expandable_segments:True
export TASK_QUEUE_ENABLE=2
vllm serve Qwen/Qwen-Image-Edit-2511 --omni --port 8000 --vae-use-slicing --vae-use-tiling

# 注: 官方 Qwen-Image-Edit recipe 仅覆盖基础版（多图变体明确不在 recipe 验证范围内），2511 的 API 形式与基础版一致。

# ---------- 客户端调用 · /v1/chat/completions（多图编辑） ----------
curl -s http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":[
        {"type":"text","text":"将图中的猫换成小狗"},
        {"type":"image_url","image_url":{"url":"/home/wjh/vllm-omni-npu-showcase/cat.jpg"}}]}],
      "extra_body":{"height":1024,"width":1024,"num_inference_steps":40,"true_cfg_scale":4.0,"guidance_scale":1,"seed":42}}' \
  | jq -r '.choices[0].message.content[0].image_url.url' | cut -d',' -f2 | base64 -d > output.png


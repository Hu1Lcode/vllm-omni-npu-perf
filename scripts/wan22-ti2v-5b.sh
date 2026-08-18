#!/usr/bin/env bash
# ============================================================
# Wan2.2-TI2V-5B —— 部署推理脚本
# 系列: Wan 2.2 系列 ｜ 组织: Wan-AI ｜ 仓库: Wan-AI/Wan2.2-TI2V-5B-Diffusers
# 任务: 文生视频 / 图生视频
# 由 scripts/generate_scripts.py 从 assets/js/data.js 自动生成；
# 修改请改 data.js 中该模型的 serve 字段后重新生成。
# ============================================================

# ---------- 部署推理服务 · vllm serve ----------
# 5B 稠密模型，单卡即可启动
vllm serve Wan-AI/Wan2.2-TI2V-5B-Diffusers \
  --omni --port 8091

# ---------- 客户端调用 · /v1/videos（图生视频示例） ----------
curl -X POST http://localhost:8091/v1/videos \
  -F "prompt=The cat turns its head to look at the camera" \
  -F "input_reference=@/path/to/cat.png" \
  -F "width=832" -F "height=480" -F "num_frames=33" -F "fps=16" \
  -F "num_inference_steps=40" \
  -F "guidance_scale=1.0" -F "guidance_scale_2=1.0" \
  -F "boundary_ratio=0.875" -F "flow_shift=12.0" \
  -F "seed=42"

# 纯文生视频时省略 input_reference 字段即可；参数以官方文档为准


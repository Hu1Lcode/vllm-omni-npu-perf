#!/usr/bin/env bash
# ============================================================
# HunyuanVideo-1.5-I2V —— 部署推理脚本
# 系列: HunyuanVideo 系列 ｜ 组织: hunyuanvideo-community ｜ 仓库: hunyuanvideo-community/HunyuanVideo-1.5-Diffusers-480p_i2v
# 任务: 图生视频
# 由 scripts/generate_scripts.py 从 assets/js/data.js 自动生成；
# 修改请改 data.js 中该模型的 serve 字段后重新生成。
# ============================================================

# ---------- 部署推理服务 · vllm serve ----------
# 480p（默认）
vllm serve hunyuanvideo-community/HunyuanVideo-1.5-Diffusers-480p_i2v --omni \
  --port 8099 --flow-shift 5.0

# 720p（需 FP8 + VAE tiling）
vllm serve hunyuanvideo-community/HunyuanVideo-1.5-Diffusers-720p_i2v --omni \
  --port 8099 --flow-shift 7.0 --quantization fp8

# 注: OOM 缓解：--vae-use-slicing、--vae-use-tiling、--enable-cpu-offload、--quantization fp8。官方矩阵未列入 NPU。

# ---------- 客户端调用 · /v1/videos（异步任务） ----------
curl -sS -X POST "http://localhost:8099/v1/videos" \
  -H "Accept: application/json" \
  -F "prompt=A little girl wearing a straw hat runs through a summer meadow full of wildflowers." \
  -F "input_reference=@/path/to/input.png" \
  -F "size=832x480" -F "num_frames=33" -F "fps=24" \
  -F "num_inference_steps=30" -F "guidance_scale=6.0" \
  -F "flow_shift=5.0" -F "seed=42"

# 轮询 GET /v1/videos/{id} 至 completed，再 GET /v1/videos/{id}/content 下载


#!/usr/bin/env bash
# ============================================================
# HunyuanVideo-1.5-I2V —— 部署推理脚本
# 系列: HunyuanVideo 系列 ｜ 组织: hunyuanvideo-community ｜ 仓库: hunyuanvideo-community/HunyuanVideo-1.5-Diffusers-480p_i2v
# 任务: 图生视频
# 由 scripts/generate_scripts.py 从 assets/js/data.js 自动生成；
# 可直接编辑本文件——页面（经 server.py）会同步显示修改；
# 也可改 data.js 的 serve 字段后重新生成覆盖本文件。
# ============================================================

# ---------- 部署推理服务 · vllm serve ----------
# 480p（默认）
vllm serve hunyuanvideo-community/HunyuanVideo-1.5-Diffusers-480p_i2v --omni 

# 720p
vllm serve hunyuanvideo-community/HunyuanVideo-1.5-Diffusers-720p_i2v --omni 

# 注: OOM 缓解：--vae-use-slicing、--vae-use-tiling、--enable-cpu-offload、--quantization fp8。官方矩阵未列入 NPU。

# ---------- 客户端调用 · /v1/videos（异步任务） ----------
curl -sS -X POST "http://localhost:8099/v1/videos" \
  -H "Accept: application/json" \
  -F "prompt=A little girl wearing a straw hat runs through a summer meadow full of wildflowers." \
  -F "input_reference=@/path/to/input.png" \
  -F "size=832x480" -F "num_frames=121" -F "fps=24" \
  -F "num_inference_steps=50" -F "seed=42"

# 轮询 GET /v1/videos/{id} 至 completed，再 GET /v1/videos/{id}/content 下载


#!/usr/bin/env bash
# ============================================================
# Wan2.2-T2V-A14B —— 部署推理脚本
# 系列: Wan 2.2 系列 ｜ 组织: Wan-AI ｜ 仓库: Wan-AI/Wan2.2-T2V-A14B-Diffusers
# 任务: 文生视频
# 由 scripts/generate_scripts.py 从 assets/js/data.js 自动生成；
# 修改请改 data.js 中该模型的 serve 字段后重新生成。
# ============================================================

# ---------- 部署推理服务 · vllm serve ----------
# 基础启动（单卡）
vllm serve Wan-AI/Wan2.2-T2V-A14B-Diffusers \
  --omni --port 8091 \
  --boundary-ratio 0.875 \
  --flow-shift 5.0

# 8 卡 NPU：HSDP + VAE patch 并行 + tiling
vllm serve Wan-AI/Wan2.2-T2V-A14B-Diffusers \
  --omni --use-hsdp --usp 8 \
  --vae-patch-parallel-size 8 --vae-use-tiling

# ---------- 客户端调用 · /v1/videos（异步任务） ----------
# 创建视频生成任务
create_response=$(curl -s http://localhost:8091/v1/videos \
  -H "Accept: application/json" \
  -F "prompt=Two anthropomorphic cats in comfy boxing gear and bright gloves fight intensely on a spotlighted stage." \
  -F "width=832" -F "height=480" -F "num_frames=33" -F "fps=16" \
  -F "num_inference_steps=40" \
  -F "guidance_scale=4.0" -F "guidance_scale_2=4.0" \
  -F "boundary_ratio=0.875" -F "flow_shift=5.0" -F "seed=42")

# 轮询任务状态，直到 status == completed
video_id=$(echo "$create_response" | jq -r '.id')
curl -s "http://localhost:8091/v1/videos/${video_id}"

# 下载生成结果
curl -L "http://localhost:8091/v1/videos/${video_id}/content" -o wan22_t2v_output.mp4


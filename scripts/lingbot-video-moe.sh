#!/usr/bin/env bash
# ============================================================
# LingBot-Video-MoE-30B-A3B —— 部署推理脚本
# 系列: LingBot-Video 系列 ｜ 组织: Robbyant ｜ 仓库: robbyant/lingbot-video-moe-30b-a3b
# 任务: 文生图 / 文生视频 / 图生视频
# 由 scripts/generate_scripts.py 从 assets/js/data.js 自动生成；
# 修改请改 data.js 中该模型的 serve 字段后重新生成。
# ============================================================

# ---------- 部署推理服务 · vllm serve ----------
CUDA_VISIBLE_DEVICES=0 \
vllm serve robbyant/lingbot-video-moe-30b-a3b \
  --omni \
  --model-class-name LingBotVideoPipeline \
  --default-sampling-params \
  '{"0":{"num_frames":81,"num_inference_steps":40,"guidance_scale":6.0}}' \
  --port 8091

# 注: MoE checkpoint 峰值约 67.7 GiB 显存，建议 ≥70 GiB 显存的 GPU。官方矩阵未列入 NPU。

# ---------- 客户端调用 · /v1/videos（异步任务） ----------
create_response=$(curl -s http://localhost:8091/v1/videos \
  -F "model=robbyant/lingbot-video-moe-30b-a3b" \
  -F "prompt=a robotic arm picks up a red block" \
  -F "width=320" -F "height=192" -F "num_frames=9" -F "fps=24" \
  -F "num_inference_steps=2" -F "guidance_scale=3.0" -F "flow_shift=3.0" \
  -F "seed=42")
video_id=$(echo "$create_response" | jq -r '.id')
curl -L "http://localhost:8091/v1/videos/${video_id}/content" -o lingbot_moe_t2v.mp4


#!/usr/bin/env bash
# ============================================================
# LingBot-Video-Dense-1.3B —— 部署推理脚本
# 系列: LingBot-Video 系列 ｜ 组织: Robbyant ｜ 仓库: robbyant/lingbot-video-dense-1.3b
# 任务: 文生图 / 文生视频 / 图生视频
# 由 scripts/generate_scripts.py 从 assets/js/data.js 自动生成；
# 可直接编辑本文件——页面（经 server.py）会同步显示修改；
# 也可改 data.js 的 serve 字段后重新生成覆盖本文件。
# ============================================================

# ---------- 部署推理服务 · vllm serve ----------
CUDA_VISIBLE_DEVICES=0 \
vllm serve robbyant/lingbot-video-dense-1.3b \
  --omni \
  --model-class-name LingBotVideoPipeline \
  --default-sampling-params \
  '{"0":{"num_frames":81,"num_inference_steps":40,"guidance_scale":6.0}}' \
  --port 8091

# 注: 官方 recipe 仅验证 CUDA 单卡路径；多卡并行、Cache-DiT、量化、CPU 卸载未验证。官方矩阵未列入 NPU。

# ---------- 客户端调用 · /v1/videos（异步任务） ----------
create_response=$(curl -s http://localhost:8091/v1/videos \
  -F "model=robbyant/lingbot-video-dense-1.3b" \
  -F "prompt=a robotic arm picks up a red block" \
  -F "width=320" -F "height=192" -F "num_frames=9" -F "fps=24" \
  -F "num_inference_steps=2" -F "guidance_scale=3.0" -F "flow_shift=3.0" \
  -F "seed=42")
video_id=$(echo "$create_response" | jq -r '.id')
curl -L "http://localhost:8091/v1/videos/${video_id}/content" -o lingbot_t2v.mp4

# 另支持 T2I（/v1/images 路由）与 TI2V（追加 input_reference 参考图）


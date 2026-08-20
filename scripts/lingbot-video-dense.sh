#!/usr/bin/env bash
# ============================================================
# LingBot-Video-Dense-1.3B —— 部署推理脚本
# 系列: LingBot-Video 系列 ｜ 组织: Robbyant ｜ 仓库: robbyant/lingbot-video-dense-1.3b
# 任务: 文生视频
# 由 scripts/generate_scripts.py 从 assets/js/data.js 自动生成；
# 可直接编辑本文件——页面（经 server.py）会同步显示修改；
# 也可改 data.js 的 serve 字段后重新生成覆盖本文件。
# ============================================================

# ---------- 部署推理服务 · vllm serve ----------
export ASCEND_RT_VISIBLE_DEVICES=0,1,2,3,4,5,6,7
vllm serve robbyant/lingbot-video-dense-1.3b \
  --omni \
  --model-class-name LingBotVideoPipeline \
  --port 8091

# 注: 官方 recipe 仅验证 CUDA 单卡路径；多卡并行、Cache-DiT、量化、CPU 卸载未验证。官方矩阵未列入 NPU。

# ---------- 客户端调用 · /v1/videos（异步任务，仅 T2V） ----------
create_response=$(curl -s http://localhost:8091/v1/videos \
  -F "model=robbyant/lingbot-video-dense-1.3b" \
  -F "prompt=a robotic arm picks up a red block" \
  -F "width=832" -F "height=480" -F "num_frames=81" -F "fps=16" \
  -F "num_inference_steps=40" -F "guidance_scale=3.0" -F "flow_shift=3.0" \
  -F "seed=42")

video_id=$(echo "$create_response" | jq -r '.id')
while true; do
  status=$(curl -s "http://localhost:8091/v1/videos/${video_id}" | jq -r '.status')
  [ "${status}" = "completed" ] && break
  [ "${status}" = "failed" ] && { curl -s "http://localhost:8091/v1/videos/${video_id}" | jq .; exit 1; }
  sleep 2
done

curl -L "http://localhost:8091/v1/videos/${video_id}/content" -o lingbot_t2v.mp4

# 注: 当前官方 recipe 仅支持 T2V（T2I / I2V / TI2V 未实现）；height/width 需为 16 的倍数，num_frames 为 1 或 4n+1。


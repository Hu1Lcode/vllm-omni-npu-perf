#!/usr/bin/env bash
# ============================================================
# LingBot-Video-Dense-1.3B —— 部署推理脚本
# 系列: LingBot-Video 系列 ｜ 组织: Robbyant ｜ 仓库: robbyant/lingbot-video-dense-1.3b
# 任务: 文生视频
# 由 generate_models.py 从 assets/js/data.js 自动生成；
# 可直接编辑本文件——页面（经 server.py）会同步显示修改；
# 也可改 data.js 的 serve 字段后重新生成覆盖本文件。
# ============================================================

# ---------- 部署推理服务 · vllm serve ----------
export PYTORCH_NPU_ALLOC_CONF=expandable_segments:True
export TASK_QUEUE_ENABLE=2
export ASCEND_RT_VISIBLE_DEVICES=8,9,10,11
vllm serve /mnt/sfs_turbo/wjh/lingbot-video-dense-1.3b \
  --omni \
  --usp 4 \
  --model-class-name LingBotVideoPipeline \
  --port 12580

# 注: 官方 recipe 仅验证 CUDA 单卡路径；多卡并行、Cache-DiT、量化、CPU 卸载未验证。官方矩阵未列入 NPU。

# ---------- 客户端调用 · /v1/videos（异步任务，仅 T2V） ----------
curl -s http://localhost:12580/v1/videos \
  -F "model=/mnt/sfs_turbo/wjh/lingbot-video-dense-1.3b" \
  -F "prompt=a robotic arm picks up a red block" \
  -F "width=832" -F "height=480" -F "num_frames=121" -F "fps=24" \
  -F "num_inference_steps=40" -F "guidance_scale=3.0" -F "flow_shift=3.0" \
  -F "seed=42"

video_id=$(echo "$create_response" | jq -r '.id')
while true; do
  status=$(curl -s "http://localhost:8091/v1/videos/${video_id}" | jq -r '.status')
  [ "${status}" = "completed" ] && break
  [ "${status}" = "failed" ] && { curl -s "http://localhost:8091/v1/videos/${video_id}" | jq .; exit 1; }
  sleep 2
done

curl -L "http://localhost:8091/v1/videos/${video_id}/content" -o lingbot_t2v.mp4

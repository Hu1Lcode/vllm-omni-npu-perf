#!/usr/bin/env bash
# ============================================================
# Wan2.2-I2V-A14B —— 部署推理脚本
# 系列: Wan 2.2 系列 ｜ 组织: Wan-AI ｜ 仓库: Wan-AI/Wan2.2-I2V-A14B-Diffusers
# 任务: 图生视频
# 由 generate_models.py 从 assets/js/data.js 自动生成；
# 可直接编辑本文件——页面（经 server.py）会同步显示修改；
# 也可改 data.js 的 serve 字段后重新生成覆盖本文件。
# ============================================================

# ---------- 部署推理服务 · vllm serve（8 卡 NPU） ----------
export PYTORCH_NPU_ALLOC_CONF=expandable_segments:True
export TASK_QUEUE_ENABLE=2
export MINDIE_SD_FA_TYPE=ascend_laser_attention 
export MULTI_STREAM_MEMORY_REUSE=2
# 基础启动（单卡）
vllm serve Wan-AI/Wan2.2-I2V-A14B-Diffusers \
  --omni --port 8091 \
  --boundary-ratio 0.900 \
  --flow-shift 5.0

# hsdpsp8la hsdpsp4cfg2la
vllm serve Wan-AI/Wan2.2-I2V-A14B-Diffusers \
  --port 8091 \
  --omni --use-hsdp --usp 4 --cfg-parallel-size 2 \
  --vae-patch-parallel-size 8 --vae-use-tiling

# ---------- 客户端调用 · /v1/videos（图生视频） ----------
# 创建视频生成任务
curl -X POST http://localhost:8091/v1/videos \
  -F "prompt=The cat turns its head to look at the camera" \
  -F "input_reference=@/home/wjh/vllm-omni-npu-showcase/cat.jpg" \
  -F "width=832" -F "height=480" -F "num_frames=81" -F "fps=16" \
  -F "num_inference_steps=40" \
  -F "guidance_scale=3.5" -F "guidance_scale_2=3.5" \
  -F "boundary_ratio=0.900" -F "flow_shift=5.0" \
  -F 'extra_params={"sample_solver":"euler"}' -F "seed=42"

# 轮询任务状态，直到 status == completed
video_id=$(echo "$create_response" | jq -r '.id')
curl -s "http://localhost:8091/v1/videos/${video_id}"

# 下载生成结果
curl -L "http://localhost:8091/v1/videos/${video_id}/content" -o wan22_t2v_output.mp4
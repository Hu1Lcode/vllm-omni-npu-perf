#!/usr/bin/env bash
# ============================================================
# Wan2.2-TI2V-5B —— 部署推理脚本
# 系列: Wan 2.2 系列 ｜ 组织: Wan-AI ｜ 仓库: Wan-AI/Wan2.2-TI2V-5B-Diffusers
# 任务: 文生视频 / 图生视频
# 由 scripts/generate_scripts.py 从 assets/js/data.js 自动生成；
# 可直接编辑本文件——页面（经 server.py）会同步显示修改；
# 也可改 data.js 的 serve 字段后重新生成覆盖本文件。
# ============================================================

# ---------- 部署推理服务 · vllm serve ----------
export PYTORCH_NPU_ALLOC_CONF=expandable_segments:True
export TASK_QUEUE_ENABLE=2
export MINDIE_SD_FA_TYPE=ascend_laser_attention  

# 5B 稠密模型，单卡即可启动
vllm serve Wan-AI/Wan2.2-TI2V-5B-Diffusers \
  --omni --port 8091

# ---------- 客户端调用 · /v1/videos（图生视频示例） ----------
curl -X POST http://localhost:8091/v1/videos \
  -F "prompt=The cat turns its head to look at the camera" \
  -F "input_reference=@/path/to/cat.png" \
  -F "width=832" -F "height=480" -F "num_frames=121" -F "fps=24" \
  -F "num_inference_steps=50" \
  -F "guidance_scale=5.0" \
  -F "flow_shift=5.0" \
  -F "seed=42"

# 纯文生视频时省略 input_reference 字段即可；参数以官方文档为准


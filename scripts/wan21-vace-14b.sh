#!/usr/bin/env bash
# ============================================================
# Wan2.1-VACE-14B —— 部署推理脚本
# 系列: Wan 2.1 系列 ｜ 组织: Wan-AI ｜ 仓库: Wan-AI/Wan2.1-VACE-14B-diffusers
# 任务: 文生视频 / 图生视频
# 由 scripts/generate_scripts.py 从 assets/js/data.js 自动生成；
# 可直接编辑本文件——页面（经 server.py）会同步显示修改；
# 也可改 data.js 的 serve 字段后重新生成覆盖本文件。
# ============================================================

# ---------- 离线推理示例（官方 recipe） ----------
python examples/offline_inference/text_to_video/text_to_video.py \
  --model Wan-AI/Wan2.1-VACE-14B-diffusers \
  --prompt "A sleek, humanoid robot stands in a vast warehouse filled with neatly stacked cardboard boxes." \
  --seed 0 \
  --height 480 --width 832 --num-frames 81 --num-inference-steps 30 \
  --guidance-scale 5.0 --flow-shift 5.0 --vae-use-tiling --enable-layerwise-offload \
  --output t2v.mp4

# 注: 官方 recipe 未提供专用 serve 命令；在线服务使用标准 --omni 入口（vllm serve Wan-AI/Wan2.1-VACE-14B-diffusers --omni）。


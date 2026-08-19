#!/usr/bin/env bash
# ============================================================
# Wan2.1-I2V-14B-480P —— 部署推理脚本
# 系列: Wan 2.1 系列 ｜ 组织: Wan-AI ｜ 仓库: Wan-AI/Wan2.1-I2V-14B-480P
# 任务: 图生视频
# 由 scripts/generate_scripts.py 从 assets/js/data.js 自动生成；
# 可直接编辑本文件——页面（经 server.py）会同步显示修改；
# 也可改 data.js 的 serve 字段后重新生成覆盖本文件。
# ============================================================

# ---------- 部署推理服务 · vllm serve ----------
# 基础启动（HF 仓库）
vllm serve Wan-AI/Wan2.1-I2V-14B-480P --omni --port 8091

# 多卡示例（tp2sp2cfg2，参照本地实测）
vllm serve /path/to/Wan2.1-I2V-14B-480P --omni \
  --port 8091 \
  --usp 2 --cfg-parallel-size 2 \
  --vae-patch-parallel-size 8 --vae-use-tiling

# 注: 官方文档未提供 Wan2.1-I2V 的 serve 示例（矩阵未列出），命令参照 Wan2.1-T2V 模式；参数以本地实测为准，可直接编辑 scripts/wan21-i2v-480p.sh 同步页面。

# ---------- 客户端调用 · /v1/videos（图生视频） ----------
curl -X POST http://localhost:8091/v1/videos \
  -F "prompt=The cat turns its head to look at the camera" \
  -F "input_reference=@/path/to/reference.png" \
  -F "width=832" -F "height=480" -F "num_frames=33" -F "fps=16" \
  -F "num_inference_steps=40" -F "guidance_scale=5.0" \
  -F "flow_shift=5.0" -F "seed=42"


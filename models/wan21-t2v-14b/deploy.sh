#!/usr/bin/env bash
# ============================================================
# Wan2.1-T2V-14B —— 部署推理脚本
# 系列: Wan 2.1 系列 ｜ 组织: Wan-AI ｜ 仓库: Wan-AI/Wan2.1-T2V-14B-Diffusers
# 任务: 文生视频
# 由 generate_models.py 从 assets/js/data.js 自动生成；
# 可直接编辑本文件——页面（经 server.py）会同步显示修改；
# 也可改 data.js 的 serve 字段后重新生成覆盖本文件。
# ============================================================

# ---------- 部署推理服务 · vllm serve ----------
# 基础启动
vllm serve Wan-AI/Wan2.1-T2V-14B-Diffusers --omni --port 8091

# 显存受限时可追加逐层卸载
#   --enable-layerwise-offload

# 注: 官方在线服务示例页的完整命令以 Wan2.2 为例，Wan2.1 使用同一 WanPipeline 入口；参数以官方文档为准。

# ---------- 客户端调用 · /v1/videos（异步任务） ----------
curl -X POST http://localhost:8091/v1/videos \
  -F "prompt=A cinematic view of a futuristic city at sunset" \
  -F "width=832" -F "height=480" -F "num_frames=33" -F "fps=16" \
  -F "negative_prompt=low quality, blurry, static" \
  -F "num_inference_steps=40" -F "guidance_scale=5.0" \
  -F "flow_shift=5.0" -F "seed=42"

# 创建后轮询 GET /v1/videos/{id} 至 completed，再下载
#   curl -L http://localhost:8091/v1/videos/{id}/content -o out.mp4


#!/usr/bin/env bash
# ============================================================
# Wan2.1-I2V-14B-480P —— 部署推理脚本
# 系列: Wan 2.1 系列 ｜ 组织: Wan-AI ｜ 仓库: Wan-AI/Wan2.1-I2V-14B-480P
# 任务: 图生视频
# 由 generate_models.py 从 assets/js/data.js 自动生成；
# 可直接编辑本文件——页面（经 server.py）会同步显示修改；
# 也可改 data.js 的 serve 字段后重新生成覆盖本文件。
# ============================================================

# ---------- 部署推理服务 · vllm serve ----------
export PYTORCH_NPU_ALLOC_CONF=expandable_segments:True
export TASK_QUEUE_ENABLE=2
# 基础启动（HF 仓库）
vllm serve Wan-AI/Wan2.1-I2V-14B-480P --omni --port 8091

# 基础启动
vllm serve Wan-AI/Wan2.1-I2V-14B-480P-Diffusers \
  --omni --port 8091

# cfg2tp2sp2 cfg2sp4
vllm serve Wan-AI/Wan2.1-I2V-14B-480P-Diffusers --omni \
  --port 8091 \
  --tensor-parallel-size 2 \
  --usp 4 \
  --ring 1\
  --cfg-parallel-size 2 \
  --vae-use-tiling \
  --vae-patch-parallel-size 8 \
  --vae-parallel-mode spatial_shard_width

# 注: 官方文档未提供 Wan2.1-I2V 的 serve 示例（矩阵未列出），命令参照 Wan2.1-T2V 模式；参数以本地实测为准，可直接编辑 scripts/wan21-i2v-480p.sh 同步页面。

# ---------- 客户端调用 · /v1/videos（异步任务） ----------
curl -X POST http://localhost:8091/v1/videos \
  -F "prompt=The cat turns its head to look at the camera" \
  -F "input_reference=@/home/wjh/vllm-omni-npu-showcase/cat.jpg" \
  -F "width=832" -F "height=480" -F "num_frames=81" -F "fps=16" \
  -F "negative_prompt=low quality, blurry, static" \
  -F "num_inference_steps=40" -F "guidance_scale=5.0" \
  -F "flow_shift=5.0" -F "seed=42"

# 创建后轮询 GET /v1/videos/{id} 至 completed，再下载
   curl -L http://localhost:8091/v1/videos/{id}/content -o out.mp4


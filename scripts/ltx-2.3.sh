#!/usr/bin/env bash
# ============================================================
# LTX-2.3 —— 部署推理脚本
# 系列: LTX 系列 ｜ 组织: Lightricks ｜ 仓库: diffusers/LTX-2.3-Diffusers
# 任务: 文生视频 / 图生视频 / 视频+音频
# 由 scripts/generate_scripts.py 从 assets/js/data.js 自动生成；
# 修改请改 data.js 中该模型的 serve 字段后重新生成。
# ============================================================

# ---------- 部署推理服务 · vllm serve ----------
# one-stage 文生/图生视频（含同步音频）
vllm serve diffusers/LTX-2.3-Diffusers --omni --stage-init-timeout 600

# 两阶段（普通，含上采样器）
vllm serve diffusers/LTX-2.3-Diffusers --omni \
  --model-class-name LTX2TwoStagePipeline \
  --enable-layerwise-offload \
  --stage-init-timeout 600

# 两阶段（全蒸馏）
vllm serve diffusers/LTX-2.3-Distilled-Diffusers --omni \
  --model-class-name LTX2DistilledPipeline --stage-init-timeout 600

# CFG 并行（2 卡）
vllm serve diffusers/LTX-2.3-Diffusers --omni \
  --cfg-parallel-size 2 --stage-init-timeout 600

# 注: 建议 96GB 级 GPU，或使用 CPU/逐层卸载；num_frames 需为 8k+1，两阶段管线尺寸需被 64 整除。官方矩阵未列入 NPU。

# ---------- 客户端调用 · /v1/videos/sync（文生视频） ----------
curl -X POST http://localhost:8000/v1/videos/sync \
  -F "prompt=A cinematic close-up of ocean waves at golden hour." \
  -F "negative_prompt=worst quality, inconsistent motion, blurry, jittery, distorted" \
  -F "size=768x512" \
  -F "num_frames=121" \
  -F "fps=24" \
  -F "seed=42" \
  -o ltx_t2v.mp4

# 图生视频追加一行（与 URL 形式 image_reference 二选一）
#   -F "input_reference=@/absolute/path/to/reference.png"


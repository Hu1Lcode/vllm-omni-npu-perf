#!/usr/bin/env bash
# ============================================================
# LTX-2.3 —— 部署推理脚本
# 系列: LTX 系列 ｜ 组织: Lightricks ｜ 仓库: diffusers/LTX-2.3-Diffusers
# 任务: 文生视频 / 图生视频 / 视频+音频
# 由 generate_models.py 从 assets/js/data.js 自动生成；
# 可直接编辑本文件——页面（经 server.py）会同步显示修改；
# 也可改 data.js 的 serve 字段后重新生成覆盖本文件。
# ============================================================

# ---------- 部署推理服务 · vllm serve ----------
export PYTORCH_NPU_ALLOC_CONF=expandable_segments:True
export TASK_QUEUE_ENABLE=2
# one-stage 文生/图生视频（含同步音频）
vllm serve diffusers/LTX-2.3-Diffusers --omni --stage-init-timeout 600

# 两阶段（普通，含上采样器）
vllm serve diffusers/LTX-2.3-Diffusers --omni \
  --model-class-name LTX2TwoStagePipeline \
  --enable-layerwise-offload \
  --stage-init-timeout 600

# 两阶段（全蒸馏；LTX2DistilledPipeline 为已废弃别名）
vllm serve diffusers/LTX-2.3-Distilled-Diffusers --omni \
  --model-class-name LTX2DistilledTwoStagePipeline --stage-init-timeout 600

# CFG 并行（2 卡）
vllm serve diffusers/LTX-2.3-Diffusers --omni \
  --cfg-parallel-size 2 --stage-init-timeout 600

# 注: 建议 96GB 级 GPU，或使用 CPU/逐层卸载；num_frames 需为 8k+1，两阶段管线尺寸需被 64 整除。官方矩阵未列入 NPU。

# ---------- 客户端调用 · /v1/videos/sync（T2V / I2V） ----------
# T2V（文生视频）
curl -X POST http://localhost:8000/v1/videos/sync \
  -F "prompt=A cinematic close-up of ocean waves at golden hour." \
  -F "negative_prompt=worst quality, inconsistent motion, blurry, jittery, distorted" \
  -F "size=768x512" -F "num_frames=121" -F "fps=24" -F "seed=42" \
  -o ltx_t2v.mp4

# I2V（恰好一张初始图；URL 引用用 image_reference，不可同时给）
curl -X POST http://localhost:8000/v1/videos/sync \
  -F "prompt=A plush toy astronaut gently waving while the camera slowly pushes in." \
  -F "negative_prompt=worst quality, inconsistent motion, blurry, jittery, distorted" \
  -F "input_reference=@/absolute/path/to/reference.png" \
  -F "size=768x512" -F "num_frames=121" -F "fps=24" -F "seed=42" \
  -o ltx_i2v.mp4

# 注: num_frames 必须为 8k+1（在线 API 默认 1，需显式设置）；视频 CFG 3.0 / 音频 CFG 7.0 可经 extra_params 传（如 video_cfg_scale=3.0、audio_cfg_scale=7.0）。


#!/usr/bin/env bash
# ============================================================
# Wan2.2-I2V-A14B —— 部署推理脚本
# 系列: Wan 2.2 系列 ｜ 组织: Wan-AI ｜ 仓库: Wan-AI/Wan2.2-I2V-A14B-Diffusers
# 任务: 图生视频
# 由 scripts/generate_scripts.py 从 assets/js/data.js 自动生成；
# 可直接编辑本文件——页面（经 server.py）会同步显示修改；
# 也可改 data.js 的 serve 字段后重新生成覆盖本文件。
# ============================================================

# ---------- 部署推理服务 · vllm serve（8 卡 NPU） ----------
export MINDIE_SD_FA_TYPE=ascend_laser_attention   
export MULTI_STREAM_MEMORY_REUSE=2                
export PYTORCH_NPU_ALLOC_CONF=expandable_segments:True
export TASK_QUEUE_ENABLE=2

# 8卡启动
vllm serve Wan-AI/Wan2.2-T2V-A14B-Diffusers \
  --omni --use-hsdp --usp 8 \
  --vae-patch-parallel-size 8 --vae-use-tiling

vllm serve Wan-AI/Wan2.2-T2V-A14B-Diffusers \
  --omni --use-hsdp --hsdp-shard-size 4 \
  --usp 4 \
  --cfg-parallel-size 2 \
  --vae-patch-parallel-size 8 --vae-use-tiling

# 官方模型（含 CFG）：--usp 4 --cfg-parallel-size 2（usp × cfg = 8 卡）

# ---------- 客户端调用 · /v1/videos（图生视频） ----------
curl -X POST http://localhost:8091/v1/videos \
  -F "prompt=A bear playing with yarn, smooth motion" \
  -F "input_reference=@/path/to/qwen-bear.png" \
  -F "width=832" -F "height=480" -F "num_frames=81" -F "fps=16" \
  -F "num_inference_steps=40" \
  -F "guidance_scale=3.5" -F "guidance_scale_2=3.5" \
  -F "boundary_ratio=0.900" -F "flow_shift=5.0" \
  -F 'extra_params={"sample_solver":"euler"}' -F "seed=42"

# 蒸馏/Lightning 权重使用 sample_solver=euler，官方权重默认 unipc


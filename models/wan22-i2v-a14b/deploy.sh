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
# 前置依赖：安装 mindie-sd 融合算子库（fused adalayernorm 等，详见官方 NPU recipe）
#   git clone https://gitcode.com/Ascend/MindIE-SD.git && cd MindIE-SD
#   python setup.py bdist_wheel && cd dist && pip install mindiesd-*.whl

# 蒸馏版（无 CFG）· 8 卡 NPU
export MINDIE_SD_FA_TYPE=ascend_laser_attention   # Laser Attention，720P 约 40% 加速
export MULTI_STREAM_MEMORY_REUSE=2                # HSDP/FSDP2 所需的 NPU workaround
vllm serve --omni Wan-AI/Wan2.2-I2V-A14B-Diffusers \
  --use-hsdp --usp 8 \
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


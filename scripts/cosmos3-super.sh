#!/usr/bin/env bash
# ============================================================
# Cosmos3-Super —— 部署推理脚本
# 系列: Cosmos3 系列 ｜ 组织: nvidia ｜ 仓库: nvidia/Cosmos3-Super
# 任务: 文生图 / 文生视频 / 图生视频 / 视频+音频
# 由 scripts/generate_scripts.py 从 assets/js/data.js 自动生成；
# 可直接编辑本文件——页面（经 server.py）会同步显示修改；
# 也可改 data.js 的 serve 字段后重新生成覆盖本文件。
# ============================================================

# ---------- 部署推理服务 · vllm serve（8 卡 NPU） ----------
# 前置：安装 mindie-sd 融合算子库（gitcode.com/Ascend/MindIE-SD）
export MINDIE_SD_FA_TYPE=ascend_laser_attention

vllm serve nvidia/Cosmos3-Super \
  --omni \
  --host 0.0.0.0 --port 8000 \
  --tensor-parallel-size 8 \
  --model-class-name Cosmos3OmniDiffusersPipeline \
  --no-guardrails \
  --init-timeout 1800

# 注: 官方 NPU recipe（8× Ascend910 A2/A3）验证：T2I 256²/2 步约 1.5s；NPU 上 FP8 量化未验证、--enable-layerwise-offload 未测试。

# ---------- 客户端调用 · /v1/videos/sync（T2V / I2V） ----------
# T2V（1280×720，189 帧，35 步）
curl -sS -X POST http://localhost:8000/v1/videos/sync -H "Accept: video/mp4" \
  -F "model=nvidia/Cosmos3-Super" -F "prompt=A robot arm is cleaning a plate in the kitchen" \
  -F "size=1280x720" -F "num_frames=189" -F "fps=24" -F "num_inference_steps=35" \
  -F "guidance_scale=6.0" -F "max_sequence_length=4096" -F "flow_shift=10.0" \
  -F 'extra_params={"use_resolution_template":false,"use_duration_template":false,"guardrails":false}' \
  -F "seed=17" -o cosmos3_super_t2v.mp4

# I2V（参考图）
curl -sS -X POST http://localhost:8000/v1/videos/sync -H "Accept: video/mp4" \
  -F "model=nvidia/Cosmos3-Super" -F "prompt=The scene comes to life with smooth, natural motion." \
  -F "size=1280x720" -F "num_frames=189" -F "fps=24" -F "num_inference_steps=35" \
  -F "guidance_scale=6.0" -F "max_sequence_length=4096" -F "flow_shift=10.0" \
  -F 'extra_params={"use_resolution_template":false,"use_duration_template":false,"guardrails":false}' \
  -F "seed=1111" -F "input_reference=@/path/to/reference.jpg;type=image/jpeg" \
  -o cosmos3_super_i2v.mp4

# T2V + 声音：追加 -F "generate_sound=true" -F "sound_duration=7.875"
# V2V：input_reference 改为参考视频（type=video/mp4），extra_params 加 condition_frame_indexes_vision / condition_video_keep
# T2I：POST /v1/images/generations（size=1024x1024，50 步，guidance_scale=7.0）

# 注: guardrails 默认开启（需 cosmos-guardrail + HF_TOKEN），--no-guardrails 或 extra_params guardrails:false 关闭；NPU 上 FP8 量化未验证、--enable-layerwise-offload 未测试。


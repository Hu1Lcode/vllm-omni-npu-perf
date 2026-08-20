#!/usr/bin/env bash
# ============================================================
# Cosmos3-Nano —— 部署推理脚本
# 系列: Cosmos3 系列 ｜ 组织: nvidia ｜ 仓库: nvidia/Cosmos3-Nano
# 任务: 文生图 / 文生视频 / 图生视频 / 视频+音频
# 由 scripts/generate_scripts.py 从 assets/js/data.js 自动生成；
# 可直接编辑本文件——页面（经 server.py）会同步显示修改；
# 也可改 data.js 的 serve 字段后重新生成覆盖本文件。
# ============================================================

# ---------- 部署推理服务 · vllm serve（GPU / NPU） ----------
# 1× GPU（H200 141GB / B300）或 1× NPU（Ascend 910B/910C，Atlas A2/A3）
vllm serve nvidia/Cosmos3-Nano \
  --omni \
  --host 0.0.0.0 --port 8000 \
  --init-timeout 1800

# 多卡：GPU 用 --ulysses-degree N 或 --tensor-parallel-size N；NPU 用 --tensor-parallel-size 8
# 显存优化（仅 GPU）：--enable-layerwise-offload、--quantization fp8（720p 峰值 ~50GB → ~36GB）
# 关闭 guardrails：追加 --no-guardrails（需自行确认合规）

# 注: guardrails 默认开启（需 pip install cosmos-guardrail + HF_TOKEN 访问 gated 仓库 nvidia/Cosmos-1.0-Guardrail）；NPU 上 --quantization fp8 与 --enable-layerwise-offload 不支持。官方实测（1× 910B/910C，bf16，无 guardrails）：T2I 1024²/10 步约 8s；T2V 720p/20 步/49 帧约 55s；I2V 约 25s；V2V 480×320 约 12s；720p 峰值显存约 46 GiB（单卡）。

# ---------- 客户端调用 · /v1/images/generations + /v1/videos/sync ----------
# T2I（1024x1024，10 步）
curl -sS -X POST http://localhost:8000/v1/images/generations \
  -H "Content-Type: application/json" \
  -d '{
    "model": "nvidia/Cosmos3-Nano",
    "prompt": "A photorealistic red sports car on a city street at golden hour, cinematic lighting.",
    "negative_prompt": "blurry, distorted, low quality",
    "size": "1024x1024", "n": 1, "response_format": "b64_json",
    "num_inference_steps": 10, "guidance_scale": 7.0, "seed": 42
  }' | python3 -c "import sys,json,base64; open('cosmos3_t2i.png','wb').write(base64.b64decode(json.load(sys.stdin)['data'][0]['b64_json']))"

# T2V（720p，49 帧 @24fps）
curl -sS -X POST http://localhost:8000/v1/videos/sync -H "Accept: video/mp4" \
  -F "model=nvidia/Cosmos3-Nano" -F "prompt=A robot arm is cleaning a plate in the kitchen" \
  -F "negative_prompt=blurry, distorted, low quality, jittery, deformed" \
  -F "size=1280x720" -F "num_frames=49" -F "fps=24" \
  -F "num_inference_steps=20" -F "guidance_scale=6.0" \
  -F "max_sequence_length=4096" -F "flow_shift=10.0" -F "seed=123" \
  -o cosmos3_t2v.mp4

# I2V（参考图）
curl -sS -X POST http://localhost:8000/v1/videos/sync -H "Accept: video/mp4" \
  -F "model=nvidia/Cosmos3-Nano" -F "prompt=The scene comes to life with smooth, natural motion." \
  -F "size=1280x720" -F "num_frames=25" -F "fps=8" \
  -F "num_inference_steps=10" -F "guidance_scale=6.0" -F "seed=42" \
  -F "input_reference=@reference.jpg;type=image/jpeg" \
  -o cosmos3_i2v.mp4

# V2V（参考视频）
curl -sS -X POST http://localhost:8000/v1/videos/sync -H "Accept: video/mp4" \
  -F "model=nvidia/Cosmos3-Nano" -F "prompt=Continue the same scene with smooth natural motion and consistent subjects." \
  -F "size=1280x720" -F "num_frames=17" -F "fps=5" \
  -F "num_inference_steps=10" -F "guidance_scale=6.0" -F "seed=42" \
  -F "input_reference=@reference.mp4;type=video/mp4" \
  -o cosmos3_v2v.mp4

# 注: T2V + 声音：追加 -F \


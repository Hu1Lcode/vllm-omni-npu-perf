#!/usr/bin/env bash
# ============================================================
# MiniMax-H3 —— 部署推理脚本
# 系列: MiniMax H3 系列 ｜ 组织: MiniMaxAI ｜ 仓库: MiniMaxAI/MiniMax-H3
# 任务: 文生视频 / 图生视频 / 视频+音频
# 由 scripts/generate_scripts.py 从 assets/js/data.js 自动生成；
# 可直接编辑本文件——页面（经 server.py）会同步显示修改；
# 也可改 data.js 的 serve 字段后重新生成覆盖本文件。
# ============================================================

# ---------- 部署推理服务 · vllm serve（8 卡 NPU · Atlas 800I A3） ----------
# 前置依赖：安装 mindie-sd 融合算子库（fused adalayernorm + RainFusion rf_v2 内核）
# 环境：Atlas 800I A3 · CANN 9.0.1 · torch_npu 2.10.0.post2 · 768P
# 模型需 HuggingFace 授权：hf auth login

export ASCEND_RT_VISIBLE_DEVICES=0,1,2,3,4,5,6,7
export VLLM_WORKER_MULTIPROC_METHOD=spawn
export VLLM_OMNI_VIDEO_SYNC_TIMEOUT=1800
export PYTHONDONTWRITEBYTECODE=1

vllm serve MiniMaxAI/MiniMax-H3 \
  --omni \
  --host 0.0.0.0 \
  --port 9098 \
  --trust-remote-code \
  --num-gpus 8 \
  --usp 8 \
  --ring 1 \
  --text-encoder-tp-size 8 \
  --enable-distributed-layerwise-offload \
  --vae-parallel-mode tile \
  --vae-use-tiling \
  --vae-patch-parallel-size 8 \
  --diffusion-attention-backend FLASH_ATTN

# 注: 可选优化：--diffusion-attention-backend RAINFUSION_ATTN（保持 --ring 1）、export MINDIE_SD_FA_TYPE=ascend_laser_attention、T2VA 可用 --quantization int8；HSDP 需配合 export MULTI_STREAM_MEMORY_REUSE=2。注意：不要加 --enforce-eager（regional compile 会在首个请求时预热）；CFG 已蒸馏，--cfg-parallel-size 必须保持 1。

# ---------- 客户端调用 · /v1/videos/sync（t2va / fl2va / ref2va） ----------
export API_URL="http://127.0.0.1:9098/v1/videos/sync"

# T2VA（文生视频+音频）
curl -sS -X POST "${API_URL}" \
  -F 'prompt=In a snowy blue-purple forest, Ori carefully walks past a sleeping giant; footsteps crunch in the snow while the creature breathes and softly snorts.' \
  -F 'width=1344' -F 'height=768' -F 'aspect_ratio=16:9' -F 'fps=24' \
  -F 'num_inference_steps=50' -F 'flow_shift=12' -F 'seed=1101' \
  -F 'extra_params={"task":"t2va","duration":8.7,"audio_flow_shift":3.0}' \
  -o t2va.mp4

# FL2VA（首帧驱动）：先 export FIRST_FRAME=/path/to/first_frame.png
curl -sS -X POST "${API_URL}" \
  -F 'prompt=A man stands beside a yellow car at night. The car drives away; he follows it with his eyes and begins singing sadly, with synchronized voice and city ambience.' \
  -F 'fps=24' -F 'num_inference_steps=50' -F 'flow_shift=12' -F 'seed=2101' \
  -F 'extra_params={"task":"fl2va","duration":8.7,"audio_flow_shift":3.0}' \
  -F "input_reference=@${FIRST_FRAME};type=image/png" \
  -o fl2va.mp4

# REF2VA（参考图 + 音频）：音频需先起本地静态服务提供 URL
curl -sS -X POST "${API_URL}" \
  -F 'prompt=A white cat with black mustache and eyebrow markings sits on a beige couch, lip-syncing precisely to the complete reference audio.' \
  -F 'width=1344' -F 'height=768' -F 'fps=24' -F 'num_inference_steps=50' -F 'flow_shift=12' -F 'seed=3101' \
  -F 'extra_params={"task":"ref2va","duration":15.0,"audio_flow_shift":3.0}' \
  -F "input_reference=@${REF_IMAGE};type=image/png" \
  -F "audio_reference={\"audio_url\":\"${AUDIO_URL}\"}" \
  -o ref2va.mp4

# 注: 首尾帧 FL2VA：两个 input_references + extra_params frame_indices=[0,-1]；Ref2VA 引用上限：图像≤9、视频≤3、音频≤3、总数≤12；duration 4~15s、fps 固定 24。


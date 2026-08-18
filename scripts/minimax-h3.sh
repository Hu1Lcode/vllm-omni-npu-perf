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

# 注: 可选优化：--diffusion-attention-backend RAINFUSION_ATTN（保持 --ring 1）、export MINDIE_SD_FA_TYPE=ascend_laser_attention、T2VA 可用 --quantization int8。注意：不要加 --enforce-eager（regional compile 会在首个请求时预热）；CFG 已蒸馏，--cfg-parallel-size 必须保持 1。

# ---------- 客户端调用 · /v1/videos/sync（t2va 文生视频+音频） ----------
export API_URL="http://127.0.0.1:9098/v1/videos/sync"
curl -sS -X POST "${API_URL}" \
  -F 'prompt=In a snowy blue-purple forest, Ori carefully walks past a sleeping giant...' \
  -F 'width=1344' -F 'height=768' -F 'aspect_ratio=16:9' -F 'fps=24' \
  -F 'num_inference_steps=50' -F 'flow_shift=12' -F 'seed=1101' \
  -F 'extra_params={"task":"t2va","duration":8.7,"audio_flow_shift":3.0}' \
  -o t2va.mp4

# 注: fl2va：加 -F 'input_reference=@首帧.png;type=image/png'（首尾帧可用多个 input_references + frame_indices=[0,-1]）；ref2va：图片/视频参考（input_reference，可重复）+ 可选音频参考 -F 'audio_reference={\


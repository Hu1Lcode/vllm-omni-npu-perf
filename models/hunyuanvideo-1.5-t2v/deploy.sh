#!/usr/bin/env bash
# ============================================================
# HunyuanVideo-1.5-T2V —— 部署推理脚本
# 系列: HunyuanVideo 系列 ｜ 组织: hunyuanvideo-community ｜ 仓库: hunyuanvideo-community/HunyuanVideo-1.5-Diffusers-480p_t2v
# 任务: 文生视频
# 由 generate_models.py 从 assets/js/data.js 自动生成；
# 可直接编辑本文件——页面（经 server.py）会同步显示修改；
# 也可改 data.js 的 serve 字段后重新生成覆盖本文件。
# ============================================================

# ---------- 部署推理服务 · vllm serve ----------
export PYTORCH_NPU_ALLOC_CONF=expandable_segments:True
export TASK_QUEUE_ENABLE=2
# 480p（默认）
vllm serve /mnt/sfs_turbo/wjh/HunyuanVideo-1.5-Diffusers-480p_t2v --omni \
  --port 12315 --vae-use-slicing --vae-use-tiling


# ---------- 客户端调用 · /v1/videos（异步任务） ----------
curl -sS -X POST "http://localhost:12315/v1/videos" \
  -H "Accept: application/json" \
  -F "prompt=A little girl wearing a straw hat runs through a summer meadow full of wildflowers. A wide shot is used, with the camera panning right to follow her." \
  -F "size=832x480" -F "num_frames=81" -F "fps=16" \
  -F "num_inference_steps=30" -F "guidance_scale=6.0" \
  -F "flow_shift=5.0" -F "seed=42"

# 轮询 GET /v1/videos/{id} 至 completed，再 GET /v1/videos/{id}/content 下载


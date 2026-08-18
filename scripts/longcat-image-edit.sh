#!/usr/bin/env bash
# ============================================================
# LongCat-Image-Edit —— 部署推理脚本
# 系列: LongCat-Image 系列 ｜ 组织: meituan-longcat ｜ 仓库: meituan-longcat/LongCat-Image-Edit
# 任务: 图像编辑
# 由 scripts/generate_scripts.py 从 assets/js/data.js 自动生成；
# 修改请改 data.js 中该模型的 serve 字段后重新生成。
# ============================================================

# ---------- 部署推理服务 · vllm serve ----------
# 标准 --omni 入口（e2e 测试同款，可选加速参数）
vllm serve meituan-longcat/LongCat-Image-Edit --omni --port 8092 \
  --cache-backend cache_dit --ulysses-degree 2

# 可选：--enable-cpu-offload（e2e 测试中亦使用）

# 注: 官方未提供专属 serve 文档；以下命令组合来自官方 recipe 与 e2e 测试。支持状态以官方矩阵（NPU ✓）为准。

# ---------- 离线推理示例（官方 recipe） ----------
python3 ./examples/offline_inference/image_to_image/image_edit.py \
    --image qwen_bear.png \
    --prompt "Add a white art board written with colorful text 'vLLM-Omni' on grassland. Add a paintbrush in the bear's hands." \
    --output output_image_edit.png \
    --num_inference_steps 50 \
    --guidance_scale 4.5 \
    --seed 42 \
    --model meituan-longcat/LongCat-Image-Edit \
    --cache_backend cache_dit \
    --cache_dit_max_continuous_cached_steps 2

# ---------- 客户端调用 · /v1/images/edits（图像编辑） ----------
curl -X POST http://localhost:8092/v1/images/edits \
  -F "model=meituan-longcat/LongCat-Image-Edit" \
  -F "image=@./input.png" \
  -F "prompt=Convert this image to watercolor style" \
  -F "size=1024x1024" \
  -F "output_format=png"

# 响应 .data[0].b64_json 为编辑后的图像（参数以官方图像编辑 API 文档为准）


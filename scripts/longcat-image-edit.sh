#!/usr/bin/env bash
# ============================================================
# LongCat-Image-Edit —— 部署推理脚本
# 系列: LongCat-Image 系列 ｜ 组织: meituan-longcat ｜ 仓库: meituan-longcat/LongCat-Image-Edit
# 任务: 图像编辑
# 由 scripts/generate_scripts.py 从 assets/js/data.js 自动生成；
# 可直接编辑本文件——页面（经 server.py）会同步显示修改；
# 也可改 data.js 的 serve 字段后重新生成覆盖本文件。
# ============================================================

# ---------- 部署推理服务 · vllm serve ----------
# 标准 --omni 入口（e2e 测试同款，可选加速参数）
vllm serve meituan-longcat/LongCat-Image-Edit --omni --port 8092 

# 可选：--enable-cpu-offload（e2e 测试中亦使用）

# ---------- 客户端调用 · /v1/images/edits（图像编辑） ----------
curl -X POST http://localhost:8092/v1/images/edits \
  -F "model=meituan-longcat/LongCat-Image-Edit" \
  -F "image=@./input.png" \
  -F "prompt=Convert this image to watercolor style" \
  -F "guidance_scale=4.5" \
  -F "size=1024x1024" \
  -F "output_format=png"

# 响应 .data[0].b64_json 为编辑后的图像（参数以官方图像编辑 API 文档为准）


#!/usr/bin/env bash
# ============================================================
# LongCat-Image-Edit —— 部署推理脚本
# 系列: LongCat-Image 系列 ｜ 组织: meituan-longcat ｜ 仓库: meituan-longcat/LongCat-Image-Edit
# 任务: 图像编辑
# 由 generate_models.py 从 assets/js/data.js 自动生成；
# 可直接编辑本文件——页面（经 server.py）会同步显示修改；
# 也可改 data.js 的 serve 字段后重新生成覆盖本文件。
# ============================================================

# ---------- 部署推理服务 · vllm serve ----------
export PYTORCH_NPU_ALLOC_CONF=expandable_segments:True
export TASK_QUEUE_ENABLE=2
# 标准 --omni 入口（e2e 测试同款，可选加速参数）
vllm serve meituan-longcat/LongCat-Image-Edit --omni --port 8091 --vae-use-slicing --vae-use-tiling

# ---------- 客户端调用 · /v1/images/edits（图像编辑） ----------
curl -s http://localhost:8091/v1/images/edits \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":[
        {"type":"text","text":"将图中的猫换成小狗"},
        {"type":"image_url","image_url":{"url":"/home/wjh/vllm-omni-npu-showcase/cat.jpg"}}]}],
      "extra_body":{"height":1024,"width":1024,"num_inference_steps":50,"guidance_scale":4.5,"seed":42}}' \
  | jq -r '.choices[0].message.content[0].image_url.url' | cut -d',' -f2 | base64 -d > output.png


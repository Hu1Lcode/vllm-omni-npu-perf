#!/usr/bin/env bash
# ============================================================
# LongCat-Image —— 部署推理脚本
# 系列: LongCat-Image 系列 ｜ 组织: meituan-longcat ｜ 仓库: meituan-longcat/LongCat-Image
# 任务: 文生图
# 由 scripts/generate_scripts.py 从 assets/js/data.js 自动生成；
# 可直接编辑本文件——页面（经 server.py）会同步显示修改；
# 也可改 data.js 的 serve 字段后重新生成覆盖本文件。
# ============================================================

# ---------- 部署推理服务 · vllm serve ----------
# 标准 --omni 入口（官方暂无专属 serve 文档）
vllm serve meituan-longcat/LongCat-Image --omni --port 8091

# 注: 官方未提供该模型的专属 serve 命令与 NPU 专项说明；支持状态以官方矩阵（NPU ✓）为准，参数以官方文档为准。

# ---------- 客户端调用 · /v1/images/generations ----------
curl -X POST http://localhost:8091/v1/images/generations \
  -H "Content-Type: application/json" \
  -d '{"model": "meituan-longcat/LongCat-Image", "prompt": "a cute cat on the grass", "size": "1024x1024", "seed": 42}' \
  | jq -r '.data[0].b64_json' | base64 -d > cat.png


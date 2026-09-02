#!/usr/bin/env bash
# ============================================================
# Qwen-Image-Layered —— 部署推理脚本
# 系列: Qwen-Image 系列 ｜ 组织: Qwen ｜ 仓库: Qwen/Qwen-Image-Layered
# 任务: 图像编辑
# 由 generate_models.py 从 assets/js/data.js 自动生成；
# 可直接编辑本文件——页面（经 server.py）会同步显示修改；
# 也可改 data.js 的 serve 字段后重新生成覆盖本文件。
# ============================================================

# ---------- 部署推理服务 · vllm serve ----------
export PYTORCH_NPU_ALLOC_CONF=expandable_segments:True
export TASK_QUEUE_ENABLE=2
vllm serve Qwen/Qwen-Image-Layered \
     --vae-parallel-mode tile \
     --vae-use-tiling \
     --omni \
     --port 8091

# ---------- 客户端调用 · /v1/chat/completions（图层分解） ----------
import base64
import requests

with open("input.png", "rb") as f:
    img_b64 = base64.b64encode(f.read()).decode()

payload = {
    "messages": [{
        "role": "user",
        "content": [
            {"type": "image_url", "image_url": {
                "url": f"data:image/png;base64,{img_b64}"
            }},
            {"type": "text", "text": "a rabbit"},
        ],
    }],
    "extra_body": {
        "num_inference_steps": 50,
        "cfg_scale": 4.0,
        "seed": 0,
        "layers": 3,
        "resolution": 640,
    },
}

resp = requests.post(
    "http://localhost:8091/v1/chat/completions",
    json=payload,
    timeout=600,
)
data = resp.json()

for i, item in enumerate(data["choices"][0]["message"]["content"]):
    _, b64_data = item["image_url"]["url"].split(",", 1)
    with open(f"layer_{i}.png", "wb") as f:
        f.write(base64.b64decode(b64_data))



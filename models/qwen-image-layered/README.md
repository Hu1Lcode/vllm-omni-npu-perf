# Qwen-Image-Layered

| 项目 | 信息 |
| --- | --- |
| 系列 | Qwen-Image 系列 |
| 组织 | Qwen |
| 任务 | 图像编辑 |
| 模型参数量 | DiT 20B（多层 RGBA 潜变量输出，逐层 VAE 解码） |
| NPU 支持 | 支持 |
| 模型权重 | [HuggingFace](https://huggingface.co/Qwen/Qwen-Image-Layered) · [ModelScope](https://modelscope.cn/models/Qwen/Qwen-Image-Layered) |

## 模型介绍

**Qwen-Image-Layered** 是 Qwen-Image 的图层分解版本（2025 年 12 月）：将输入图像分解为 **RGBA 分层图层**（默认 4 层），每层输出独立的透明 PNG，便于二次创作。

官方支持矩阵标注其在昇腾 NPU 上**支持**。

## 模型结构

在 Qwen-Image 主干的输出端增加分层预测：DiT 输出多层 RGBA 潜变量，逐层经 VAE 解码为带透明通道的图像。

数据流：输入图像（VAE 编码）→ DiT → 多层 RGBA → VAE 解码 → 各层透明 PNG。

## 参考资料

- [vLLM-Omni 文档 · 图像编辑 API](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/serving/image_edit_api/)
- [支持模型矩阵](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/)


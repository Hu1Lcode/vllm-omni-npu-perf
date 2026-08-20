# Qwen-Image-Edit-2511

| 项目 | 信息 |
| --- | --- |
| 系列 | Qwen-Image 系列 |
| 组织 | Qwen |
| 任务 | 图像编辑 |
| 模型参数量 | DiT 20B（多参考图像条件注入，内置 LoRA 风格能力） |
| NPU 支持 | 支持 |
| 模型权重 | [HuggingFace](https://huggingface.co/Qwen/Qwen-Image-Edit-2511) · [ModelScope](https://modelscope.cn/models/Qwen/Qwen-Image-Edit-2511) |

## 模型介绍

**Qwen-Image-Edit-2511** 是 Qwen-Image 多图编辑的增强版本（2025 年 11 月）：进一步提升编辑一致性，并内置 LoRA 风格支持。

官方支持矩阵标注其在昇腾 NPU 上**支持**。

## 模型结构

与 Qwen-Image-Edit-2509 相同的多参考图像条件 DiT 架构，权重更新并内置 LoRA 风格能力。

数据流：多张参考图像（VAE 编码）+ 文本指令 → DiT → VAE 解码 → 编辑图像。

## 参考资料

- [vLLM-Omni 文档 · 图像编辑 API](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/serving/image_edit_api/)
- [支持模型矩阵](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/)


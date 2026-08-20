# Qwen-Image-2512

| 项目 | 信息 |
| --- | --- |
| 系列 | Qwen-Image 系列 |
| 组织 | Qwen |
| 任务 | 文生图 |
| 模型参数量 | DiT 20B（文本编码器 + DiT + VAE 文生图管线） |
| NPU 支持 | 暂不支持（官方矩阵暂不支持 NPU） |
| 模型权重 | [HuggingFace](https://huggingface.co/Qwen/Qwen-Image-2512) · [ModelScope](https://modelscope.cn/models/Qwen/Qwen-Image-2512) |

## 模型介绍

**Qwen-Image-2512** 是 Qwen-Image 的 2025 年 12 月更新版本，在真实感、细节与文本渲染上进一步增强。

**注意：**官方支持矩阵中该版本同样仅标注 NVIDIA GPU，**暂不支持 NPU**。

## 模型结构

与 Qwen-Image 相同的 DiT 文生图管线（文本编码器 + DiT + VAE），权重与训练策略更新，支持 CFG。

数据流：文本提示词 → 文本编码器 → DiT 去噪 → VAE 解码 → 图像。

## 参考资料

- [官方 recipe · Qwen-Image-2512](https://github.com/vllm-project/vllm-omni/blob/main/recipes/Qwen/Qwen-Image-2512.md)
- [vLLM-Omni 文档 · 图像生成 API](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/serving/image_generation_api/)
- [recipes.vllm.ai · Qwen-Image](https://recipes.vllm.ai/Qwen/Qwen-Image)
- [支持模型矩阵](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/)


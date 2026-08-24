# Z-Image-Turbo

| 项目 | 信息 |
| --- | --- |
| 系列 | Z-Image 系列 |
| 组织 | Tongyi-MAI |
| 任务 | 文生图 |
| 模型参数量 | 6B（S3-DiT 蒸馏版），4~9 步出图，通常关闭 CFG |
| NPU 支持 | 支持 |
| 模型权重 | [HuggingFace](https://huggingface.co/Tongyi-MAI/Z-Image-Turbo) · [ModelScope](https://modelscope.cn/models/Tongyi-MAI/Z-Image-Turbo) |

## 模型介绍

**Z-Image-Turbo** 是 Z-Image 的蒸馏加速版本：**4~9 步**即可出图（通常关闭 CFG），推理效率大幅提升。

官方支持矩阵标注其在昇腾 NPU 上**支持**（全平台支持）。注意：num_heads=30，仅支持 **tensor_parallel_size=2**。

## 模型结构

与 Z-Image 相同的 DiT 文生图管线（文本编码器 + DiT + VAE），蒸馏后以极少的采样步数出图，通常不应用 CFG。

数据流：文本提示词 → 文本编码器 → DiT 去噪（4~9 步）→ VAE 解码 → 图像。

## 参考资料

- [vLLM-Omni 文档 · 图像生成 API](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/serving/image_generation_api/)
- [vLLM-Omni 文档 · 快速开始](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/getting_started/quickstart/)
- [支持模型矩阵](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/)


# Z-Image

| 项目 | 信息 |
| --- | --- |
| 系列 | Z-Image 系列 |
| 组织 | Tongyi-MAI |
| 任务 | 文生图 |
| 模型参数量 | 6B（S3-DiT 单流 DiT），文本编码器 + DiT + VAE |
| NPU 支持 | 支持 |
| 模型权重 | [HuggingFace](https://huggingface.co/Tongyi-MAI/Z-Image) · [ModelScope](https://modelscope.cn/models/Tongyi-MAI/Z-Image) |

## 模型介绍

**Z-Image** 是 Tongyi-MAI（通义实验室）开源的文生图模型，DiT 架构，图像质量与文本渲染表现优秀。

**注意：**官方支持矩阵中仅列出蒸馏版 Z-Image-Turbo，基础版在 NPU 上的支持状态**待验证**。

## 模型结构

DiT 文生图管线：文本编码器 + DiT + VAE。

数据流：文本提示词 → 文本编码器 → DiT 去噪 → VAE 解码 → 图像。

## 参考资料

- [vLLM-Omni 文档 · 图像生成 API](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/serving/image_generation_api/)
- [支持模型矩阵](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/)


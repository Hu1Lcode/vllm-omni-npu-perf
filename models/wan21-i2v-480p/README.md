# Wan2.1-I2V-14B-480P

| 项目 | 信息 |
| --- | --- |
| 系列 | Wan 2.1 系列 |
| 组织 | Wan-AI |
| 任务 | 图生视频 |
| 模型参数量 | DiT 14B（另有 T5 文本编码器 4.9B、VAE） |
| NPU 支持 | 待验证（官方矩阵未列出，本地实测为准） |
| 模型权重 | [HuggingFace](https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-480P) · [ModelScope](https://modelscope.cn/models/Wan-AI/Wan2.1-I2V-14B-480P) |

## 模型介绍

**Wan2.1-I2V-14B-480P** 是 Wan 2.1 的图生视频模型：输入一张参考图像 + 文本提示词，生成与之语义一致的 480P 视频。

**注意：**官方 vllm-omni 支持矩阵未列出 Wan2.1-I2V（图生视频仅记录 Wan2.2-I2V-A14B），本站在 NPU 上的支持状态以**本地实测为准**。

## 模型结构

与 Wan2.1-T2V 相同的 3D 因果视频 VAE + T2V 文本编码器 + DiT 主干（Flow Matching 调度），差异在于参考图像经 VAE 编码后作为条件注入。

数据流：参考图像（VAE 编码）+ 文本提示词 → DiT 去噪 → VAE 解码 → 视频帧。

## 参考资料

- [HuggingFace · Wan2.1-I2V-14B-480P](https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-480P)
- [支持模型矩阵](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/)


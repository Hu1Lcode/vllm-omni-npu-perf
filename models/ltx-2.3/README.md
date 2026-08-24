# LTX-2.3

| 项目 | 信息 |
| --- | --- |
| 系列 | LTX 系列 |
| 组织 | Lightricks |
| 任务 | 文生视频 / 图生视频 / 视频+音频 |
| 模型参数量 | 22B（MoE Transformer + Gemma 文本编码器 + 视频 VAE + 音频 VAE + Vocoder） |
| NPU 支持 | 支持 |
| 模型权重 | [HuggingFace](https://huggingface.co/diffusers/LTX-2.3-Diffusers) · [ModelScope](https://modelscope.cn/models/Lightricks/LTX-2.3) |

## 模型介绍

**LTX-2.3** 是 Lightricks 发布的视频生成模型：同时支持文生视频与图生视频，并生成**同步音频**。提供三种管线：one-stage、两阶段（含 LoRA 上采样）、全蒸馏两阶段。

**注意：**官方支持矩阵仅标注 NVIDIA GPU 与 AMD GPU，**暂未列入 NPU**。默认 768×512、121 帧 @ 24 FPS，LTX-2.3 默认 30 步，视频 CFG 3.0 / 音频 CFG 7.0。

## 模型结构

22B MoE Transformer + Gemma 文本编码器 + 视频 VAE + 音频 VAE + Vocoder：视频与音频同步生成；支持 STG 与跨模态引导。

数据流：文本（+ 可选参考图）→ 文本编码器 → Transformer 去噪 → 视频 VAE 解码 + 音频 Vocoder → 音画同步视频。

## 参考资料

- [官方 recipe · LTX-2](https://github.com/vllm-project/vllm-omni/blob/main/recipes/LTX/LTX-2.md)
- [支持模型矩阵](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/)


# Wan2.2-TI2V-5B

| 项目 | 信息 |
| --- | --- |
| 系列 | Wan 2.2 系列 |
| 组织 | Wan-AI |
| 任务 | 文生视频 / 图生视频 |
| 模型参数量 | DiT 5B（稠密，统一 T2V + I2V） |
| NPU 支持 | 支持 |
| 模型权重 | [HuggingFace](https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers) · [ModelScope](https://modelscope.cn/models/Wan-AI/Wan2.2-TI2V-5B-Diffusers) |

## 模型介绍

**Wan2.2-TI2V-5B** 是 Wan 2.2 的统一视频生成模型：同一个 5B 稠密模型同时支持文生视频与图生视频（可选参考图像输入），体量小、显存占用低，适合受限硬件部署。

官方支持矩阵标注其在昇腾 NPU 上支持。

## 模型结构

5B 稠密 DiT + Wan2.2 VAE + T2V 文本编码器；图生视频模式下参考图像经 VAE 编码后作为条件注入。支持 CFG 与 Flow Matching 调度。

数据流：文本提示词（+ 可选参考图像）→ DiT → VAE 解码 → 视频帧。

## 参考资料

- [vLLM-Omni 文档 · 视频生成 API](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/serving/videos_api/)
- [支持模型矩阵](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/)


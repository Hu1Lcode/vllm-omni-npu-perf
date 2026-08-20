# Wan2.1-T2V-1.3B

| 项目 | 信息 |
| --- | --- |
| 系列 | Wan 2.1 系列 |
| 组织 | Wan-AI |
| 任务 | 文生视频 |
| 模型参数量 | DiT 1.3B（另有 T5 文本编码器 4.9B、VAE） |
| NPU 支持 | 支持 |
| 模型权重 | [HuggingFace](https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers) · [ModelScope](https://modelscope.cn/models/Wan-AI/Wan2.1-T2V-1.3B-Diffusers) |

## 模型介绍

Wan 2.1 是阿里万相团队发布的视频生成基础模型。**Wan2.1-T2V-1.3B** 是其轻量文生视频版本：1.3B 稠密 DiT，支持中英文提示词，显存占用低，适合资源受限场景与快速验证。

官方支持矩阵标注其在昇腾 NPU 上**支持**（与 Wan2.2-T2V 共用 WanPipeline 入口）。

## 模型结构

3D 因果视频 VAE + T2V 文本编码器 + DiT 主干，采用 Flow Matching 调度（flow_shift）。

数据流：文本提示词 → 文本编码器 → DiT 去噪 → VAE 解码 → 视频帧。

## 参考资料

- [支持模型矩阵](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/)
- [vLLM-Omni 文档 · 文生视频在线推理](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/user_guide/examples/online_serving/text_to_video/)
- [vLLM-Omni 文档 · VAE 并行](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/user_guide/diffusion/parallelism/vae_parallelism/)


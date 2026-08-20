# Wan2.2-T2V-A14B

| 项目 | 信息 |
| --- | --- |
| 系列 | Wan 2.2 系列 |
| 组织 | Wan-AI |
| 任务 | 文生视频 |
| 模型参数量 | 总 28B（A14B MoE，14B 激活参数），双分支高低噪声 DiT 架构 |
| NPU 支持 | 支持 |
| 模型权重 | [HuggingFace](https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B-Diffusers) · [ModelScope](https://modelscope.cn/models/Wan-AI/Wan2.2-T2V-A14B-Diffusers) |

## 模型介绍

Wan 2.2 是阿里万相团队发布的视频生成基础模型系列。**Wan2.2-T2V-A14B** 是其文生视频版本：基于 MoE 稀疏激活的 DiT 架构（总参数 28B、单 token 激活 14B），支持中英文提示词，可生成自然流畅的高质量短视频。

vLLM-Omni 在昇腾 NPU 上完整支持该模型的在线推理服务（异步视频任务 API），并支持 HSDP / Ulysses 序列并行、VAE patch 并行等大规模部署能力。

## 模型结构

双分支低/高噪声 DiT 架构：同一个 DiT 按噪声水平拆分为**低噪声**与**高噪声**两个阶段（boundary_ratio 默认 0.875），两个阶段使用各自独立的 CFG（guidance_scale / guidance_scale_2）；文本经 T2V 文本编码器注入，视频经 Wan2.2 VAE（支持 tiling 与 patch 并行）编解码；采样采用 Flow Matching 调度（flow_shift，720P 默认 5.0）。

数据流：文本提示词 → 文本编码器 → 高噪声 DiT（CFG）→ 低噪声 DiT → VAE 解码 → 视频帧。

## 参考资料

- [vLLM-Omni 文档 · 文生视频在线推理](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/user_guide/examples/online_serving/text_to_video/)
- [vLLM-Omni 文档 · 视频生成 API](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/serving/videos_api/)
- [recipes.vllm.ai · Wan2.2-T2V-A14B](https://recipes.vllm.ai/Wan-AI/Wan2.2-T2V-A14B-Diffusers)
- [支持模型矩阵](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/)


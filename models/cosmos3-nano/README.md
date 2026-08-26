# Cosmos3-Nano

| 项目 | 信息 |
| --- | --- |
| 系列 | Cosmos3 系列 |
| 组织 | nvidia |
| 任务 | 文生图 / 文生视频 / 图生视频 / 视频+音频 |
| 模型参数量 | 16B（MoE 双通路：UND 理解 + GEN 生成），Qwen3-VL 编码器 + Wan VAE + AVAE 音频 tokenizer |
| NPU 支持 | 是 |
| 模型权重 | [HuggingFace](https://huggingface.co/nvidia/Cosmos3-Nano) · [ModelScope](https://modelscope.cn/models/nv-community/Cosmos3-Nano) |

## 模型介绍

**Cosmos3-Nano** 是 NVIDIA Cosmos3 全模态世界模型家族中的轻量成员（ModelScope 同步镜像：nv-community/Cosmos3-Nano）：统一支持文生图（T2I）、文生视频（T2V）、图生视频（I2V）、视频生视频（V2V）、带声音的视频生成（T2VS/I2VS）以及动作策略（forward dynamics / policy / inverse dynamics）。

官方支持矩阵标注其在昇腾 NPU 上**支持**，并有专门 NPU recipe（1× Ascend 910B/910C，Atlas A2/A3，CANN 8.5.1 + NNAL）验证：T2I 1024²/10 步约 8s、T2V 720p/20 步/49 帧约 55s。注意：NPU 上 --quantization fp8 与 --enable-layerwise-offload 不支持。

## 模型结构

Mixture-of-Transformers 双通路架构：**UND**（理解）通路在文本 token 上做因果自注意力（Qwen3-VL 骨干），**GEN**（生成）通路中视觉 Q 对 [K_und, K_gen] 做交叉注意力。视频侧使用 Wan VAE（时空编解码），声音侧使用 Diffusers-format AVAE 音频 tokenizer（generate_sound 时输出 AAC 48kHz 立体声）。采用流匹配采样（flow_shift）。默认启用安全护栏（guardrail，--no-guardrails 可关闭）。支持 256p / 480p / 720p（16:9、4:3、1:1、3:4、9:16）。

数据流：文本/图像/视频输入 → Qwen3-VL 编码（UND）→ GEN 交叉注意力去噪 → Wan VAE 解码（+ 音频生成）→ 输出。

## 参考资料

- [ModelScope · nv-community/Cosmos3-Nano](https://www.modelscope.cn/models/nv-community/Cosmos3-Nano)
- [官方 NPU recipe · Cosmos3-Nano](https://github.com/vllm-project/vllm-omni/blob/main/recipes/cosmos3/Cosmos3-Nano.md)
- [HuggingFace · nvidia/Cosmos3-Nano](https://huggingface.co/nvidia/Cosmos3-Nano)
- [支持模型矩阵](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/)


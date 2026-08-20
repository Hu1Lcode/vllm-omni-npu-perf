# MiniMax-H3

| 项目 | 信息 |
| --- | --- |
| 系列 | MiniMax H3 系列 |
| 组织 | MiniMaxAI |
| 任务 | 文生视频 / 图生视频 / 视频+音频 |
| 模型参数量 | 64B（FL2VA 与 Ref2VA 双分区 DiT，共享 Qwen3-VL 编码器 + 视频 VAE + 音频 VAE） |
| NPU 支持 | 支持（社区验证（Atlas 800I A3）） |
| 模型权重 | [HuggingFace](https://huggingface.co/MiniMaxAI/MiniMax-H3) · [ModelScope](https://modelscope.cn/models/MiniMax/MiniMax-H3) |

## 模型介绍

**MiniMax-H3** 是 MiniMax 开源的通用多模态生成模型（64B）：同时生成 24 FPS 视频与原生立体声音频，支持三种任务 —— 文生视频+音频（t2va）、首帧/首尾帧驱动（fl2va）、多参考驱动（ref2va，最多 9 张图像 / 3 段视频 / 3 段音频参考）。

官方 NPU recipe 已在 **Atlas 800I A3（8 卡）** 上验证 768P 推理（CANN 9.0.1 + torch_npu 2.10.0.post2）。注意：官方支持矩阵尚未勾选 NPU，状态以「社区验证」标注。

## 模型结构

CFG 蒸馏的联合视频+音频扩散 Transformer：两个任务专用 DiT 分区 —— **FL2VA**（t2va / fl2va）与 **Ref2VA**（ref2va），共享一个 Qwen3-VL 文本/视觉编码器、视频 VAE 与音频 VAE；输出为 H.264 视频 + 同步立体声音频（MP4 封装）。

数据流：文本/图像/视频/音频参考 → Qwen3-VL 编码器 → FL2VA 或 Ref2VA DiT → 视频 VAE 解码 + 音频 VAE 解码 → 音画同步 MP4。

## 参考资料

- [官方 NPU recipe · MiniMax-H3-NPU](https://github.com/vllm-project/vllm-omni/blob/main/recipes/MiniMaxAI/MiniMax-H3-NPU.md)
- [recipes.vllm.ai · MiniMax-H3](https://recipes.vllm.ai/MiniMaxAI/MiniMax-H3)
- [vLLM-Omni 文档 · 视频生成 API](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/serving/videos_api/)
- [支持模型矩阵](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/)


# LingBot-Video-MoE-30B-A3B

| 项目 | 信息 |
| --- | --- |
| 系列 | LingBot-Video 系列 |
| 组织 | Robbyant |
| 任务 | 文生视频 |
| 模型参数量 | 总 30B（A3B 路由 MoE，3B 激活参数），Qwen3-VL 编码器 + Wan VAE |
| NPU 支持 | 暂不支持（官方矩阵未列入 NPU） |
| 模型权重 | [HuggingFace](https://huggingface.co/robbyant/lingbot-video-moe-30b-a3b) · [ModelScope](https://modelscope.cn/models/Robbyant/lingbot-video-moe-30b-a3b) |

## 模型介绍

**LingBot-Video-MoE-30B-A3B** 是 LingBot-Video 的路由 MoE 版本：总参数 30B、单 token 激活 3B。**注意：**当前官方 recipe 仅支持文生视频（T2V），T2I / I2V / TI2V 尚未实现。

**注意：**官方 recipe 仅验证 CUDA 单卡 BF16 路径（峰值约 70 GiB 显存），支持矩阵仅标注 NVIDIA GPU，**暂未列入 NPU**。

## 模型结构

路由 MoE DiT 块（3B 激活）+ Qwen3-VL 文本编码器 + Wan 因果 VAE（帧数按 4n+1 取整）+ 共享 FlowUniPC 调度器。

数据流：文本（+ 可选参考图）→ Qwen3-VL 编码 → MoE DiT → Wan VAE 解码 → 图像 / 视频。

## 参考资料

- [官方 recipe · LingBot-Video](https://github.com/vllm-project/vllm-omni/blob/main/recipes/Robbyant/LingBot-Video.md)
- [支持模型矩阵](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/)


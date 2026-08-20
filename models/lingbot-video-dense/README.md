# LingBot-Video-Dense-1.3B

| 项目 | 信息 |
| --- | --- |
| 系列 | LingBot-Video 系列 |
| 组织 | Robbyant |
| 任务 | 文生视频 |
| 模型参数量 | DiT 1.3B（Qwen3-VL 文本编码器 + Wan 因果 VAE） |
| NPU 支持 | 暂不支持（官方矩阵未列入 NPU） |
| 模型权重 | [HuggingFace](https://huggingface.co/robbyant/lingbot-video-dense-1.3b) · [ModelScope](https://modelscope.cn/models/Robbyant/lingbot-video-dense-1.3b) |

## 模型介绍

**LingBot-Video** 是 Robbyant 开源的视觉生成模型，**Dense-1.3B** 为稠密 DiT 版本。**注意：**当前官方 recipe 仅支持文生视频（T2V），T2I / I2V / TI2V 尚未实现。

**注意：**官方 recipe 仅验证 CUDA 单卡路径，支持矩阵仅标注 NVIDIA GPU，**暂未列入 NPU**。

## 模型结构

稠密 DiT 块 + Qwen3-VL 文本编码器 + Wan 因果 VAE（帧数按 4n+1 取整）+ 共享 FlowUniPC 调度器。

数据流：文本（+ 可选参考图）→ Qwen3-VL 编码 → DiT → Wan VAE 解码 → 图像 / 视频。

## 参考资料

- [官方 recipe · LingBot-Video](https://github.com/vllm-project/vllm-omni/blob/main/recipes/Robbyant/LingBot-Video.md)
- [在线服务示例 · lingbot_video](https://github.com/vllm-project/vllm-omni/tree/main/examples/online_serving/lingbot_video)
- [支持模型矩阵](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/)


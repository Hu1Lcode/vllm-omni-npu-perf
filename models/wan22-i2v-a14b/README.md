# Wan2.2-I2V-A14B

| 项目 | 信息 |
| --- | --- |
| 系列 | Wan 2.2 系列 |
| 组织 | Wan-AI |
| 任务 | 图生视频 |
| 模型参数量 | 总 28B（A14B MoE，14B 激活参数），双分支高低噪声 DiT（参考图像条件注入） |
| NPU 支持 | 支持 |
| 模型权重 | [HuggingFace](https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B-Diffusers) · [ModelScope](https://modelscope.cn/models/Wan-AI/Wan2.2-I2V-A14B-Diffusers) |

## 模型介绍

**Wan2.2-I2V-A14B** 是 Wan 2.2 的图生视频版本：以一张参考图像为条件，生成与之语义一致的视频，可支撑视频延长、视频编辑等应用。

官方 NPU recipe 已在 8× 昇腾 A2/A3 上验证：配合 mindie-sd 融合算子库与 Laser Attention（ascend_laser_attention），720P 下可获约 40% 加速。

## 模型结构

与 T2V 相同的双分支低/高噪声 DiT 主干（boundary_ratio 默认 0.875），差异在于条件输入：参考图像经 VAE 编码后与噪声潜变量拼接，注入 DiT；文本条件经 T2V 文本编码器注入。

数据流：参考图像（VAE 编码）+ 文本提示词 → 高噪声 DiT → 低噪声 DiT → VAE 解码 → 视频帧。

## 参考资料

- [vLLM-Omni 文档 · 图生视频在线推理](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/user_guide/examples/online_serving/image_to_video/)
- [官方 NPU recipe · Wan2.2-I2V](https://github.com/vllm-project/vllm-omni/blob/main/recipes/Wan-AI/Wan2.2-I2V.md)
- [支持模型矩阵](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/)


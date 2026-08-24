# HunyuanVideo-1.5-I2V

| 项目 | 信息 |
| --- | --- |
| 系列 | HunyuanVideo 系列 |
| 组织 | hunyuanvideo-community |
| 任务 | 图生视频 |
| 模型参数量 | DiT 8.3B（Flow Matching，参考图像条件注入），VAE 编解码 |
| NPU 支持 | 支持 |
| 模型权重 | [HuggingFace](https://huggingface.co/hunyuanvideo-community/HunyuanVideo-1.5-Diffusers-480p_i2v) · [ModelScope](https://modelscope.cn/models/Tencent-Hunyuan/HunyuanVideo-1.5) |

## 模型介绍

**HunyuanVideo-1.5-I2V** 是 HunyuanVideo-1.5 的图生视频版本：输入参考图像 + 文本提示词，生成 480p 或 720p 视频。

**注意：**官方支持矩阵仅标注 NVIDIA GPU 与 AMD GPU，**暂未列入 NPU**。480p BF16 约 35 GB 显存，720p 需 FP8 + VAE tiling。

## 模型结构

与 T2V 相同的 DiT + VAE 管线（视频，无音频），增加参考图像条件输入；Flow Matching 调度（flow_shift）。最优配置（官方离线表）：480p I2V flow_shift 5.0 / guidance 6.0 / 50 步；720p I2V 7.0 / 6.0 / 50。

数据流：参考图像（VAE 编码）+ 文本提示词 → DiT 去噪 → VAE 解码 → 视频帧。

## 参考资料

- [在线服务脚本 · run_server_hunyuan_video_15.sh（I2V）](https://github.com/vllm-project/vllm-omni/blob/main/examples/online_serving/image_to_video/run_server_hunyuan_video_15.sh)
- [在线调用脚本 · run_curl_hunyuan_video_15.sh（I2V）](https://github.com/vllm-project/vllm-omni/blob/main/examples/online_serving/image_to_video/run_curl_hunyuan_video_15.sh)
- [支持模型矩阵](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/)


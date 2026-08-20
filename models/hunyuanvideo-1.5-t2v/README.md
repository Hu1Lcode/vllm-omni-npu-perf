# HunyuanVideo-1.5-T2V

| 项目 | 信息 |
| --- | --- |
| 系列 | HunyuanVideo 系列 |
| 组织 | hunyuanvideo-community |
| 任务 | 文生视频 |
| 模型参数量 | DiT 8.3B（Flow Matching，480p/720p 双分辨率），VAE 编解码 |
| NPU 支持 | 暂不支持（官方矩阵未列入 NPU） |
| 模型权重 | [HuggingFace](https://huggingface.co/hunyuanvideo-community/HunyuanVideo-1.5-Diffusers-480p_t2v) · [ModelScope](https://modelscope.cn/models/Tencent-Hunyuan/HunyuanVideo-1.5) |

## 模型介绍

**HunyuanVideo-1.5** 是腾讯混元开源的视频生成模型，提供 480p 与 720p 两个分辨率的文生视频（T2V）与图生视频（I2V）checkpoint。

**注意：**官方支持矩阵仅标注 NVIDIA GPU 与 AMD GPU，**暂未列入 NPU**。480p BF16 约 35 GB 显存（单张 A100 80GB 可跑），720p 需 FP8 + VAE tiling。

## 模型结构

DiT + VAE 扩散管线（视频，无音频），Flow Matching 调度（flow_shift）。最优配置（官方离线表）：480p T2V flow_shift 5.0 / guidance 6.0 / 50 步；720p T2V 9.0 / 6.0 / 50；CFG 蒸馏版 guidance 1.0。

数据流：文本提示词 → 文本编码器 → DiT 去噪 → VAE 解码 → 视频帧。

## 参考资料

- [在线服务脚本 · run_server_hunyuan_video_15.sh](https://github.com/vllm-project/vllm-omni/blob/main/examples/online_serving/text_to_video/run_server_hunyuan_video_15.sh)
- [在线调用脚本 · run_curl_hunyuan_video_15.sh](https://github.com/vllm-project/vllm-omni/blob/main/examples/online_serving/text_to_video/run_curl_hunyuan_video_15.sh)
- [支持模型矩阵](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/)


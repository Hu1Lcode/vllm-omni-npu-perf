# LongCat-Image

| 项目 | 信息 |
| --- | --- |
| 系列 | LongCat-Image 系列 |
| 组织 | meituan-longcat |
| 任务 | 文生图 |
| 模型参数量 | 6B（扩散模型部分），DiT 主干包含 transformer_blocks + single_transformer_blocks |
| NPU 支持 | 支持 |
| 模型权重 | [HuggingFace](https://huggingface.co/meituan-longcat/LongCat-Image) · [ModelScope](https://modelscope.cn/models/meituan-longcat/LongCat-Image) |

## 模型介绍

**LongCat-Image** 是美团 LongCat 团队开源的中英双语文生图模型，默认分辨率 1024×1024，官方离线推理表记录的峰值显存约 71.2 GiB、权重 27.3 GiB。

官方支持矩阵标注其在昇腾 NPU 上**支持**（全平台 ✓）。注意：官方暂无该模型的专属 serve 文档，在线服务使用标准 --omni 入口（e2e 测试同款）。

## 模型结构

DiT 主干包含 **transformer_blocks** 与 **single_transformer_blocks** 两组 block。特性支持：TeaCache ✓、Cache-DiT ✓、序列并行 ✓、CFG 并行 ✓、张量并行 ✓、逐层 CPU 卸载 ✓；流水线并行 / HSDP / VAE-patch 并行 / FP8 量化 ✗。

数据流：文本提示词 → 文本编码器 → DiT 去噪 → VAE 解码 → 图像。

## 参考资料

- [支持模型矩阵](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/)
- [vLLM-Omni 文档 · 图像生成 API](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/serving/image_generation_api/)


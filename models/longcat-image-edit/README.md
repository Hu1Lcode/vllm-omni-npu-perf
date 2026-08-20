# LongCat-Image-Edit

| 项目 | 信息 |
| --- | --- |
| 系列 | LongCat-Image 系列 |
| 组织 | meituan-longcat |
| 任务 | 图像编辑 |
| 模型参数量 | DiT 6B（transformer_blocks + single_transformer_blocks，参考图像条件注入） |
| NPU 支持 | 支持 |
| 模型权重 | [HuggingFace](https://huggingface.co/meituan-longcat/LongCat-Image-Edit) · [ModelScope](https://modelscope.cn/models/meituan-longcat/LongCat-Image-Edit) |

## 模型介绍

**LongCat-Image-Edit** 是美团 LongCat 的中英双语图像编辑模型（6B 稠密）：输入参考图像 + 文本指令，输出编辑后的图像。

官方支持矩阵标注其在昇腾 NPU 上**支持**（全平台 ✓）。官方 recipe 仅给出离线推理示例（建议 ≥40 GiB 显存 GPU），未提供专属 serve 命令；e2e 测试通过标准 --omni 入口服务该模型（可选 --enable-cpu-offload、--cache-backend cache_dit、--ulysses-degree 2）。

## 模型结构

与 LongCat-Image 相同的 DiT 主干（transformer_blocks + single_transformer_blocks），增加参考图像条件输入用于编辑；支持 Cache-DiT / TeaCache 加速。

数据流：参考图像（VAE 编码）+ 文本指令 → DiT → VAE 解码 → 编辑后图像。

## 参考资料

- [recipes.vllm.ai · LongCat-Image-Edit](https://recipes.vllm.ai/meituan-longcat/LongCat-Image-Edit)
- [支持模型矩阵](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/)
- [vLLM-Omni 文档 · 图像编辑 API](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/serving/image_edit_api/)


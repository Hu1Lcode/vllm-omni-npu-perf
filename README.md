# vLLM-Omni × Ascend NPU 模型画廊

展示 **vLLM-Omni 在昇腾 NPU 上支持**的模型：主页为按系列分组的模型卡片墙 + **vLLM-Omni 特性清单**（7 大类 33 项，链接到官方文档），点击模型名进入详情页，详情页包含 **模型简介 → 架构图 → 部署推理脚本 → 性能数据** 四个板块。

当前收录 9 个系列、24 个模型：

| 系列 | 模型 | NPU 支持 |
| --- | --- | --- |
| Wan 2.1 | Wan2.1-T2V-1.3B / T2V-14B / VACE-1.3B / VACE-14B | ✓ |
| Wan 2.2 | Wan2.2-T2V-A14B / I2V-A14B / TI2V-5B / S2V-14B | ✓ |
| MiniMax H3 | MiniMax-H3（视频 + 立体声音频） | ✓ 社区验证（Atlas 800I A3） |
| Qwen-Image | Image / 2512 / Edit / Edit-2509 / Edit-2511 / Layered | Edit 系列 ✓，Image 基础版与 2512 ✗ |
| Z-Image | Z-Image / Z-Image-Turbo | Turbo ✓，基础版待验证 |
| LTX | LTX-2.3（视频 + 同步音频） | ✗（矩阵未列入 NPU） |
| LingBot-Video | Dense-1.3B / MoE-30B-A3B | ✗（矩阵未列入 NPU，仅 NVIDIA） |
| LongCat-Image | LongCat-Image / LongCat-Image-Edit | ✓ |
| HunyuanVideo | HunyuanVideo-1.5 T2V / I2V（480p / 720p） | ✗（矩阵未列入 NPU） |

## 目录结构

```
vllm-omni-npu-showcase/
├── index.html          # 主页：hero + 任务类型筛选 + 系列分组卡片墙
├── model.html          # 详情页统一模板（?id=模型id）
├── assets/
│   ├── css/style.css   # 全局样式
│   └── js/
│       ├── data.js     # ★ 核心数据源：全部模型信息集中在此
│       ├── main.js     # 主页渲染逻辑
│       └── model.js    # 详情页渲染逻辑
└── README.md
```

## 运行方式（无需任何服务）

网站是纯 HTML + CSS + JS 静态页面，**不需要 Python、不需要起服务、不需要联网**，直接打开即可使用：

- **本机直接打开**：双击 `index.html`，或把整个 `vllm-omni-npu-showcase` 目录拷到本地电脑后打开（全部资源均为相对路径，不依赖任何 CDN，离线可用）。
- 从服务器 / 容器拷贝到本地（示例）：
  ```bash
  scp -r user@server:/home/wjh/vllm-omni-npu-showcase ~/Downloads/
  # 然后本地双击 ~/Downloads/vllm-omni-npu-showcase/index.html
  ```
- （可选）仅当需要局域网内多人通过浏览器访问时，才起一个静态文件服务：
  ```bash
  cd /home/wjh/vllm-omni-npu-showcase
  python3 -m http.server 8899   # 容器内 8000 端口常被 vllm 服务占用，请用其他端口
  # 浏览器访问 http://<服务器IP>:8899/
  ```

> 唯一需要联网的是点击页面里的「官方文档 / recipes.vllm.ai / HuggingFace」等外链；页面本身渲染完全离线。

## 如何新增模型

只需编辑 `assets/js/data.js`，复制一条现有记录并修改字段即可，主页与详情页会自动更新。字段说明：

| 字段 | 说明 |
| --- | --- |
| `id` | 唯一标识，详情页地址 `model.html?id=xxx` 使用 |
| `name` | 模型名 |
| `series` / `seriesName` / `org` | 系列分组键、系列显示名、组织名 |
| `tasks` | 任务类型标签数组：`文生图 / 图像编辑 / 文生视频 / 图生视频 / 语音视频 / 视频+音频` |
| `params` | 参数量描述 |
| `hfRepo` | HuggingFace 仓库名 |
| `npu` | `true`=支持 / `false`=暂不支持 / `"unverified"`=待验证 |
| `npuNote` | NPU 状态补充说明（如"社区验证"），可为空 |
| `summary` | 卡片上的一句话摘要 |
| `intro` | 模型简介（HTML） |
| `arch.text` | 架构文字描述（HTML）；架构图目前为占位块，后续可替换为 SVG/图片 |
| `serve` | 部署脚本数组：`{ title, lang, code, note? }`，渲染为带复制按钮的代码块 |
| `perf` | `{ columns: [...], rows: [...] }`，性能表格列定义与数据行 |
| `refs` | 参考链接数组：`{ label, url }` |

## 如何填性能数据

编辑 `assets/js/data.js` 中对应模型的 `perf.rows`，每行一个数组，列顺序与 `perf.columns` 一致，例如：

```js
perf: {
  columns: ["分辨率", "帧数 / 时长", "推理步数", "机型", "框架版本", "部署配置", "端到端时间 (s)", "每帧时间 (ms)", "备注"],
  rows: [
    ["1344×768", "209 帧 / 8.7s", "50", "Atlas 800I A3", "vllm-omni v0.25.0", "8× NPU，USP8", "待测", "待测", "首帧预热后"],
  ],
},
```

## 特性清单

主页「vLLM-Omni 特性清单」区块的数据在 `assets/js/data.js` 的 `window.FEATURES` 中：按分类组织（服务接口 / 推理加速 / 并行策略 / 显存优化与卸载 / 量化 / 功能扩展 / 昇腾 NPU 与运维），每项为 `{ name, desc, url }`，链接指向官方文档（docs.vllm.com.cn 镜像，与 docs.vllm.ai 路径一致）。新增特性只需在对应分类的 `items` 数组里加一条记录。

## 内容说明

- 部署脚本与 API 示例取自 vLLM-Omni 官方文档（<https://docs.vllm.com.cn/projects/vllm-omni/en/latest/>）与官方 recipes（<https://recipes.vllm.ai/>、vllm-omni 仓库 `recipes/` 目录）。
- NPU 支持状态依据官方[支持模型矩阵](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/)标注；MiniMax-H3 标注为「社区验证」（官方 NPU recipe 在 Atlas 800I A3 上验证）。
- 性能数据目前为占位空表，待填入实测结果。

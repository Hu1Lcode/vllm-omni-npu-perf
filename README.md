# vLLM-Omni × Ascend NPU 模型画廊

展示 **vLLM-Omni 在昇腾 NPU 上支持**的模型：主页为按系列分组的模型卡片墙 + **vLLM-Omni 特性清单**（7 大类 33 项，链接到官方文档），点击模型名进入详情页，详情页包含 **模型简介 → 架构图 → 部署推理脚本 → 性能数据** 四个板块。

当前收录 9 个系列、20 个模型：

| 系列 | 模型 | NPU 支持 |
| --- | --- | --- |
| Wan 2.1 | Wan2.1-T2V-1.3B / T2V-14B / VACE-1.3B / VACE-14B | ✓ |
| Wan 2.2 | Wan2.2-T2V-A14B / I2V-A14B / TI2V-5B | ✓ |
| MiniMax H3 | MiniMax-H3（视频 + 立体声音频） | ✓ 社区验证（Atlas 800I A3） |
| Qwen-Image | 2512 / Edit-2511 / Layered | 2512 ✗，Edit-2511 与 Layered ✓ |
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
- **推荐用 `server.py` 启动**（静态服务 + 数据文件读写，见下方「数据持久化」）：
  ```bash
  cd /home/wjh/vllm-omni-npu-showcase
  python3 server.py --port 8899   # 容器内 8000 端口常被 vllm 服务占用，请用其他端口
  # 浏览器访问 http://<服务器IP>:8899/
  ```
- 仅需静态预览（不需要保存功能）也可以用 `python3 -m http.server 8899`。

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
  columns: ["任务", "分辨率", "帧数 / 时长", "帧率 (fps)", "推理步数", "机型", "框架版本", "端到端时间 (s)"],
  rows: [
    ["t2va", "1344×768", "209 帧 / 8.7s", "24", "50", "Atlas 800I A3", "vllm-omni v0.25.0", "待测"],
  ],
},
```

## 特性清单

主页「vLLM-Omni 特性清单」区块的数据在 `assets/js/data.js` 的 `window.FEATURES` 中：按分类组织（服务接口 / 推理加速 / 并行策略 / 显存优化与卸载 / 量化 / 功能扩展 / 昇腾 NPU 与运维），每项为 `{ name, desc, url }`，链接指向官方文档（docs.vllm.com.cn 镜像，与 docs.vllm.ai 路径一致）。新增特性只需在对应分类的 `items` 数组里加一条记录。

## 部署脚本本地编辑

详情页「部署推理脚本」的代码块可直接编辑，并支持保存：

- **保存**：写入当前浏览器的 localStorage（按模型 + 脚本块），下次打开该详情页自动恢复你改过的内容；
- **重置**：恢复为 `data.js` 中的默认脚本；
- **复制**：复制文本框当前内容；
- **导出修改 JSON**：章节标题右侧按钮，把与该模型默认脚本不一致的块导出为 `<模型id>-serve-patch.json`。

> 注意：localStorage 的保存是「本浏览器」级别的，换浏览器/换机器不会带过去；要把改动正式落到网站仓库，请用「导出修改 JSON」导出后，交给维护者合并进 `assets/js/data.js` 对应模型的 `serve` 字段（或直接编辑 data.js）。

## 数据持久化（server.py 文件模式）

通过 `python3 server.py` 访问站点时，部署脚本的修改会持久化到项目根目录的 **`user-data.json`**：

- 详情页加载时**自动从该文件读取**对应模型的脚本修改并恢复；
- 点「**保存**」直接**写回该文件**（原子写入，多模型的数据共存于同一文件）；
- 点「**重置**」从文件中删除该块的修改；
- 文件格式：

  ```json
  {
    "serve": {
      "minimax-h3": [
        { "index": 0, "title": "部署推理服务 · vllm serve（8 卡 NPU）", "code": "vllm serve ..." }
      ]
    }
  }
  ```

- 数据文件纳入 git 管理，可直接 `git commit && git push` 把最优部署配置同步到 GitHub；
- 不通过 server.py（直接双击 `index.html`）打开时，自动回退到浏览器 localStorage；
- 注意：`server.py` 的 `/api/data` 接口不做鉴权，局域网内任何人可读写该文件，请仅在可信网络中使用。

## 内容说明

- 部署脚本与 API 示例取自 vLLM-Omni 官方文档（<https://docs.vllm.com.cn/projects/vllm-omni/en/latest/>）与官方 recipes（<https://recipes.vllm.ai/>、vllm-omni 仓库 `recipes/` 目录）。
- NPU 支持状态依据官方[支持模型矩阵](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/)标注；MiniMax-H3 标注为「社区验证」（官方 NPU recipe 在 Atlas 800I A3 上验证）。
- 性能数据目前为占位空表，待填入实测结果。

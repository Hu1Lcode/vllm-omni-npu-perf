# vLLM-Omni × Ascend NPU 模型画廊

展示 **vLLM-Omni 在昇腾 NPU 上支持**的模型：主页为按系列分组的模型卡片墙 + **vLLM-Omni 特性清单**（7 大类 33 项，链接到官方文档），点击模型名进入详情页。详情页包含 **模型简介 → 部署推理脚本 → 性能数据** 三个板块，全部从 `models/<模型id>/` 目录动态读取渲染。

当前收录 10 个系列、21 个模型：

| 系列 | 模型 | NPU 支持 |
| --- | --- | --- |
| Wan 2.1 | Wan2.1-T2V-1.3B / T2V-14B / I2V-14B-480P / I2V-14B-720P | T2V ✓，I2V 待验证 |
| Wan 2.2 | Wan2.2-T2V-A14B / I2V-A14B / TI2V-5B | ✓ |
| MiniMax H3 | MiniMax-H3（视频 + 立体声音频） | ✓ 社区验证（Atlas 800I A3） |
| Qwen-Image | 2512 / Edit-2511 / Layered | 2512 ✗，Edit-2511 与 Layered ✓ |
| Z-Image | Z-Image / Z-Image-Turbo | Turbo ✓，基础版待验证 |
| LTX | LTX-2.3（视频 + 同步音频） | ✗（矩阵未列入 NPU） |
| LingBot-Video | Dense-1.3B / MoE-30B-A3B | ✗（矩阵未列入 NPU，仅 NVIDIA） |
| LongCat-Image | LongCat-Image / LongCat-Image-Edit | ✓ |
| HunyuanVideo | HunyuanVideo-1.5 T2V / I2V（480p / 720p） | ✗（矩阵未列入 NPU） |
| Cosmos3 | Cosmos3-Nano（T2I / T2V / I2V / V2V / 带声音 / 动作策略） | ✓ |

## 目录结构

```
vllm-omni-npu-showcase/
├── index.html            # 主页：hero + 任务类型筛选 + 系列分组卡片墙
├── model.html            # 详情页统一模板（?id=模型id）
├── server.py             # 可选静态服务 + models/ 数据 API
├── generate_models.py    # 从 data.js 生成/校验 models/<id>/ 三件套
├── perf-data.json        # 历史性能数据归档（迁移前旧格式，页面不读取）
├── results/              # bench.py 压测输出（fill_results.py 的回填源）
├── models/
│   ├── <模型id>/          # 每个模型一个目录（21 个）
│   │   ├── README.md     # 模型简介：介绍 / 参数量 / 结构 / 权重地址
│   │   ├── deploy.sh     # 部署推理脚本（详情页「脚本」区块数据源）
│   │   └── perf.json     # 性能数据（详情页「性能数据」区块数据源）
│   └── ...
├── bench/                # 性能摸底工具链（bench.py + fill_results.py）
├── assets/
│   ├── css/style.css     # 全局样式
│   └── js/
│       ├── data.js       # ★ 核心数据源：全部模型信息集中在此
│       ├── main.js       # 主页渲染逻辑
│       └── model.js      # 详情页渲染逻辑
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
- 局域网多人访问时可用 `server.py` 起静态服务（详情页经 API 动态读取 `models/` 三件套）：
  ```bash
  cd /home/wjh/vllm-omni-npu-showcase
  python3 server.py --port 8899   # 容器内 8000 端口常被 vllm 服务占用，请用其他端口
  # 浏览器访问 http://<服务器IP>:8899/
  ```
- 也可以直接用 `python3 -m http.server 8899`（此时详情页走静态回退渲染，功能一致）。

> 唯一需要联网的是点击页面里的「官方文档 / recipes.vllm.ai / HuggingFace / ModelScope」等外链；页面本身渲染完全离线。

## 数据流（models/ 三件套）

```
assets/js/data.js（核心数据源，手动编辑）
        │  python3 generate_models.py
        ▼
models/<模型id>/README.md + deploy.sh + perf.json
        │  server.py 提供 /api/models/<id>/readme|script|perf
        ▼
详情页三个区块（模型简介 → 部署推理脚本 → 性能数据）
```

- 经 `server.py` 访问时，详情页动态读取三件套渲染，区块顶部显示「✓ 已与 models/<id>/xxx 同步」；修改文件后刷新页面即可看到更新。
- 纯静态打开（无 server.py）时，页面使用 `data.js` 中的内容作为回退，功能一致。

**两种维护方式任选**：

1. 改 `data.js` 后运行 `python3 generate_models.py` 重新生成覆盖；
2. 直接编辑 `models/<id>/` 下的文件（页面即时同步）。

`python3 generate_models.py --check` 可检查三件套与 `data.js` 是否一致（不写盘）。

## 如何新增模型

只需编辑 `assets/js/data.js`，复制一条现有记录并修改字段即可。字段说明：

| 字段 | 说明 |
| --- | --- |
| `id` | 唯一标识，详情页地址 `model.html?id=xxx` 使用，同时作为 `models/` 下目录名 |
| `name` | 模型名 |
| `series` / `seriesName` / `org` | 系列分组键、系列显示名、组织名 |
| `tasks` | 任务类型标签数组：`文生图 / 图像编辑 / 文生视频 / 图生视频 / 语音视频 / 视频+音频` |
| `params` / `paramsDetail` | 参数量简述 / 详细描述（README.md「模型参数量」行用 `paramsDetail`，缺失时回退 `params`） |
| `hfRepo` / `msRepo` | HuggingFace 仓库名 / ModelScope 镜像（org/repo），README.md 权重行输出双链接；HF 访问不到时用 ModelScope 获取 |
| `npu` | `true`=支持 / `false`=暂不支持 / `"unverified"`=待验证 |
| `npuNote` | NPU 状态补充说明（如"社区验证"），可为空 |
| `summary` | 卡片上的一句话摘要 |
| `intro` | 模型简介（HTML），生成 README.md「模型介绍」章节 |
| `arch.text` | 架构文字描述（HTML），生成 README.md「模型结构」章节 |
| `serve` | 部署脚本数组：`{ title, lang, code, note? }`，生成 deploy.sh 并渲染为带复制按钮的代码块 |
| `perf` | `{ columns: [...], rows: [...] }`，性能表格列定义与静态回退数据行 |
| `refs` | 参考链接数组：`{ label, url }`，生成 README.md「参考资料」章节 |

修改后运行生成器：

```bash
python3 generate_models.py          # 生成/更新 models/<id>/ 三件套
python3 generate_models.py --check  # 只校验一致性（不写盘）
```

## 如何填性能数据

两种方式：

1. **直接编辑** `models/<id>/perf.json` 的 `rows`（页面经 server.py 即时同步；也可改 `data.js` 的 `perf.rows` 后重新生成）；
2. **压测后自动回填**：

   ```bash
   python3 bench/fill_results.py --dry-run results/minimax-h3.json   # 先看将写入的行
   python3 bench/fill_results.py results/minimax-h3.json             # 追加到 models/<id>/perf.json
   ```

   `fill_results.py` 把新结果**追加**到 `models/<id>/perf.json` 的 `rows` 末尾（同一模型多行数据均保留），同时更新 `data.js` 的 `perf.rows`（静态回退）。

> `perf-data.json` 是迁移前的历史性能数据归档（旧格式），仅作备份/回填参考，页面不读取它；新的实测数据请直接写入 `models/<id>/perf.json`。

`perf.json` 格式（每行一个数组，列顺序与该模型 `data.js` 中 `perf.columns` 一致）：

```json
{
  "columns": ["任务", "分辨率", "帧数 / 时长", "帧率 (fps)", "推理步数", "机型", "框架版本", "端到端时间 (s)", "备注"],
  "rows": [
    ["t2va", "1344x768", "124 帧 / 5s", "24", "50", "Ascend910（64GB HBM/卡）", "vllm-omni v0.26.0", "437.85", "t2va, duration 5s, seed 1101"]
  ]
}
```

## 特性清单

主页「vLLM-Omni 特性清单」区块的数据在 `assets/js/data.js` 的 `window.FEATURES` 中：按分类组织（服务接口 / 推理加速 / 并行策略 / 显存优化与卸载 / 量化 / 功能扩展 / 昇腾 NPU 与运维），每项为 `{ name, desc, url }`，链接指向官方文档（docs.vllm.com.cn 镜像，与 docs.vllm.ai 路径一致）。新增特性只需在对应分类的 `items` 数组里加一条记录。

## 内容说明

- 部署脚本与 API 示例取自 vLLM-Omni 官方文档（<https://docs.vllm.com.cn/projects/vllm-omni/en/latest/>）与官方 recipes（<https://recipes.vllm.ai/>、vllm-omni 仓库 `recipes/` 目录）。
- NPU 支持状态依据官方[支持模型矩阵](https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/)标注；MiniMax-H3 标注为「社区验证」（官方 NPU recipe 在 Atlas 800I A3 上验证）。
- 各模型 `README.md` 的权重行同时给出 HuggingFace 与 ModelScope 链接（HF 访问不到时用 ModelScope 获取），参数量等元信息优先取自官方模型卡。
- 性能数据目前 9 个模型已有 16 行实测数据（Wan 2.1 全系 4 个、Wan 2.2 全系 3 个、Qwen-Image-2512、MiniMax-H3），其余为占位空表，待填入实测结果。

# 性能摸底工具链（bench/）

## 口径

1. **预热** 1 次推理（丢弃，用于触发 regional compile 等初始化）；
2. 正式推理 **3 次**（串行执行，每次完成后等待日志落盘）；
3. 推理时间以 **vllm-omni 服务端日志中的 `e2e_total_ms`** 为准，最终结果 = 三次平均值；
4. 结果写入 `results/<model_id>.json`，再用 `fill_results.py` 回填网站的 `perf.rows`。

日志里每次请求会输出两行耗时信息（部署版本实测格式，注意千位分隔符）：

```
[RequestE2EStats [request_id=video_sync-xxx]]
| e2e_total_ms | 238,895.491 |
[OmniTiming] req=video_sync-xxx total=238.90s engine=238.90s stages=[0:238.89s]
```

`OmniTiming` 行附带 stage 分解（text encoder / DiT / VAE 等），可用于瓶颈定位。

## 流程

```
① 部署服务（或直接附加到已运行服务）
② bench.py 预热 + 3 次推理 → results/<model_id>.json
③ fill_results.py 回填 assets/js/data.js 的 perf.rows
④ git commit && git push —— 网站表格更新
```

## 用法

### 附加模式（服务已在运行，不重启）

```bash
python3 bench/bench.py \
  --model-id minimax-h3 \
  --endpoint http://127.0.0.1:8000/v1/videos/sync \
  --log-proc 3608248 \
  --form 'prompt=In a snowy blue-purple forest...' \
  --form 'width=1344' --form 'height=768' --form 'fps=24' \
  --form 'num_inference_steps=50' --form 'flow_shift=12' --form 'seed=1101' \
  --form 'extra_params={"task":"fl2va","duration":8.7}' \
  --resolution 1344x768 --frames 209 --duration 8.7 --fps 24 --steps 50 \
  --machine 'Atlas 800I A3' --framework 'vllm-omni <commit> / CANN 9.0.1' \
  --deploy '4× NPU，FL2VA' \
  --out results/minimax-h3.json
```

- `--log-proc <PID>`：通过 `/proc/<pid>/fd/1` 读取日志（服务跑在别的容器/命名空间时也能读，read-only，不影响服务）；
- `--log-file <PATH>`：日志文件在本文件系统可见时直接用路径。

### 自起服务模式（脚本负责拉起/回收服务）

```bash
python3 bench/bench.py \
  --model-id wan22-i2v-a14b \
  --serve 'vllm serve Wan-AI/Wan2.2-I2V-A14B-Diffusers --omni --port 8091' \
  --port 8091 --ready-timeout 1800 \
  --endpoint http://127.0.0.1:8091/v1/videos/sync \
  --form ... --out results/wan22-i2v-a14b.json
```

日志自动落到 `results/logs/<model_id>.log`，压测结束后自动停止服务。

### 异步任务接口

`/v1/videos`（创建任务 + 轮询）加 `--mode async`，脚本自动 POST 创建、轮询至 `completed`，并按任务 id 与日志记录对齐。

### JSON 请求体

`/v1/images/generations` 等 JSON 接口用 `--data '{"prompt":"...","size":"1024x1024","seed":42}'` 代替 `--form`。

## 回填

```bash
python3 bench/fill_results.py --dry-run results/minimax-h3.json   # 先看将写入的行
python3 bench/fill_results.py results/minimax-h3.json             # 写回 data.js
python3 bench/fill_results.py                                     # 回填 results/ 下全部
```

行内容按每个模型 `perf.columns` 的列序自动映射：分辨率 / 帧数 / 帧率 / 步数 / 机型 / 框架版本 / 端到端时间 / 每帧时间（或单张耗时）。

## 注意事项

- 视频生成一次动辄几分钟，3 次 + 预热 1 次单模型约 15~40 分钟，请合理安排压测时段；
- 附加模式压测会给正在服务的实例带来真实负载，执行前确认不影响在跑的业务；
- 建议固定 `seed`，同一配置可复现；
- 结果 JSON 中务必填准 `--machine / --framework / --resolution / --frames / --fps / --steps`，这些直接进网站表格（`--framework` 只标 vllm-omni 版本；`--deploy`、`--note` 仅留在结果 JSON 备查，不进表格）；
- 若需 stage 级耗时分析，可再写脚本解析日志中的 `[OmniTiming] ... stages=[...]` 行（本工具暂只取 e2e_total_ms）。

/* ============================================================
 * vLLM-Omni × Ascend NPU 模型画廊 —— 核心数据源
 * ------------------------------------------------------------
 * 新增模型：复制一条记录并按字段填写，主页与详情页会自动更新。
 * 填性能数据：在对应模型 perf.rows 中添加数组行，
 *             每行列数与 perf.columns 一一对应。
 * NPU 状态取值：true=支持 / false=暂不支持 / "unverified"=待验证
 * ============================================================ */

window.MODELS = [
  /* ─────────────────────────── Wan 2.2 系列 ─────────────────────────── */
  {
    id: "wan22-t2v-a14b",
    name: "Wan2.2-T2V-A14B",
    series: "wan22",
    seriesName: "Wan 2.2 系列",
    org: "Wan-AI",
    tasks: ["文生视频"],
    params: "28B（A14B MoE，14B 激活）",
    hfRepo: "Wan-AI/Wan2.2-T2V-A14B-Diffusers",
    npu: true,
    npuNote: "",
    summary: "MoE 稀疏激活 DiT，文本生成高质量短视频",
    intro: `
      <p>Wan 2.2 是阿里万相团队发布的视频生成基础模型系列。<strong>Wan2.2-T2V-A14B</strong> 是其文生视频版本：基于 MoE 稀疏激活的 DiT 架构（总参数 28B、单 token 激活 14B），支持中英文提示词，可生成自然流畅的高质量短视频。</p>
      <p>vLLM-Omni 在昇腾 NPU 上完整支持该模型的在线推理服务（异步视频任务 API），并支持 HSDP / Ulysses 序列并行、VAE patch 并行等大规模部署能力。</p>
    `,
    arch: {
      text: `
        <p>双分支低/高噪声 DiT 架构：同一个 DiT 按噪声水平拆分为<strong>低噪声</strong>与<strong>高噪声</strong>两个阶段（boundary_ratio 默认 0.875），两个阶段使用各自独立的 CFG（guidance_scale / guidance_scale_2）；文本经 T2V 文本编码器注入，视频经 Wan2.2 VAE（支持 tiling 与 patch 并行）编解码；采样采用 Flow Matching 调度（flow_shift，720P 默认 5.0）。</p>
        <p>数据流：文本提示词 → 文本编码器 → 高噪声 DiT（CFG）→ 低噪声 DiT → VAE 解码 → 视频帧。</p>
      `,
    },
    serve: [
      {
        title: "部署推理服务 · vllm serve",
        lang: "bash",
        code: `# 基础启动（单卡）
vllm serve Wan-AI/Wan2.2-T2V-A14B-Diffusers \\
  --omni --port 8091 \\
  --boundary-ratio 0.875 \\
  --flow-shift 5.0

# 8 卡 NPU：HSDP + VAE patch 并行 + tiling
vllm serve Wan-AI/Wan2.2-T2V-A14B-Diffusers \\
  --omni --use-hsdp --usp 8 \\
  --vae-patch-parallel-size 8 --vae-use-tiling`,
      },
      {
        title: "客户端调用 · /v1/videos（异步任务）",
        lang: "bash",
        code: `# 创建视频生成任务
create_response=$(curl -s http://localhost:8091/v1/videos \\
  -H "Accept: application/json" \\
  -F "prompt=Two anthropomorphic cats in comfy boxing gear and bright gloves fight intensely on a spotlighted stage." \\
  -F "width=832" -F "height=480" -F "num_frames=33" -F "fps=16" \\
  -F "num_inference_steps=40" \\
  -F "guidance_scale=4.0" -F "guidance_scale_2=4.0" \\
  -F "boundary_ratio=0.875" -F "flow_shift=5.0" -F "seed=42")

# 轮询任务状态，直到 status == completed
video_id=$(echo "$create_response" | jq -r '.id')
curl -s "http://localhost:8091/v1/videos/\${video_id}"

# 下载生成结果
curl -L "http://localhost:8091/v1/videos/\${video_id}/content" -o wan22_t2v_output.mp4`,
      },
    ],
    perf: {
      columns: ["分辨率", "帧数 / 时长", "推理步数", "机型", "部署配置", "端到端时间 (s)", "每帧时间 (ms)", "备注"],
      rows: [],
    },
    refs: [
      { label: "vLLM-Omni 文档 · 文生视频在线推理", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/user_guide/examples/online_serving/text_to_video/" },
      { label: "vLLM-Omni 文档 · 视频生成 API", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/serving/videos_api/" },
      { label: "recipes.vllm.ai · Wan2.2-T2V-A14B", url: "https://recipes.vllm.ai/Wan-AI/Wan2.2-T2V-A14B-Diffusers" },
      { label: "支持模型矩阵", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/" },
    ],
  },
  {
    id: "wan22-i2v-a14b",
    name: "Wan2.2-I2V-A14B",
    series: "wan22",
    seriesName: "Wan 2.2 系列",
    org: "Wan-AI",
    tasks: ["图生视频"],
    params: "28B（A14B MoE，14B 激活）",
    hfRepo: "Wan-AI/Wan2.2-I2V-A14B-Diffusers",
    npu: true,
    npuNote: "",
    summary: "参考图像驱动的视频生成与视频编辑",
    intro: `
      <p><strong>Wan2.2-I2V-A14B</strong> 是 Wan 2.2 的图生视频版本：以一张参考图像为条件，生成与之语义一致的视频，可支撑视频延长、视频编辑等应用。</p>
      <p>官方 NPU recipe 已在 8× 昇腾 A2/A3 上验证：配合 mindie-sd 融合算子库与 Laser Attention（ascend_laser_attention），720P 下可获约 40% 加速。</p>
    `,
    arch: {
      text: `
        <p>与 T2V 相同的双分支低/高噪声 DiT 主干（boundary_ratio 默认 0.875），差异在于条件输入：参考图像经 VAE 编码后与噪声潜变量拼接，注入 DiT；文本条件经 T2V 文本编码器注入。</p>
        <p>数据流：参考图像（VAE 编码）+ 文本提示词 → 高噪声 DiT → 低噪声 DiT → VAE 解码 → 视频帧。</p>
      `,
    },
    serve: [
      {
        title: "部署推理服务 · vllm serve（8 卡 NPU）",
        lang: "bash",
        code: `# 前置依赖：安装 mindie-sd 融合算子库（fused adalayernorm 等，详见官方 NPU recipe）
#   git clone https://gitcode.com/Ascend/MindIE-SD.git && cd MindIE-SD
#   python setup.py bdist_wheel && cd dist && pip install mindiesd-*.whl

# 蒸馏版（无 CFG）· 8 卡 NPU
export MINDIE_SD_FA_TYPE=ascend_laser_attention   # Laser Attention，720P 约 40% 加速
export MULTI_STREAM_MEMORY_REUSE=2                # HSDP/FSDP2 所需的 NPU workaround
vllm serve --omni Wan-AI/Wan2.2-I2V-A14B-Diffusers \\
  --use-hsdp --usp 8 \\
  --vae-patch-parallel-size 8 --vae-use-tiling

# 官方模型（含 CFG）：--usp 4 --cfg-parallel-size 2（usp × cfg = 8 卡）`,
      },
      {
        title: "客户端调用 · /v1/videos（图生视频）",
        lang: "bash",
        code: `curl -X POST http://localhost:8091/v1/videos \\
  -F "prompt=A bear playing with yarn, smooth motion" \\
  -F "input_reference=@/path/to/qwen-bear.png" \\
  -F "width=832" -F "height=480" -F "num_frames=33" -F "fps=16" \\
  -F "num_inference_steps=40" \\
  -F "guidance_scale=1.0" -F "guidance_scale_2=1.0" \\
  -F "boundary_ratio=0.875" -F "flow_shift=12.0" \\
  -F 'extra_params={"sample_solver":"euler"}' -F "seed=42"

# 蒸馏/Lightning 权重使用 sample_solver=euler，官方权重默认 unipc`,
      },
    ],
    perf: {
      columns: ["分辨率", "帧数 / 时长", "推理步数", "机型", "部署配置", "端到端时间 (s)", "每帧时间 (ms)", "备注"],
      rows: [],
    },
    refs: [
      { label: "vLLM-Omni 文档 · 图生视频在线推理", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/user_guide/examples/online_serving/image_to_video/" },
      { label: "官方 NPU recipe · Wan2.2-I2V", url: "https://github.com/vllm-project/vllm-omni/blob/main/recipes/Wan-AI/Wan2.2-I2V.md" },
      { label: "支持模型矩阵", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/" },
    ],
  },
  {
    id: "wan22-ti2v-5b",
    name: "Wan2.2-TI2V-5B",
    series: "wan22",
    seriesName: "Wan 2.2 系列",
    org: "Wan-AI",
    tasks: ["文生视频", "图生视频"],
    params: "5B（稠密）",
    hfRepo: "Wan-AI/Wan2.2-TI2V-5B-Diffusers",
    npu: true,
    npuNote: "",
    summary: "统一文生视频与图生视频的 5B 稠密模型",
    intro: `
      <p><strong>Wan2.2-TI2V-5B</strong> 是 Wan 2.2 的统一视频生成模型：同一个 5B 稠密模型同时支持文生视频与图生视频（可选参考图像输入），体量小、显存占用低，适合受限硬件部署。</p>
      <p>官方支持矩阵标注其在昇腾 NPU 上支持。</p>
    `,
    arch: {
      text: `
        <p>5B 稠密 DiT + Wan2.2 VAE + T2V 文本编码器；图生视频模式下参考图像经 VAE 编码后作为条件注入。支持 CFG 与 Flow Matching 调度。</p>
        <p>数据流：文本提示词（+ 可选参考图像）→ DiT → VAE 解码 → 视频帧。</p>
      `,
    },
    serve: [
      {
        title: "部署推理服务 · vllm serve",
        lang: "bash",
        code: `# 5B 稠密模型，单卡即可启动
vllm serve Wan-AI/Wan2.2-TI2V-5B-Diffusers \\
  --omni --port 8091`,
      },
      {
        title: "客户端调用 · /v1/videos（图生视频示例）",
        lang: "bash",
        code: `curl -X POST http://localhost:8091/v1/videos \\
  -F "prompt=The cat turns its head to look at the camera" \\
  -F "input_reference=@/path/to/cat.png" \\
  -F "width=832" -F "height=480" -F "num_frames=33" -F "fps=16" \\
  -F "num_inference_steps=40" \\
  -F "guidance_scale=1.0" -F "guidance_scale_2=1.0" \\
  -F "boundary_ratio=0.875" -F "flow_shift=12.0" \\
  -F "seed=42"

# 纯文生视频时省略 input_reference 字段即可；参数以官方文档为准`,
      },
    ],
    perf: {
      columns: ["分辨率", "帧数 / 时长", "推理步数", "机型", "部署配置", "端到端时间 (s)", "每帧时间 (ms)", "备注"],
      rows: [],
    },
    refs: [
      { label: "vLLM-Omni 文档 · 视频生成 API", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/serving/videos_api/" },
      { label: "支持模型矩阵", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/" },
    ],
  },
  {
    id: "wan22-s2v-14b",
    name: "Wan2.2-S2V-14B",
    series: "wan22",
    seriesName: "Wan 2.2 系列",
    org: "Wan-AI",
    tasks: ["语音视频"],
    params: "14B",
    hfRepo: "Wan-AI/Wan2.2-S2V-14B",
    npu: true,
    npuNote: "",
    summary: "语音驱动视频生成，口型与动作同步",
    intro: `
      <p><strong>Wan2.2-S2V-14B</strong> 是 Wan 2.2 的语音驱动视频（speech-to-video）模型：输入参考视频与语音音频，生成口型、动作与语音内容同步的视频，适合数字人、口播等场景。</p>
      <p>官方支持矩阵标注其在昇腾 NPU 上支持。</p>
    `,
    arch: {
      text: `
        <p>DiT + VAE 架构：参考视频帧经 VAE 编码，语音音频经音频编码器提取特征后作为条件注入 DiT，驱动生成与语音同步的视频帧。</p>
        <p>数据流：参考视频（VAE 编码）+ 语音 → DiT → VAE 解码 → 同步视频。</p>
      `,
    },
    serve: [
      {
        title: "部署推理服务 · vllm serve",
        lang: "bash",
        code: `vllm serve Wan-AI/Wan2.2-S2V-14B \\
  --omni --port 8091`,
        note: "客户端调用参数（语音输入、参考视频等）请参考官方文档「语音驱动视频在线推理」示例。",
      },
    ],
    perf: {
      columns: ["分辨率", "帧数 / 时长", "推理步数", "机型", "部署配置", "端到端时间 (s)", "每帧时间 (ms)", "备注"],
      rows: [],
    },
    refs: [
      { label: "vLLM-Omni 文档 · 语音驱动视频在线推理", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/user_guide/examples/online_serving/speech_to_video/" },
      { label: "支持模型矩阵", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/" },
    ],
  },

  /* ─────────────────────────── MiniMax H3 ─────────────────────────── */
  {
    id: "minimax-h3",
    name: "MiniMax-H3",
    series: "minimax-h3",
    seriesName: "MiniMax H3 系列",
    org: "MiniMaxAI",
    tasks: ["文生视频", "图生视频", "视频+音频"],
    params: "64B（2×52 层联合视频/音频 DiT）",
    hfRepo: "MiniMaxAI/MiniMax-H3",
    npu: true,
    npuNote: "社区验证（Atlas 800I A3）",
    summary: "视频 + 原生立体声音频联合生成（t2va / fl2va / ref2va）",
    intro: `
      <p><strong>MiniMax-H3</strong> 是 MiniMax 开源的通用多模态生成模型（64B）：同时生成 24 FPS 视频与原生立体声音频，支持三种任务 —— 文生视频+音频（t2va）、首帧/首尾帧驱动（fl2va）、多参考驱动（ref2va，最多 9 张图像 / 3 段视频 / 3 段音频参考）。</p>
      <p>官方 NPU recipe 已在 <strong>Atlas 800I A3（8 卡）</strong> 上验证 768P 推理（CANN 9.0.1 + torch_npu 2.10.0.post2）。注意：官方支持矩阵尚未勾选 NPU，状态以「社区验证」标注。</p>
    `,
    arch: {
      text: `
        <p>CFG 蒸馏的联合视频+音频扩散 Transformer：两个任务专用 DiT 分区 —— <strong>FL2VA</strong>（t2va / fl2va）与 <strong>Ref2VA</strong>（ref2va），共享一个 Qwen3-VL 文本/视觉编码器、视频 VAE 与音频 VAE；输出为 H.264 视频 + 同步立体声音频（MP4 封装）。</p>
        <p>数据流：文本/图像/视频/音频参考 → Qwen3-VL 编码器 → FL2VA 或 Ref2VA DiT → 视频 VAE 解码 + 音频 VAE 解码 → 音画同步 MP4。</p>
      `,
    },
    serve: [
      {
        title: "部署推理服务 · vllm serve（8 卡 NPU · Atlas 800I A3）",
        lang: "bash",
        code: `# 前置依赖：安装 mindie-sd 融合算子库（fused adalayernorm + RainFusion rf_v2 内核）
# 环境：Atlas 800I A3 · CANN 9.0.1 · torch_npu 2.10.0.post2 · 768P
# 模型需 HuggingFace 授权：hf auth login

export ASCEND_RT_VISIBLE_DEVICES=0,1,2,3,4,5,6,7
export VLLM_WORKER_MULTIPROC_METHOD=spawn
export VLLM_OMNI_VIDEO_SYNC_TIMEOUT=1800
export PYTHONDONTWRITEBYTECODE=1

vllm serve MiniMaxAI/MiniMax-H3 \\
  --omni \\
  --host 0.0.0.0 \\
  --port 9098 \\
  --trust-remote-code \\
  --num-gpus 8 \\
  --usp 8 \\
  --ring 1 \\
  --text-encoder-tp-size 8 \\
  --enable-distributed-layerwise-offload \\
  --vae-parallel-mode tile \\
  --vae-use-tiling \\
  --vae-patch-parallel-size 8 \\
  --diffusion-attention-backend FLASH_ATTN`,
        note: "可选优化：--diffusion-attention-backend RAINFUSION_ATTN（保持 --ring 1）、export MINDIE_SD_FA_TYPE=ascend_laser_attention、T2VA 可用 --quantization int8。注意：不要加 --enforce-eager（regional compile 会在首个请求时预热）；CFG 已蒸馏，--cfg-parallel-size 必须保持 1。",
      },
      {
        title: "客户端调用 · /v1/videos/sync（t2va 文生视频+音频）",
        lang: "bash",
        code: `export API_URL="http://127.0.0.1:9098/v1/videos/sync"
curl -sS -X POST "\${API_URL}" \\
  -F 'prompt=In a snowy blue-purple forest, Ori carefully walks past a sleeping giant...' \\
  -F 'width=1344' -F 'height=768' -F 'aspect_ratio=16:9' -F 'fps=24' \\
  -F 'num_inference_steps=50' -F 'flow_shift=12' -F 'seed=1101' \\
  -F 'extra_params={"task":"t2va","duration":8.7,"audio_flow_shift":3.0}' \\
  -o t2va.mp4`,
        note: "fl2va：加 -F 'input_reference=@首帧.png;type=image/png'（首尾帧可用多个 input_references + frame_indices=[0,-1]）；ref2va：图片/视频参考（input_reference，可重复）+ 可选音频参考 -F 'audio_reference={\"audio_url\":\"...\"}'；任务通过 extra_params.task 指定。",
      },
    ],
    perf: {
      columns: ["分辨率", "帧数 / 时长", "推理步数", "机型", "部署配置", "端到端时间 (s)", "每帧时间 (ms)", "备注"],
      rows: [],
    },
    refs: [
      { label: "官方 NPU recipe · MiniMax-H3-NPU", url: "https://github.com/vllm-project/vllm-omni/blob/main/recipes/MiniMaxAI/MiniMax-H3-NPU.md" },
      { label: "recipes.vllm.ai · MiniMax-H3", url: "https://recipes.vllm.ai/MiniMaxAI/MiniMax-H3" },
      { label: "vLLM-Omni 文档 · 视频生成 API", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/serving/videos_api/" },
      { label: "支持模型矩阵", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/" },
    ],
  },

  /* ─────────────────────────── Qwen-Image 系列 ─────────────────────────── */
  {
    id: "qwen-image",
    name: "Qwen-Image",
    series: "qwen-image",
    seriesName: "Qwen-Image 系列",
    org: "Qwen",
    tasks: ["文生图"],
    params: "20B",
    hfRepo: "Qwen/Qwen-Image",
    npu: false,
    npuNote: "官方矩阵暂不支持 NPU",
    summary: "20B 多分辨率、多语言文生图基础模型",
    intro: `
      <p><strong>Qwen-Image</strong> 是通义千问团队开源的 20B 文生图基础模型（2025 年 8 月），支持多分辨率（1:1 至 1:4 / 4:1）与多语言提示词，图像质量与文本渲染能力突出。</p>
      <p><strong>注意：</strong>官方支持矩阵中，基础文生图版本仅标注 NVIDIA GPU，<strong>暂不支持 NPU</strong>；NPU 上支持的是同系列的 Edit / Layered 模型。</p>
    `,
    arch: {
      text: `
        <p>基于 DiT 的文生图扩散管线：文本编码器 + DiT + VAE，支持 CFG（true_cfg_scale 默认 4.0）。</p>
        <p>数据流：文本提示词 → 文本编码器 → DiT 去噪 → VAE 解码 → 图像。</p>
      `,
    },
    serve: [
      {
        title: "部署推理服务 · vllm serve",
        lang: "bash",
        code: `vllm serve Qwen/Qwen-Image --omni --port 8091

# 显存受限时追加
#   --vae-use-slicing --vae-use-tiling
# 多卡并行示例
#   --tensor-parallel-size 2
#   --usp 2 / --ring 2
# 逐步连续批处理（step-wise continuous batching）
#   --step-execution --max-num-seqs 8`,
      },
      {
        title: "客户端调用 · /v1/images/generations",
        lang: "bash",
        code: `curl -X POST http://localhost:8091/v1/images/generations \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "a dragon laying over the spine of the Green Mountains of Vermont", "size": "1024x1024", "seed": 42}' \\
  | jq -r '.data[0].b64_json' | base64 -d > dragon.png`,
      },
    ],
    perf: {
      columns: ["分辨率", "推理步数", "机型", "部署配置", "单张耗时 (s)", "吞吐 (张/s)", "备注"],
      rows: [],
    },
    refs: [
      { label: "vLLM-Omni 文档 · 文生图在线推理", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/user_guide/examples/online_serving/text_to_image/" },
      { label: "vLLM-Omni 文档 · 图像生成 API", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/serving/image_generation_api/" },
      { label: "recipes.vllm.ai · Qwen-Image", url: "https://recipes.vllm.ai/Qwen/Qwen-Image" },
      { label: "支持模型矩阵", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/" },
    ],
  },
  {
    id: "qwen-image-2512",
    name: "Qwen-Image-2512",
    series: "qwen-image",
    seriesName: "Qwen-Image 系列",
    org: "Qwen",
    tasks: ["文生图"],
    params: "20B",
    hfRepo: "Qwen/Qwen-Image-2512",
    npu: false,
    npuNote: "官方矩阵暂不支持 NPU",
    summary: "增强真实感与细节的文生图更新版",
    intro: `
      <p><strong>Qwen-Image-2512</strong> 是 Qwen-Image 的 2025 年 12 月更新版本，在真实感、细节与文本渲染上进一步增强。</p>
      <p><strong>注意：</strong>官方支持矩阵中该版本同样仅标注 NVIDIA GPU，<strong>暂不支持 NPU</strong>。</p>
    `,
    arch: {
      text: `
        <p>与 Qwen-Image 相同的 DiT 文生图管线（文本编码器 + DiT + VAE），权重与训练策略更新，支持 CFG。</p>
        <p>数据流：文本提示词 → 文本编码器 → DiT 去噪 → VAE 解码 → 图像。</p>
      `,
    },
    serve: [
      {
        title: "部署推理服务 · vllm serve",
        lang: "bash",
        code: `vllm serve Qwen/Qwen-Image-2512 --omni --port 8091

# 显存受限时追加
#   --vae-use-slicing --vae-use-tiling`,
      },
      {
        title: "客户端调用 · /v1/images/generations",
        lang: "bash",
        code: `curl -X POST http://localhost:8091/v1/images/generations \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "a cup of coffee on the table", "size": "1024x1024", "seed": 42}' \\
  | jq -r '.data[0].b64_json' | base64 -d > coffee.png`,
      },
    ],
    perf: {
      columns: ["分辨率", "推理步数", "机型", "部署配置", "单张耗时 (s)", "吞吐 (张/s)", "备注"],
      rows: [],
    },
    refs: [
      { label: "vLLM-Omni 文档 · 图像生成 API", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/serving/image_generation_api/" },
      { label: "recipes.vllm.ai · Qwen-Image", url: "https://recipes.vllm.ai/Qwen/Qwen-Image" },
      { label: "支持模型矩阵", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/" },
    ],
  },
  {
    id: "qwen-image-edit",
    name: "Qwen-Image-Edit",
    series: "qwen-image",
    seriesName: "Qwen-Image 系列",
    org: "Qwen",
    tasks: ["图像编辑"],
    params: "20B",
    hfRepo: "Qwen/Qwen-Image-Edit",
    npu: true,
    npuNote: "",
    summary: "指令式单图编辑（风格转换 / 局部修改）",
    intro: `
      <p><strong>Qwen-Image-Edit</strong> 是 Qwen-Image 的单图编辑版本（2025 年 8 月）：输入一张参考图像 + 文本指令，输出编辑后的图像，支持风格转换、局部修改、元素增减等。</p>
      <p>官方支持矩阵标注其在昇腾 NPU 上<strong>支持</strong>。</p>
    `,
    arch: {
      text: `
        <p>在 Qwen-Image 文生图主干上增加参考图像条件输入：参考图像经 VAE 编码后注入 DiT，文本指令经文本编码器注入；编辑采样使用 guidance_scale（默认 1）。</p>
        <p>数据流：参考图像（VAE 编码）+ 文本指令 → DiT → VAE 解码 → 编辑后图像。</p>
      `,
    },
    serve: [
      {
        title: "部署推理服务 · vllm serve",
        lang: "bash",
        code: `vllm serve Qwen/Qwen-Image-Edit --omni --port 8092

# 显存受限时追加
#   --vae-use-slicing --vae-use-tiling`,
      },
      {
        title: "客户端调用 · /v1/chat/completions（图像编辑）",
        lang: "bash",
        code: `curl -s http://localhost:8092/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{"messages":[{"role":"user","content":[
        {"type":"text","text":"Convert this image to watercolor style"},
        {"type":"image_url","image_url":{"url":"data:image/png;base64,<BASE64>"}}]}],
      "extra_body":{"height":1024,"width":1024,"num_inference_steps":50,"guidance_scale":1,"seed":42}}' \\
  | jq -r '.choices[0].message.content[0].image_url.url' | cut -d',' -f2 | base64 -d > output.png`,
      },
    ],
    perf: {
      columns: ["分辨率", "推理步数", "机型", "部署配置", "单张耗时 (s)", "吞吐 (张/s)", "备注"],
      rows: [],
    },
    refs: [
      { label: "vLLM-Omni 文档 · 图生图在线推理", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/user_guide/examples/online_serving/image_to_image/" },
      { label: "vLLM-Omni 文档 · 图像编辑 API", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/serving/image_edit_api/" },
      { label: "recipes.vllm.ai · Qwen-Image", url: "https://recipes.vllm.ai/Qwen/Qwen-Image" },
      { label: "支持模型矩阵", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/" },
    ],
  },
  {
    id: "qwen-image-edit-2509",
    name: "Qwen-Image-Edit-2509",
    series: "qwen-image",
    seriesName: "Qwen-Image 系列",
    org: "Qwen",
    tasks: ["图像编辑"],
    params: "20B",
    hfRepo: "Qwen/Qwen-Image-Edit-2509",
    npu: true,
    npuNote: "",
    summary: "多参考图像融合编辑（角色 + 场景 + 风格）",
    intro: `
      <p><strong>Qwen-Image-Edit-2509</strong> 是 Qwen-Image 的多图编辑版本（2025 年 9 月）：支持输入<strong>多张参考图像</strong>（如角色、场景、风格各一张）融合编辑，无需训练即可组合多素材。</p>
      <p>官方支持矩阵标注其在昇腾 NPU 上<strong>支持</strong>。</p>
    `,
    arch: {
      text: `
        <p>在 Qwen-Image-Edit 基础上扩展为多参考图像条件输入：多张参考图分别经 VAE 编码后注入 DiT，文本指令同时提供编辑语义。</p>
        <p>数据流：多张参考图像（VAE 编码）+ 文本指令 → DiT → VAE 解码 → 融合编辑图像。</p>
      `,
    },
    serve: [
      {
        title: "部署推理服务 · vllm serve",
        lang: "bash",
        code: `vllm serve Qwen/Qwen-Image-Edit-2509 --omni --port 8092

# 显存受限时追加
#   --vae-use-slicing --vae-use-tiling`,
      },
      {
        title: "客户端调用 · /v1/chat/completions（多图编辑）",
        lang: "bash",
        code: `curl -s http://localhost:8092/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{"messages":[{"role":"user","content":[
        {"type":"text","text":"Combine the character with the background scene"},
        {"type":"image_url","image_url":{"url":"data:image/png;base64,<角色图BASE64>"}},
        {"type":"image_url","image_url":{"url":"data:image/png;base64,<场景图BASE64>"}}]}],
      "extra_body":{"height":1024,"width":1024,"num_inference_steps":50,"guidance_scale":1,"seed":42}}' \\
  | jq -r '.choices[0].message.content[0].image_url.url' | cut -d',' -f2 | base64 -d > output.png`,
      },
    ],
    perf: {
      columns: ["分辨率", "推理步数", "机型", "部署配置", "单张耗时 (s)", "吞吐 (张/s)", "备注"],
      rows: [],
    },
    refs: [
      { label: "vLLM-Omni 文档 · 图像编辑 API", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/serving/image_edit_api/" },
      { label: "recipes.vllm.ai · Qwen-Image", url: "https://recipes.vllm.ai/Qwen/Qwen-Image" },
      { label: "支持模型矩阵", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/" },
    ],
  },
  {
    id: "qwen-image-edit-2511",
    name: "Qwen-Image-Edit-2511",
    series: "qwen-image",
    seriesName: "Qwen-Image 系列",
    org: "Qwen",
    tasks: ["图像编辑"],
    params: "20B",
    hfRepo: "Qwen/Qwen-Image-Edit-2511",
    npu: true,
    npuNote: "",
    summary: "一致性增强 + 内置 LoRA 的多图编辑",
    intro: `
      <p><strong>Qwen-Image-Edit-2511</strong> 是 Qwen-Image 多图编辑的增强版本（2025 年 11 月）：进一步提升编辑一致性，并内置 LoRA 风格支持。</p>
      <p>官方支持矩阵标注其在昇腾 NPU 上<strong>支持</strong>。</p>
    `,
    arch: {
      text: `
        <p>与 Qwen-Image-Edit-2509 相同的多参考图像条件 DiT 架构，权重更新并内置 LoRA 风格能力。</p>
        <p>数据流：多张参考图像（VAE 编码）+ 文本指令 → DiT → VAE 解码 → 编辑图像。</p>
      `,
    },
    serve: [
      {
        title: "部署推理服务 · vllm serve",
        lang: "bash",
        code: `vllm serve Qwen/Qwen-Image-Edit-2511 --omni --port 8000`,
      },
      {
        title: "客户端调用 · /v1/chat/completions（多图编辑）",
        lang: "bash",
        code: `curl -s http://localhost:8000/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{"messages":[{"role":"user","content":[
        {"type":"text","text":"Combine the character with the background scene"},
        {"type":"image_url","image_url":{"url":"data:image/png;base64,<角色图BASE64>"}},
        {"type":"image_url","image_url":{"url":"data:image/png;base64,<场景图BASE64>"}}]}],
      "extra_body":{"height":1024,"width":1024,"num_inference_steps":50,"guidance_scale":1,"seed":42}}' \\
  | jq -r '.choices[0].message.content[0].image_url.url' | cut -d',' -f2 | base64 -d > output.png`,
      },
    ],
    perf: {
      columns: ["分辨率", "推理步数", "机型", "部署配置", "单张耗时 (s)", "吞吐 (张/s)", "备注"],
      rows: [],
    },
    refs: [
      { label: "vLLM-Omni 文档 · 图像编辑 API", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/serving/image_edit_api/" },
      { label: "支持模型矩阵", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/" },
    ],
  },
  {
    id: "qwen-image-layered",
    name: "Qwen-Image-Layered",
    series: "qwen-image",
    seriesName: "Qwen-Image 系列",
    org: "Qwen",
    tasks: ["图像编辑"],
    params: "20B",
    hfRepo: "Qwen/Qwen-Image-Layered",
    npu: true,
    npuNote: "",
    summary: "输入图像 → RGBA 分层图层分解",
    intro: `
      <p><strong>Qwen-Image-Layered</strong> 是 Qwen-Image 的图层分解版本（2025 年 12 月）：将输入图像分解为 <strong>RGBA 分层图层</strong>（默认 4 层），每层输出独立的透明 PNG，便于二次创作。</p>
      <p>官方支持矩阵标注其在昇腾 NPU 上<strong>支持</strong>。</p>
    `,
    arch: {
      text: `
        <p>在 Qwen-Image 主干的输出端增加分层预测：DiT 输出多层 RGBA 潜变量，逐层经 VAE 解码为带透明通道的图像。</p>
        <p>数据流：输入图像（VAE 编码）→ DiT → 多层 RGBA → VAE 解码 → 各层透明 PNG。</p>
      `,
    },
    serve: [
      {
        title: "部署推理服务 · vllm serve",
        lang: "bash",
        code: `vllm serve Qwen/Qwen-Image-Layered --omni --port 8093`,
      },
      {
        title: "客户端调用 · /v1/chat/completions（图层分解）",
        lang: "bash",
        code: `curl -s http://localhost:8093/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{"messages":[{"role":"user","content":[
        {"type":"text","text":""},
        {"type":"image_url","image_url":{"url":"data:image/png;base64,<BASE64>"}}]}],
      "extra_body":{"height":1024,"width":1024,"layers":4,"resolution":1024,"cfg_scale":4.0,"num_inference_steps":50,"seed":42}}'

# 响应 content[] 中每个元素对应一层图像（layers 默认 4）`,
      },
    ],
    perf: {
      columns: ["分辨率", "层数", "推理步数", "机型", "部署配置", "单张耗时 (s)", "备注"],
      rows: [],
    },
    refs: [
      { label: "vLLM-Omni 文档 · 图像编辑 API", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/serving/image_edit_api/" },
      { label: "支持模型矩阵", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/" },
    ],
  },

  /* ─────────────────────────── Z-Image 系列 ─────────────────────────── */
  {
    id: "z-image",
    name: "Z-Image",
    series: "z-image",
    seriesName: "Z-Image 系列",
    org: "Tongyi-MAI",
    tasks: ["文生图"],
    params: "—",
    hfRepo: "Tongyi-MAI/Z-Image",
    npu: "unverified",
    npuNote: "官方矩阵未列出，待验证",
    summary: "通义实验室文生图基础模型",
    intro: `
      <p><strong>Z-Image</strong> 是 Tongyi-MAI（通义实验室）开源的文生图模型，DiT 架构，图像质量与文本渲染表现优秀。</p>
      <p><strong>注意：</strong>官方支持矩阵中仅列出蒸馏版 Z-Image-Turbo，基础版在 NPU 上的支持状态<strong>待验证</strong>。</p>
    `,
    arch: {
      text: `
        <p>DiT 文生图管线：文本编码器 + DiT + VAE。</p>
        <p>数据流：文本提示词 → 文本编码器 → DiT 去噪 → VAE 解码 → 图像。</p>
      `,
    },
    serve: [
      {
        title: "部署推理服务 · vllm serve",
        lang: "bash",
        code: `vllm serve Tongyi-MAI/Z-Image --omni --port 8091`,
        note: "NPU 支持状态待验证，建议优先使用官方矩阵列出的 Z-Image-Turbo。",
      },
      {
        title: "客户端调用 · /v1/images/generations",
        lang: "bash",
        code: `curl -X POST http://localhost:8091/v1/images/generations \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "a cup of coffee on the table", "size": "1024x1024", "seed": 42}' \\
  | jq -r '.data[0].b64_json' | base64 -d > coffee.png`,
      },
    ],
    perf: {
      columns: ["分辨率", "推理步数", "机型", "部署配置", "单张耗时 (s)", "吞吐 (张/s)", "备注"],
      rows: [],
    },
    refs: [
      { label: "vLLM-Omni 文档 · 图像生成 API", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/serving/image_generation_api/" },
      { label: "支持模型矩阵", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/" },
    ],
  },
  {
    id: "z-image-turbo",
    name: "Z-Image-Turbo",
    series: "z-image",
    seriesName: "Z-Image 系列",
    org: "Tongyi-MAI",
    tasks: ["文生图"],
    params: "—",
    hfRepo: "Tongyi-MAI/Z-Image-Turbo",
    npu: true,
    npuNote: "仅支持 TP=2",
    summary: "4~9 步快速出图的蒸馏版本",
    intro: `
      <p><strong>Z-Image-Turbo</strong> 是 Z-Image 的蒸馏加速版本：<strong>4~9 步</strong>即可出图（通常关闭 CFG），推理效率大幅提升。</p>
      <p>官方支持矩阵标注其在昇腾 NPU 上<strong>支持</strong>（全平台支持）。注意：num_heads=30，仅支持 <strong>tensor_parallel_size=2</strong>。</p>
    `,
    arch: {
      text: `
        <p>与 Z-Image 相同的 DiT 文生图管线（文本编码器 + DiT + VAE），蒸馏后以极少的采样步数出图，通常不应用 CFG。</p>
        <p>数据流：文本提示词 → 文本编码器 → DiT 去噪（4~9 步）→ VAE 解码 → 图像。</p>
      `,
    },
    serve: [
      {
        title: "部署推理服务 · vllm serve",
        lang: "bash",
        code: `vllm serve Tongyi-MAI/Z-Image-Turbo --omni --port 8000

# 注意：num_heads=30，仅支持 tensor_parallel_size=2`,
      },
      {
        title: "客户端调用 · /v1/images/generations",
        lang: "bash",
        code: `curl -X POST http://localhost:8000/v1/images/generations \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "a black and white cat wearing a princess tiara", "size": "1024x1024", "num_inference_steps": 9, "seed": 42}' \\
  | jq -r '.data[0].b64_json' | base64 -d > cat.png`,
      },
    ],
    perf: {
      columns: ["分辨率", "推理步数", "机型", "部署配置", "单张耗时 (s)", "吞吐 (张/s)", "备注"],
      rows: [],
    },
    refs: [
      { label: "vLLM-Omni 文档 · 图像生成 API", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/serving/image_generation_api/" },
      { label: "vLLM-Omni 文档 · 快速开始", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/getting_started/quickstart/" },
      { label: "支持模型矩阵", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/" },
    ],
  },
];

/* ============================================================
 * vLLM-Omni 特性清单
 * 每个分类下为特性条目：name 名称 / desc 一句话介绍 / url 官方文档
 * 链接均为官方文档（docs.vllm.ai 与 docs.vllm.com.cn 路径一致）
 * ============================================================ */
window.FEATURES = [
  {
    category: "服务接口",
    items: [
      { name: "图像生成 API", desc: "OpenAI DALL-E 兼容的文生图 API，基于扩散模型。", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/serving/image_generation_api/" },
      { name: "图像编辑 API", desc: "OpenAI DALL-E 兼容的图像编辑 API，基于扩散模型。", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/serving/image_edit_api/" },
      { name: "视频生成 API", desc: "OpenAI 兼容视频生成 API：/v1/videos 异步任务 + /v1/videos/sync 同步基准接口。", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/serving/videos_api/" },
      { name: "视频流输入 API", desc: "WebSocket 流式输入视频帧与可选音频块，并基于缓冲的会话上下文提问。", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/serving/video_stream_api/" },
      { name: "Chat Completions API", desc: "通过 /v1/chat/completions 生成/编辑图像，可传 num_inference_steps、height、width 等生成参数。", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/serving/chat_completions_api/" },
      { name: "音频生成 API", desc: "基于扩散模型（如 Stable Audio）的文生音频 API。", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/serving/audio_generate_api/" },
      { name: "语音合成 API（TTS）", desc: "OpenAI 兼容的文生语音（text-to-speech）API。", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/serving/speech_api/" },
    ],
  },
  {
    category: "推理加速",
    items: [
      { name: "Cache-DiT", desc: "通过智能缓存机制加速扩散 Transformer，显著提速且质量损失极小。", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/user_guide/diffusion/cache_acceleration/cache_dit/" },
      { name: "TeaCache", desc: "连续时间步相似时复用计算缓存，约 1.5–2.0 倍提速、质量损失极小。", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/user_guide/diffusion/cache_acceleration/teacache/" },
      { name: "执行模式", desc: "完整请求执行与逐步（step-wise）扩散执行，共用同一异步输出流。", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/user_guide/diffusion/execution_modes/" },
      { name: "扩散连续批处理", desc: "统一扩散执行架构，max_num_seqs>1 时多请求合并去噪。", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/design/feature/diffusion_continuous_batching/" },
    ],
  },
  {
    category: "并行策略",
    items: [
      { name: "并行加速总览", desc: "介绍用于加速扩散推理、降低单卡显存需求的各类并行方法。", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/user_guide/diffusion/parallelism/overview/" },
      { name: "张量并行（TP）", desc: "把部分模型权重（通常 Linear 层）切分到多卡，支撑单卡放不下的大模型。", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/user_guide/diffusion/parallelism/tensor_parallel/" },
      { name: "序列并行（SP）", desc: "沿序列维切分输入（DeepSpeed Ulysses、Ring Attention 等），大图/视频可提速 1.5–3.6 倍。", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/user_guide/diffusion/parallelism/sequence_parallel/" },
      { name: "CFG 并行", desc: "把 CFG 正/负向 pass 分发到不同 GPU，开启 CFG 时约 1.8 倍提速。", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/user_guide/diffusion/parallelism/cfg_parallel/" },
      { name: "HSDP（混合分片数据并行）", desc: "跨卡切分模型权重降低单卡显存，让 Wan2.2 14B 等大模型跑在低显存 GPU 上。", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/user_guide/diffusion/parallelism/hsdp/" },
      { name: "VAE 并行", desc: "把 VAE 编解码分布到多卡：patch/tile 并行与 Wan 空间分片解码。", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/user_guide/diffusion/parallelism/vae_parallelism/" },
      { name: "专家并行（EP / MoE）", desc: "只切分 MoE 专家 MLP 块，显著降低 MoE 模型显存占用。", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/user_guide/diffusion/parallelism/expert_parallel/" },
      { name: "流水线并行（PP）", desc: "按 block 把去噪 Transformer 拆成串行 stage 分布到多卡。", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/user_guide/diffusion/parallelism/pipeline_parallel/" },
    ],
  },
  {
    category: "显存优化与卸载",
    items: [
      { name: "CPU 卸载", desc: "模型级顺序卸载与逐层（Layerwise）卸载两种策略，降低扩散模型显存占用。", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/user_guide/diffusion/cpu_offload/" },
      { name: "分布式逐层卸载（DLO）", desc: "逐层卸载的多卡扩展：每 rank 仅存 1/dp_size 权重、运行时 AllGather 重建，支持 CUDA 与昇腾 NPU。", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/design/feature/distributed_layerwise_offload/" },
    ],
  },
  {
    category: "量化",
    items: [
      { name: "量化总览", desc: "统一 quantization_config 入口，覆盖纯扩散、多阶段 Omni/TTS 与多阶段扩散模型。", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/user_guide/quantization/overview/" },
      { name: "FP8 W8A8", desc: "加载时把 BF16/FP16 权重转 FP8，默认在线激活缩放、无需校准。", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/user_guide/quantization/fp8/" },
      { name: "Int8 W8A8", desc: "CUDA 与昇腾 NPU 支持 W8A8 扩散 Transformer 推理，可加载时量化或直接加载 Int8 checkpoint。", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/user_guide/quantization/int8/" },
      { name: "MXFP4 W4A4", desc: "OCP MX 格式将权重与激活量化到 FP4，每 32 个 K 维元素共享一个 FP8 指数 scale。", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/user_guide/quantization/mxfp4/" },
      { name: "MXFP8 W8A8", desc: "OCP MX 格式将权重与激活量化到 FP8，精度优于 channel-wise 量化。", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/user_guide/quantization/mxfp8/" },
      { name: "msModelSlim（昇腾）", desc: "昇腾压缩工具包，产出预量化 checkpoint，经 Ascend/NPU 路径以 --quantization ascend 运行。", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/user_guide/quantization/msmodelslim/" },
    ],
  },
  {
    category: "功能扩展",
    items: [
      { name: "ComfyUI 集成", desc: "基于在线推理 API 的 ComfyUI 集成，请求可发往本地或远程 vLLM-Omni 服务。", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/features/comfyui/" },
      { name: "自定义管线扩展", desc: "通过 WorkerWrapperBase 与 CustomPipelineWorkerExtension，在不改核心代码的前提下替换/扩展扩散流水线。", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/features/custom_pipeline/" },
      { name: "会话状态管理器（实验性）", desc: "为会话类模型（DreamZero、Cosmos3 等）提供跨 stage 的持久状态管理与显存核算。", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/features/session_state_manager/" },
      { name: "睡眠模式（Sleep Mode）", desc: "无需停止服务即可临时释放模型权重与 KV 缓存等显存，支持按 stage 两级休眠与唤醒。", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/features/sleep_mode/" },
    ],
  },
  {
    category: "昇腾 NPU 与运维",
    items: [
      { name: "昇腾 NPU 安装", desc: "通过社区维护的 vLLM Ascend Plugin（vllm-ascend）在昇腾 NPU 上运行 vLLM-Omni。", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/getting_started/installation/npu/" },
      { name: "Prometheus 指标", desc: "通过 OpenAI 兼容 API 服务器的 /metrics 端点暴露 Prometheus 指标。", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/usage/metrics/" },
    ],
  },
];

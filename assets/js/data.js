/* ============================================================
 * vLLM-Omni × Ascend NPU 模型画廊 —— 核心数据源
 * ------------------------------------------------------------
 * 新增模型：复制一条记录并按字段填写，主页与详情页会自动更新。
 * 填性能数据：在对应模型 perf.rows 中添加数组行，
 *             每行列数与 perf.columns 一一对应。
 * NPU 状态取值：true=支持 / false=暂不支持 / "unverified"=待验证
 * ============================================================ */

window.MODELS = [
  /* ─────────────────────────── Wan 2.1 系列 ─────────────────────────── */
  {
    id: "wan21-t2v-1.3b",
    name: "Wan2.1-T2V-1.3B",
    series: "wan21",
    seriesName: "Wan 2.1 系列",
    org: "Wan-AI",
    tasks: ["文生视频"],
    params: "1.3B（稠密）",
    paramsDetail: "DiT 1.3B（另有 T5 文本编码器 4.9B、VAE）",
    hfRepo: "Wan-AI/Wan2.1-T2V-1.3B-Diffusers",
    msRepo: "Wan-AI/Wan2.1-T2V-1.3B-Diffusers",
    npu: true,
    npuNote: "",
    summary: "Wan 2.1 轻量文生视频模型，低显存友好",
    intro: `
      <p>Wan 2.1 是阿里万相团队发布的视频生成基础模型。<strong>Wan2.1-T2V-1.3B</strong> 是其轻量文生视频版本：1.3B 稠密 DiT，支持中英文提示词，显存占用低，适合资源受限场景与快速验证。</p>
      <p>官方支持矩阵标注其在昇腾 NPU 上<strong>支持</strong>（与 Wan2.2-T2V 共用 WanPipeline 入口）。</p>
    `,
    arch: {
      text: `
        <p>3D 因果视频 VAE + T2V 文本编码器 + DiT 主干，采用 Flow Matching 调度（flow_shift）。</p>
        <p>数据流：文本提示词 → 文本编码器 → DiT 去噪 → VAE 解码 → 视频帧。</p>
      `,
    },
    serve: [
      {
        title: "部署推理服务 · vllm serve",
        lang: "bash",
        code: `# 基础启动
vllm serve Wan-AI/Wan2.1-T2V-1.3B-Diffusers --omni --port 8091

# VAE 并行示例（官方 VAE 并行文档）
vllm serve Wan-AI/Wan2.1-T2V-1.3B-Diffusers --omni \\
  --tensor-parallel-size 2 \\
  --vae-patch-parallel-size 2 \\
  --vae-parallel-mode spatial_shard_width`,
        note: "官方在线服务示例页的完整命令以 Wan2.2 为例，Wan2.1 使用同一 WanPipeline 入口；参数以官方文档为准。",
      },
      {
        title: "客户端调用 · /v1/videos（异步任务）",
        lang: "bash",
        code: `curl -X POST http://localhost:8091/v1/videos \\
  -F "prompt=A cinematic view of a futuristic city at sunset" \\
  -F "width=832" -F "height=480" -F "num_frames=33" -F "fps=16" \\
  -F "negative_prompt=low quality, blurry, static" \\
  -F "num_inference_steps=40" -F "guidance_scale=5.0" \\
  -F "flow_shift=5.0" -F "seed=42"

# 创建后轮询 GET /v1/videos/{id} 至 completed，再下载
#   curl -L http://localhost:8091/v1/videos/{id}/content -o out.mp4`,
      },
    ],
    perf: {
      columns: ["任务", "分辨率", "帧数 / 时长", "帧率 (fps)", "推理步数", "机型", "卡数", "框架版本", "端到端时间 (s)", "备注"],
      rows: [],
    },
    refs: [
      { label: "支持模型矩阵", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/" },
      { label: "vLLM-Omni 文档 · 文生视频在线推理", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/user_guide/examples/online_serving/text_to_video/" },
      { label: "vLLM-Omni 文档 · VAE 并行", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/user_guide/diffusion/parallelism/vae_parallelism/" },
    ],
  },
  {
    id: "wan21-t2v-14b",
    name: "Wan2.1-T2V-14B",
    series: "wan21",
    seriesName: "Wan 2.1 系列",
    org: "Wan-AI",
    tasks: ["文生视频"],
    params: "14B（稠密）",
    paramsDetail: "DiT 14B（另有 T5 文本编码器 4.9B、VAE）",
    hfRepo: "Wan-AI/Wan2.1-T2V-14B-Diffusers",
    msRepo: "Wan-AI/Wan2.1-T2V-14B-Diffusers",
    npu: true,
    npuNote: "",
    summary: "Wan 2.1 旗舰文生视频模型",
    intro: `
      <p><strong>Wan2.1-T2V-14B</strong> 是 Wan 2.1 的旗舰文生视频版本：14B 稠密 DiT，支持中英文提示词，生成 480P/720P 高质量视频。</p>
      <p>官方支持矩阵标注其在昇腾 NPU 上<strong>支持</strong>（与 Wan2.2-T2V 共用 WanPipeline 入口）。</p>
    `,
    arch: {
      text: `
        <p>3D 因果视频 VAE + T2V 文本编码器 + DiT 主干，Flow Matching 调度（flow_shift）。</p>
        <p>数据流：文本提示词 → 文本编码器 → DiT 去噪 → VAE 解码 → 视频帧。</p>
      `,
    },
    serve: [
      {
        title: "部署推理服务 · vllm serve",
        lang: "bash",
        code: `# 基础启动
vllm serve Wan-AI/Wan2.1-T2V-14B-Diffusers --omni --port 8091

# 显存受限时可追加逐层卸载
#   --enable-layerwise-offload`,
        note: "官方在线服务示例页的完整命令以 Wan2.2 为例，Wan2.1 使用同一 WanPipeline 入口；参数以官方文档为准。",
      },
      {
        title: "客户端调用 · /v1/videos（异步任务）",
        lang: "bash",
        code: `curl -X POST http://localhost:8091/v1/videos \\
  -F "prompt=A cinematic view of a futuristic city at sunset" \\
  -F "width=832" -F "height=480" -F "num_frames=33" -F "fps=16" \\
  -F "negative_prompt=low quality, blurry, static" \\
  -F "num_inference_steps=40" -F "guidance_scale=5.0" \\
  -F "flow_shift=5.0" -F "seed=42"

# 创建后轮询 GET /v1/videos/{id} 至 completed，再下载
#   curl -L http://localhost:8091/v1/videos/{id}/content -o out.mp4`,
      },
    ],
    perf: {
      columns: ["任务", "分辨率", "帧数 / 时长", "帧率 (fps)", "推理步数", "机型", "卡数", "框架版本", "端到端时间 (s)", "备注"],
      rows: [],
    },
    refs: [
      { label: "支持模型矩阵", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/" },
      { label: "vLLM-Omni 文档 · 文生视频在线推理", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/user_guide/examples/online_serving/text_to_video/" },
    ],
  },
  {
    id: "wan21-i2v-480p",
    name: "Wan2.1-I2V-14B-480P",
    series: "wan21",
    seriesName: "Wan 2.1 系列",
    org: "Wan-AI",
    tasks: ["图生视频"],
    params: "14B（稠密）",
    paramsDetail: "DiT 14B（另有 T5 文本编码器 4.9B、VAE）",
    hfRepo: "Wan-AI/Wan2.1-I2V-14B-480P",
    msRepo: "Wan-AI/Wan2.1-I2V-14B-480P",
    npu: true,
    npuNote: "",
    summary: "参考图像驱动的图生视频（480P）",
    intro: `
      <p><strong>Wan2.1-I2V-14B-480P</strong> 是 Wan 2.1 的图生视频模型：输入一张参考图像 + 文本提示词，生成与之语义一致的 480P 视频。</p>
      <p><strong>注意：</strong>官方 vllm-omni 支持矩阵未列出 Wan2.1-I2V（图生视频仅记录 Wan2.2-I2V-A14B），本站在 NPU 上的支持状态以<strong>本地实测为准</strong>。</p>
    `,
    arch: {
      text: `
        <p>与 Wan2.1-T2V 相同的 3D 因果视频 VAE + T2V 文本编码器 + DiT 主干（Flow Matching 调度），差异在于参考图像经 VAE 编码后作为条件注入。</p>
        <p>数据流：参考图像（VAE 编码）+ 文本提示词 → DiT 去噪 → VAE 解码 → 视频帧。</p>
      `,
    },
    serve: [
      {
        title: "部署推理服务 · vllm serve",
        lang: "bash",
        code: `# 基础启动（HF 仓库）
vllm serve Wan-AI/Wan2.1-I2V-14B-480P --omni --port 8091

# 多卡示例（tp2sp2cfg2，参照本地实测）
vllm serve /path/to/Wan2.1-I2V-14B-480P --omni \\
  --port 8091 \\
  --usp 2 --cfg-parallel-size 2 \\
  --vae-patch-parallel-size 8 --vae-use-tiling`,
        note: "官方文档未提供 Wan2.1-I2V 的 serve 示例（矩阵未列出），命令参照 Wan2.1-T2V 模式；参数以本地实测为准，可直接编辑 scripts/wan21-i2v-480p.sh 同步页面。",
      },
      {
        title: "客户端调用 · /v1/videos（图生视频）",
        lang: "bash",
        code: `curl -X POST http://localhost:8091/v1/videos \\
  -F "prompt=The cat turns its head to look at the camera" \\
  -F "input_reference=@/path/to/reference.png" \\
  -F "width=832" -F "height=480" -F "num_frames=33" -F "fps=16" \\
  -F "num_inference_steps=40" -F "guidance_scale=5.0" \\
  -F "flow_shift=5.0" -F "seed=42"`,
      },
    ],
    perf: {
      columns: ["任务", "分辨率", "帧数 / 时长", "帧率 (fps)", "推理步数", "机型", "卡数", "框架版本", "端到端时间 (s)", "备注"],
      rows: [],
    },
    refs: [
      { label: "HuggingFace · Wan2.1-I2V-14B-480P", url: "https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-480P" },
      { label: "支持模型矩阵", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/" },
    ],
  },
  {
    id: "wan21-i2v-720p",
    name: "Wan2.1-I2V-14B-720P",
    series: "wan21",
    seriesName: "Wan 2.1 系列",
    org: "Wan-AI",
    tasks: ["图生视频"],
    params: "14B（稠密）",
    paramsDetail: "DiT 14B（另有 T5 文本编码器 4.9B、VAE）",
    hfRepo: "Wan-AI/Wan2.1-I2V-14B-720P",
    msRepo: "Wan-AI/Wan2.1-I2V-14B-720P",
    npu: true,
    npuNote: "",
    summary: "参考图像驱动的图生视频（720P）",
    intro: `
      <p><strong>Wan2.1-I2V-14B-720P</strong> 是 Wan 2.1 的图生视频模型：输入一张参考图像 + 文本提示词，生成与之语义一致的 720P 视频。</p>
      <p><strong>注意：</strong>官方 vllm-omni 支持矩阵未列出 Wan2.1-I2V（图生视频仅记录 Wan2.2-I2V-A14B），本站在 NPU 上的支持状态以<strong>本地实测为准</strong>。</p>
    `,
    arch: {
      text: `
        <p>与 Wan2.1-T2V 相同的 3D 因果视频 VAE + T2V 文本编码器 + DiT 主干（Flow Matching 调度），差异在于参考图像经 VAE 编码后作为条件注入。</p>
        <p>数据流：参考图像（VAE 编码）+ 文本提示词 → DiT 去噪 → VAE 解码 → 视频帧。</p>
      `,
    },
    serve: [
      {
        title: "部署推理服务 · vllm serve",
        lang: "bash",
        code: `# 基础启动（HF 仓库）
vllm serve Wan-AI/Wan2.1-I2V-14B-720P --omni --port 8091

# 多卡示例（tp2sp2cfg2，参照本地实测）
vllm serve /path/to/Wan2.1-I2V-14B-720P --omni \\
  --port 8091 \\
  --usp 2 --cfg-parallel-size 2 \\
  --vae-patch-parallel-size 8 --vae-use-tiling`,
        note: "官方文档未提供 Wan2.1-I2V 的 serve 示例（矩阵未列出），命令参照 Wan2.1-T2V 模式；参数以本地实测为准，可直接编辑 scripts/wan21-i2v-720p.sh 同步页面。",
      },
      {
        title: "客户端调用 · /v1/videos（图生视频）",
        lang: "bash",
        code: `curl -X POST http://localhost:8091/v1/videos \\
  -F "prompt=The cat turns its head to look at the camera" \\
  -F "input_reference=@/path/to/reference.png" \\
  -F "width=1280" -F "height=720" -F "num_frames=33" -F "fps=16" \\
  -F "num_inference_steps=40" -F "guidance_scale=5.0" \\
  -F "flow_shift=5.0" -F "seed=42"`,
      },
    ],
    perf: {
      columns: ["任务", "分辨率", "帧数 / 时长", "帧率 (fps)", "推理步数", "机型", "卡数", "框架版本", "端到端时间 (s)", "备注"],
      rows: [],
    },
    refs: [
      { label: "HuggingFace · Wan2.1-I2V-14B-720P", url: "https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-720P" },
      { label: "支持模型矩阵", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/" },
    ],
  },

  /* ─────────────────────────── Wan 2.2 系列 ─────────────────────────── */
  {
    id: "wan22-t2v-a14b",
    name: "Wan2.2-T2V-A14B",
    series: "wan22",
    seriesName: "Wan 2.2 系列",
    org: "Wan-AI",
    tasks: ["文生视频"],
    params: "28B（A14B MoE，14B 激活）",
    paramsDetail: "总 28B（A14B MoE，14B 激活参数），双分支高低噪声 DiT 架构",
    hfRepo: "Wan-AI/Wan2.2-T2V-A14B-Diffusers",
    msRepo: "Wan-AI/Wan2.2-T2V-A14B-Diffusers",
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
      columns: ["任务", "分辨率", "帧数 / 时长", "帧率 (fps)", "推理步数", "机型", "卡数", "框架版本", "端到端时间 (s)", "备注"],
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
    paramsDetail: "总 28B（A14B MoE，14B 激活参数），双分支高低噪声 DiT（参考图像条件注入）",
    hfRepo: "Wan-AI/Wan2.2-I2V-A14B-Diffusers",
    msRepo: "Wan-AI/Wan2.2-I2V-A14B-Diffusers",
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
      columns: ["任务", "分辨率", "帧数 / 时长", "帧率 (fps)", "推理步数", "机型", "卡数", "框架版本", "端到端时间 (s)", "备注"],
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
    paramsDetail: "DiT 5B（稠密，统一 T2V + I2V）",
    hfRepo: "Wan-AI/Wan2.2-TI2V-5B-Diffusers",
    msRepo: "Wan-AI/Wan2.2-TI2V-5B-Diffusers",
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
      columns: ["任务", "分辨率", "帧数 / 时长", "帧率 (fps)", "推理步数", "机型", "卡数", "框架版本", "端到端时间 (s)", "备注"],
      rows: [],
    },
    refs: [
      { label: "vLLM-Omni 文档 · 视频生成 API", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/serving/videos_api/" },
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
    paramsDetail: "64B（FL2VA 与 Ref2VA 双分区 DiT，共享 Qwen3-VL 编码器 + 视频 VAE + 音频 VAE）",
    hfRepo: "MiniMaxAI/MiniMax-H3",
    msRepo: "MiniMax/MiniMax-H3",
    npu: true,
    npuNote: "",
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
        note: "可选优化：--diffusion-attention-backend RAINFUSION_ATTN（保持 --ring 1）、export MINDIE_SD_FA_TYPE=ascend_laser_attention、T2VA 可用 --quantization int8；HSDP 需配合 export MULTI_STREAM_MEMORY_REUSE=2。注意：不要加 --enforce-eager（regional compile 会在首个请求时预热）；CFG 已蒸馏，--cfg-parallel-size 必须保持 1。",
      },
      {
        title: "客户端调用 · /v1/videos/sync（t2va / fl2va / ref2va）",
        lang: "bash",
        code: `export API_URL="http://127.0.0.1:9098/v1/videos/sync"

# T2VA（文生视频+音频）
curl -sS -X POST "\${API_URL}" \\
  -F 'prompt=In a snowy blue-purple forest, Ori carefully walks past a sleeping giant; footsteps crunch in the snow while the creature breathes and softly snorts.' \\
  -F 'width=1344' -F 'height=768' -F 'aspect_ratio=16:9' -F 'fps=24' \\
  -F 'num_inference_steps=50' -F 'flow_shift=12' -F 'seed=1101' \\
  -F 'extra_params={"task":"t2va","duration":8.7,"audio_flow_shift":3.0}' \\
  -o t2va.mp4

# FL2VA（首帧驱动）：先 export FIRST_FRAME=/path/to/first_frame.png
curl -sS -X POST "\${API_URL}" \\
  -F 'prompt=A man stands beside a yellow car at night. The car drives away; he follows it with his eyes and begins singing sadly, with synchronized voice and city ambience.' \\
  -F 'fps=24' -F 'num_inference_steps=50' -F 'flow_shift=12' -F 'seed=2101' \\
  -F 'extra_params={"task":"fl2va","duration":8.7,"audio_flow_shift":3.0}' \\
  -F "input_reference=@\${FIRST_FRAME};type=image/png" \\
  -o fl2va.mp4

# REF2VA（参考图 + 音频）：音频需先起本地静态服务提供 URL
curl -sS -X POST "\${API_URL}" \\
  -F 'prompt=A white cat with black mustache and eyebrow markings sits on a beige couch, lip-syncing precisely to the complete reference audio.' \\
  -F 'width=1344' -F 'height=768' -F 'fps=24' -F 'num_inference_steps=50' -F 'flow_shift=12' -F 'seed=3101' \\
  -F 'extra_params={"task":"ref2va","duration":15.0,"audio_flow_shift":3.0}' \\
  -F "input_reference=@\${REF_IMAGE};type=image/png" \\
  -F "audio_reference={\\"audio_url\\":\\"\${AUDIO_URL}\\"}" \\
  -o ref2va.mp4`,
        note: "首尾帧 FL2VA：两个 input_references + extra_params frame_indices=[0,-1]；Ref2VA 引用上限：图像≤9、视频≤3、音频≤3、总数≤12；duration 4~15s、fps 固定 24。",
      },
    ],
    perf: {
      columns: ["任务", "分辨率", "帧数 / 时长", "帧率 (fps)", "推理步数", "机型", "卡数", "框架版本", "端到端时间 (s)", "备注"],
      rows: [["t2va", "1344x768", "124 帧 / 5s", "24", "50", "Ascend910（64GB HBM/卡）", "4", "vllm-omni v0.26.0", "437.85", "t2va, duration 5s, seed 1101"]],
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
    id: "qwen-image-2512",
    name: "Qwen-Image-2512",
    series: "qwen-image",
    seriesName: "Qwen-Image 系列",
    org: "Qwen",
    tasks: ["文生图"],
    params: "20B",
    paramsDetail: "DiT 20B（文本编码器 + DiT + VAE 文生图管线）",
    hfRepo: "Qwen/Qwen-Image-2512",
    msRepo: "Qwen/Qwen-Image-2512",
    npu: true,
    npuNote: "",
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

# 逐步连续批处理（step-wise continuous batching）
#   --step-execution --max-num-seqs 8

# 显存受限时追加
#   --vae-use-slicing --vae-use-tiling`,
      },
      {
        title: "客户端调用 · /v1/images/generations",
        lang: "bash",
        code: `curl http://localhost:8091/v1/images/generations \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "Qwen/Qwen-Image-2512",
    "prompt": "A ceramic teapot on a wooden table",
    "size": "1024x1024",
    "num_inference_steps": 20,
    "seed": 42
  }' \\
  | jq -r '.data[0].b64_json' | base64 -d > teapot.png`,
      },
    ],
    perf: {
      columns: ["任务", "分辨率", "推理步数", "机型", "卡数", "框架版本", "单张耗时 (s)", "备注"],
      rows: [],
    },
    refs: [
      { label: "官方 recipe · Qwen-Image-2512", url: "https://github.com/vllm-project/vllm-omni/blob/main/recipes/Qwen/Qwen-Image-2512.md" },
      { label: "vLLM-Omni 文档 · 图像生成 API", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/serving/image_generation_api/" },
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
    paramsDetail: "DiT 20B（多参考图像条件注入，内置 LoRA 风格能力）",
    hfRepo: "Qwen/Qwen-Image-Edit-2511",
    msRepo: "Qwen/Qwen-Image-Edit-2511",
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
        note: "官方 Qwen-Image-Edit recipe 仅覆盖基础版（多图变体明确不在 recipe 验证范围内），2511 的 API 形式与基础版一致。",
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
      columns: ["任务", "分辨率", "推理步数", "机型", "卡数", "框架版本", "单张耗时 (s)", "备注"],
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
    paramsDetail: "DiT 20B（多层 RGBA 潜变量输出，逐层 VAE 解码）",
    hfRepo: "Qwen/Qwen-Image-Layered",
    msRepo: "Qwen/Qwen-Image-Layered",
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
      columns: ["任务", "分辨率", "层数", "推理步数", "机型", "卡数", "框架版本", "单张耗时 (s)", "备注"],
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
    paramsDetail: "6B（S3-DiT 单流 DiT），文本编码器 + DiT + VAE",
    hfRepo: "Tongyi-MAI/Z-Image",
    msRepo: "Tongyi-MAI/Z-Image",
    npu: true,
    npuNote: "",
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
      columns: ["任务", "分辨率", "推理步数", "机型", "卡数", "框架版本", "单张耗时 (s)", "备注"],
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
    paramsDetail: "6B（S3-DiT 蒸馏版），4~9 步出图，通常关闭 CFG",
    hfRepo: "Tongyi-MAI/Z-Image-Turbo",
    msRepo: "Tongyi-MAI/Z-Image-Turbo",
    npu: true,
    npuNote: "",
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
      columns: ["任务", "分辨率", "推理步数", "机型", "卡数", "框架版本", "单张耗时 (s)", "备注"],
      rows: [],
    },
    refs: [
      { label: "vLLM-Omni 文档 · 图像生成 API", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/serving/image_generation_api/" },
      { label: "vLLM-Omni 文档 · 快速开始", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/getting_started/quickstart/" },
      { label: "支持模型矩阵", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/" },
    ],
  },

  /* ─────────────────────────── LTX 系列 ─────────────────────────── */
  {
    id: "ltx-2.3",
    name: "LTX-2.3",
    series: "ltx",
    seriesName: "LTX 系列",
    org: "Lightricks",
    tasks: ["文生视频", "图生视频", "视频+音频"],
    params: "22B（MoE Transformer，含音频）",
    paramsDetail: "22B（MoE Transformer + Gemma 文本编码器 + 视频 VAE + 音频 VAE + Vocoder）",
    hfRepo: "diffusers/LTX-2.3-Diffusers",
    msRepo: "Lightricks/LTX-2.3",
    npu: true,
    npuNote: "",
    summary: "文生/图生视频 + 同步音频（one-stage / 两阶段 / 蒸馏）",
    intro: `
      <p><strong>LTX-2.3</strong> 是 Lightricks 发布的视频生成模型：同时支持文生视频与图生视频，并生成<strong>同步音频</strong>。提供三种管线：one-stage、两阶段（含 LoRA 上采样）、全蒸馏两阶段。</p>
      <p><strong>注意：</strong>官方支持矩阵仅标注 NVIDIA GPU 与 AMD GPU，<strong>暂未列入 NPU</strong>。默认 768×512、121 帧 @ 24 FPS，LTX-2.3 默认 30 步，视频 CFG 3.0 / 音频 CFG 7.0。</p>
    `,
    arch: {
      text: `
        <p>22B MoE Transformer + Gemma 文本编码器 + 视频 VAE + 音频 VAE + Vocoder：视频与音频同步生成；支持 STG 与跨模态引导。</p>
        <p>数据流：文本（+ 可选参考图）→ 文本编码器 → Transformer 去噪 → 视频 VAE 解码 + 音频 Vocoder → 音画同步视频。</p>
      `,
    },
    serve: [
      {
        title: "部署推理服务 · vllm serve",
        lang: "bash",
        code: `# one-stage 文生/图生视频（含同步音频）
vllm serve diffusers/LTX-2.3-Diffusers --omni --stage-init-timeout 600

# 两阶段（普通，含上采样器）
vllm serve diffusers/LTX-2.3-Diffusers --omni \\
  --model-class-name LTX2TwoStagePipeline \\
  --enable-layerwise-offload \\
  --stage-init-timeout 600

# 两阶段（全蒸馏；LTX2DistilledPipeline 为已废弃别名）
vllm serve diffusers/LTX-2.3-Distilled-Diffusers --omni \\
  --model-class-name LTX2DistilledTwoStagePipeline --stage-init-timeout 600

# CFG 并行（2 卡）
vllm serve diffusers/LTX-2.3-Diffusers --omni \\
  --cfg-parallel-size 2 --stage-init-timeout 600`,
        note: "建议 96GB 级 GPU，或使用 CPU/逐层卸载；num_frames 需为 8k+1，两阶段管线尺寸需被 64 整除。官方矩阵未列入 NPU。",
      },
      {
        title: "客户端调用 · /v1/videos/sync（T2V / I2V）",
        lang: "bash",
        code: `# T2V（文生视频）
curl -X POST http://localhost:8000/v1/videos/sync \\
  -F "prompt=A cinematic close-up of ocean waves at golden hour." \\
  -F "negative_prompt=worst quality, inconsistent motion, blurry, jittery, distorted" \\
  -F "size=768x512" -F "num_frames=121" -F "fps=24" -F "seed=42" \\
  -o ltx_t2v.mp4

# I2V（恰好一张初始图；URL 引用用 image_reference，不可同时给）
curl -X POST http://localhost:8000/v1/videos/sync \\
  -F "prompt=A plush toy astronaut gently waving while the camera slowly pushes in." \\
  -F "negative_prompt=worst quality, inconsistent motion, blurry, jittery, distorted" \\
  -F "input_reference=@/absolute/path/to/reference.png" \\
  -F "size=768x512" -F "num_frames=121" -F "fps=24" -F "seed=42" \\
  -o ltx_i2v.mp4`,
        note: "num_frames 必须为 8k+1（在线 API 默认 1，需显式设置）；视频 CFG 3.0 / 音频 CFG 7.0 可经 extra_params 传（如 video_cfg_scale=3.0、audio_cfg_scale=7.0）。",
      },
    ],
    perf: {
      columns: ["任务", "分辨率", "帧数 / 时长", "帧率 (fps)", "推理步数", "机型", "卡数", "框架版本", "端到端时间 (s)", "备注"],
      rows: [],
    },
    refs: [
      { label: "官方 recipe · LTX-2", url: "https://github.com/vllm-project/vllm-omni/blob/main/recipes/LTX/LTX-2.md" },
      { label: "支持模型矩阵", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/" },
    ],
  },

  /* ─────────────────────────── LingBot-Video 系列 ─────────────────────────── */
  {
    id: "lingbot-video-dense",
    name: "LingBot-Video-Dense-1.3B",
    series: "lingbot",
    seriesName: "LingBot-Video 系列",
    org: "Robbyant",
    tasks: ["文生视频"],
    params: "1.3B（稠密 DiT）",
    paramsDetail: "DiT 1.3B（Qwen3-VL 文本编码器 + Wan 因果 VAE）",
    hfRepo: "robbyant/lingbot-video-dense-1.3b",
    msRepo: "Robbyant/lingbot-video-dense-1.3b",
    npu: false,
    npuNote: "暂不支持",
    summary: "T2V 文生视频（官方当前实现仅支持 T2V）",
    intro: `
      <p><strong>LingBot-Video</strong> 是 Robbyant 开源的视觉生成模型，<strong>Dense-1.3B</strong> 为稠密 DiT 版本。<strong>注意：</strong>当前官方 recipe 仅支持文生视频（T2V），T2I / I2V / TI2V 尚未实现。</p>
      <p><strong>注意：</strong>官方 recipe 仅验证 CUDA 单卡路径，支持矩阵仅标注 NVIDIA GPU，<strong>暂未列入 NPU</strong>。</p>
    `,
    arch: {
      text: `
        <p>稠密 DiT 块 + Qwen3-VL 文本编码器 + Wan 因果 VAE（帧数按 4n+1 取整）+ 共享 FlowUniPC 调度器。</p>
        <p>数据流：文本（+ 可选参考图）→ Qwen3-VL 编码 → DiT → Wan VAE 解码 → 图像 / 视频。</p>
      `,
    },
    serve: [
      {
        title: "部署推理服务 · vllm serve",
        lang: "bash",
        code: `CUDA_VISIBLE_DEVICES=0 \\
vllm serve robbyant/lingbot-video-dense-1.3b \\
  --omni \\
  --model-class-name LingBotVideoPipeline \\
  --default-sampling-params \\
  '{"0":{"num_frames":81,"num_inference_steps":40,"guidance_scale":6.0}}' \\
  --port 8091`,
        note: "官方 recipe 仅验证 CUDA 单卡路径；多卡并行、Cache-DiT、量化、CPU 卸载未验证。官方矩阵未列入 NPU。",
      },
      {
        title: "客户端调用 · /v1/videos（异步任务，仅 T2V）",
        lang: "bash",
        code: `create_response=$(curl -s http://localhost:8091/v1/videos \\
  -F "model=robbyant/lingbot-video-dense-1.3b" \\
  -F "prompt=a robotic arm picks up a red block" \\
  -F "width=320" -F "height=192" -F "num_frames=9" -F "fps=24" \\
  -F "num_inference_steps=2" -F "guidance_scale=3.0" -F "flow_shift=3.0" \\
  -F "seed=42")

video_id=$(echo "$create_response" | jq -r '.id')
while true; do
  status=$(curl -s "http://localhost:8091/v1/videos/\${video_id}" | jq -r '.status')
  [ "\${status}" = "completed" ] && break
  [ "\${status}" = "failed" ] && { curl -s "http://localhost:8091/v1/videos/\${video_id}" | jq .; exit 1; }
  sleep 2
done

curl -L "http://localhost:8091/v1/videos/\${video_id}/content" -o lingbot_t2v.mp4`,
        note: "当前官方 recipe 仅支持 T2V（T2I / I2V / TI2V 未实现）；height/width 需为 16 的倍数，num_frames 为 1 或 4n+1。",
      },
    ],
    perf: {
      columns: ["任务", "分辨率", "帧数 / 时长", "帧率 (fps)", "推理步数", "机型", "卡数", "框架版本", "端到端时间 (s)", "备注"],
      rows: [],
    },
    refs: [
      { label: "官方 recipe · LingBot-Video", url: "https://github.com/vllm-project/vllm-omni/blob/main/recipes/Robbyant/LingBot-Video.md" },
      { label: "在线服务示例 · lingbot_video", url: "https://github.com/vllm-project/vllm-omni/tree/main/examples/online_serving/lingbot_video" },
      { label: "支持模型矩阵", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/" },
    ],
  },
  {
    id: "lingbot-video-moe",
    name: "LingBot-Video-MoE-30B-A3B",
    series: "lingbot",
    seriesName: "LingBot-Video 系列",
    org: "Robbyant",
    tasks: ["文生视频"],
    params: "30B（A3B 路由 MoE，3B 激活）",
    paramsDetail: "总 30B（A3B 路由 MoE，3B 激活参数），Qwen3-VL 编码器 + Wan VAE",
    hfRepo: "robbyant/lingbot-video-moe-30b-a3b",
    msRepo: "Robbyant/lingbot-video-moe-30b-a3b",
    npu: false,
    npuNote: "官方矩阵未列入 NPU",
    summary: "T2V 文生视频的路由 MoE（官方当前实现仅支持 T2V）",
    intro: `
      <p><strong>LingBot-Video-MoE-30B-A3B</strong> 是 LingBot-Video 的路由 MoE 版本：总参数 30B、单 token 激活 3B。<strong>注意：</strong>当前官方 recipe 仅支持文生视频（T2V），T2I / I2V / TI2V 尚未实现。</p>
      <p><strong>注意：</strong>官方 recipe 仅验证 CUDA 单卡 BF16 路径（峰值约 70 GiB 显存），支持矩阵仅标注 NVIDIA GPU，<strong>暂未列入 NPU</strong>。</p>
    `,
    arch: {
      text: `
        <p>路由 MoE DiT 块（3B 激活）+ Qwen3-VL 文本编码器 + Wan 因果 VAE（帧数按 4n+1 取整）+ 共享 FlowUniPC 调度器。</p>
        <p>数据流：文本（+ 可选参考图）→ Qwen3-VL 编码 → MoE DiT → Wan VAE 解码 → 图像 / 视频。</p>
      `,
    },
    serve: [
      {
        title: "部署推理服务 · vllm serve",
        lang: "bash",
        code: `CUDA_VISIBLE_DEVICES=0 \\
vllm serve robbyant/lingbot-video-moe-30b-a3b \\
  --omni \\
  --model-class-name LingBotVideoPipeline \\
  --default-sampling-params \\
  '{"0":{"num_frames":81,"num_inference_steps":40,"guidance_scale":6.0}}' \\
  --port 8091`,
        note: "MoE checkpoint 峰值约 67.7 GiB 显存，建议 ≥70 GiB 显存的 GPU。官方矩阵未列入 NPU。",
      },
      {
        title: "客户端调用 · /v1/videos（异步任务，仅 T2V）",
        lang: "bash",
        code: `create_response=$(curl -s http://localhost:8091/v1/videos \\
  -F "model=robbyant/lingbot-video-moe-30b-a3b" \\
  -F "prompt=a robotic arm picks up a red block" \\
  -F "width=320" -F "height=192" -F "num_frames=9" -F "fps=24" \\
  -F "num_inference_steps=2" -F "guidance_scale=3.0" -F "flow_shift=3.0" \\
  -F "seed=42")

video_id=$(echo "$create_response" | jq -r '.id')
while true; do
  status=$(curl -s "http://localhost:8091/v1/videos/\${video_id}" | jq -r '.status')
  [ "\${status}" = "completed" ] && break
  [ "\${status}" = "failed" ] && { curl -s "http://localhost:8091/v1/videos/\${video_id}" | jq .; exit 1; }
  sleep 2
done

curl -L "http://localhost:8091/v1/videos/\${video_id}/content" -o lingbot_moe_t2v.mp4`,
        note: "当前官方 recipe 仅支持 T2V（T2I / I2V / TI2V 未实现）；height/width 需为 16 的倍数，num_frames 为 1 或 4n+1。",
      },
    ],
    perf: {
      columns: ["任务", "分辨率", "帧数 / 时长", "帧率 (fps)", "推理步数", "机型", "卡数", "框架版本", "端到端时间 (s)", "备注"],
      rows: [],
    },
    refs: [
      { label: "官方 recipe · LingBot-Video", url: "https://github.com/vllm-project/vllm-omni/blob/main/recipes/Robbyant/LingBot-Video.md" },
      { label: "支持模型矩阵", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/" },
    ],
  },

  /* ─────────────────────────── LongCat-Image 系列 ─────────────────────────── */
  {
    id: "longcat-image",
    name: "LongCat-Image",
    series: "longcat",
    seriesName: "LongCat-Image 系列",
    org: "meituan-longcat",
    tasks: ["文生图"],
    params: "权重约 27.3 GiB（1024×1024）",
    paramsDetail: "6B（扩散模型部分），DiT 主干包含 transformer_blocks + single_transformer_blocks",
    hfRepo: "meituan-longcat/LongCat-Image",
    msRepo: "meituan-longcat/LongCat-Image",
    npu: true,
    npuNote: "",
    summary: "美团中英双语文生图基础模型",
    intro: `
      <p><strong>LongCat-Image</strong> 是美团 LongCat 团队开源的中英双语文生图模型，默认分辨率 1024×1024，官方离线推理表记录的峰值显存约 71.2 GiB、权重 27.3 GiB。</p>
      <p>官方支持矩阵标注其在昇腾 NPU 上<strong>支持</strong>（全平台 ✓）。注意：官方暂无该模型的专属 serve 文档，在线服务使用标准 --omni 入口（e2e 测试同款）。</p>
    `,
    arch: {
      text: `
        <p>DiT 主干包含 <strong>transformer_blocks</strong> 与 <strong>single_transformer_blocks</strong> 两组 block。特性支持：TeaCache ✓、Cache-DiT ✓、序列并行 ✓、CFG 并行 ✓、张量并行 ✓、逐层 CPU 卸载 ✓；流水线并行 / HSDP / VAE-patch 并行 / FP8 量化 ✗。</p>
        <p>数据流：文本提示词 → 文本编码器 → DiT 去噪 → VAE 解码 → 图像。</p>
      `,
    },
    serve: [
      {
        title: "部署推理服务 · vllm serve",
        lang: "bash",
        code: `# 标准 --omni 入口（官方暂无专属 serve 文档）
vllm serve meituan-longcat/LongCat-Image --omni --port 8091`,
        note: "官方未提供该模型的专属 serve 命令与 NPU 专项说明；支持状态以官方矩阵（NPU ✓）为准，参数以官方文档为准。",
      },
      {
        title: "客户端调用 · /v1/images/generations",
        lang: "bash",
        code: `curl -X POST http://localhost:8091/v1/images/generations \\
  -H "Content-Type: application/json" \\
  -d '{"model": "meituan-longcat/LongCat-Image", "prompt": "a cute cat on the grass", "size": "1024x1024", "seed": 42}' \\
  | jq -r '.data[0].b64_json' | base64 -d > cat.png`,
      },
    ],
    perf: {
      columns: ["任务", "分辨率", "推理步数", "机型", "卡数", "框架版本", "单张耗时 (s)", "备注"],
      rows: [],
    },
    refs: [
      { label: "支持模型矩阵", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/" },
      { label: "vLLM-Omni 文档 · 图像生成 API", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/serving/image_generation_api/" },
    ],
  },
  {
    id: "longcat-image-edit",
    name: "LongCat-Image-Edit",
    series: "longcat",
    seriesName: "LongCat-Image 系列",
    org: "meituan-longcat",
    tasks: ["图像编辑"],
    params: "6B（稠密）",
    paramsDetail: "DiT 6B（transformer_blocks + single_transformer_blocks，参考图像条件注入）",
    hfRepo: "meituan-longcat/LongCat-Image-Edit",
    msRepo: "meituan-longcat/LongCat-Image-Edit",
    npu: true,
    npuNote: "",
    summary: "中英双语指令式图像编辑（6B）",
    intro: `
      <p><strong>LongCat-Image-Edit</strong> 是美团 LongCat 的中英双语图像编辑模型（6B 稠密）：输入参考图像 + 文本指令，输出编辑后的图像。</p>
      <p>官方支持矩阵标注其在昇腾 NPU 上<strong>支持</strong>（全平台 ✓）。官方 recipe 仅给出离线推理示例（建议 ≥40 GiB 显存 GPU），未提供专属 serve 命令；e2e 测试通过标准 --omni 入口服务该模型（可选 --enable-cpu-offload、--cache-backend cache_dit、--ulysses-degree 2）。</p>
    `,
    arch: {
      text: `
        <p>与 LongCat-Image 相同的 DiT 主干（transformer_blocks + single_transformer_blocks），增加参考图像条件输入用于编辑；支持 Cache-DiT / TeaCache 加速。</p>
        <p>数据流：参考图像（VAE 编码）+ 文本指令 → DiT → VAE 解码 → 编辑后图像。</p>
      `,
    },
    serve: [
      {
        title: "部署推理服务 · vllm serve",
        lang: "bash",
        code: `# 标准 --omni 入口（e2e 测试同款，可选加速参数）
vllm serve meituan-longcat/LongCat-Image-Edit --omni --port 8092 \\
  --cache-backend cache_dit --ulysses-degree 2

# 可选：--enable-cpu-offload（e2e 测试中亦使用）`,
        note: "官方未提供专属 serve 文档；以下命令组合来自官方 recipe 与 e2e 测试。支持状态以官方矩阵（NPU ✓）为准。",
      },
      {
        title: "离线推理示例（官方 recipe）",
        lang: "bash",
        code: `python3 ./examples/offline_inference/image_to_image/image_edit.py \\
    --image qwen_bear.png \\
    --prompt "Add a white art board written with colorful text 'vLLM-Omni' on grassland. Add a paintbrush in the bear's hands." \\
    --output output_image_edit.png \\
    --num_inference_steps 50 \\
    --guidance_scale 4.5 \\
    --seed 42 \\
    --model meituan-longcat/LongCat-Image-Edit \\
    --cache_backend cache_dit \\
    --cache_dit_max_continuous_cached_steps 2`,
      },
      {
        title: "客户端调用 · /v1/images/edits（图像编辑）",
        lang: "bash",
        code: `curl -X POST http://localhost:8092/v1/images/edits \\
  -F "model=meituan-longcat/LongCat-Image-Edit" \\
  -F "image=@./input.png" \\
  -F "prompt=Convert this image to watercolor style" \\
  -F "size=1024x1024" \\
  -F "output_format=png"

# 响应 .data[0].b64_json 为编辑后的图像（参数以官方图像编辑 API 文档为准）`,
      },
    ],
    perf: {
      columns: ["任务", "分辨率", "推理步数", "机型", "卡数", "框架版本", "单张耗时 (s)", "备注"],
      rows: [],
    },
    refs: [
      { label: "recipes.vllm.ai · LongCat-Image-Edit", url: "https://recipes.vllm.ai/meituan-longcat/LongCat-Image-Edit" },
      { label: "支持模型矩阵", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/" },
      { label: "vLLM-Omni 文档 · 图像编辑 API", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/serving/image_edit_api/" },
    ],
  },

  /* ─────────────────────────── HunyuanVideo 系列 ─────────────────────────── */
  {
    id: "hunyuanvideo-1.5-t2v",
    name: "HunyuanVideo-1.5-T2V",
    series: "hunyuanvideo",
    seriesName: "HunyuanVideo 系列",
    org: "hunyuanvideo-community",
    tasks: ["文生视频"],
    params: "480p / 720p 双分辨率（DiT）",
    paramsDetail: "DiT 8.3B（Flow Matching，480p/720p 双分辨率），VAE 编解码",
    hfRepo: "hunyuanvideo-community/HunyuanVideo-1.5-Diffusers-480p_t2v",
    msRepo: "Tencent-Hunyuan/HunyuanVideo-1.5",
    npu: true,
    npuNote: "",
    summary: "480p / 720p 文生视频（T2V）",
    intro: `
      <p><strong>HunyuanVideo-1.5</strong> 是腾讯混元开源的视频生成模型，提供 480p 与 720p 两个分辨率的文生视频（T2V）与图生视频（I2V）checkpoint。</p>
      <p><strong>注意：</strong>官方支持矩阵仅标注 NVIDIA GPU 与 AMD GPU，<strong>暂未列入 NPU</strong>。480p BF16 约 35 GB 显存（单张 A100 80GB 可跑），720p 需 FP8 + VAE tiling。</p>
    `,
    arch: {
      text: `
        <p>DiT + VAE 扩散管线（视频，无音频），Flow Matching 调度（flow_shift）。最优配置（官方离线表）：480p T2V flow_shift 5.0 / guidance 6.0 / 50 步；720p T2V 9.0 / 6.0 / 50；CFG 蒸馏版 guidance 1.0。</p>
        <p>数据流：文本提示词 → 文本编码器 → DiT 去噪 → VAE 解码 → 视频帧。</p>
      `,
    },
    serve: [
      {
        title: "部署推理服务 · vllm serve",
        lang: "bash",
        code: `# 480p（默认）
vllm serve hunyuanvideo-community/HunyuanVideo-1.5-Diffusers-480p_t2v --omni \\
  --port 8098 --flow-shift 5.0

# 720p（需 FP8 + VAE tiling）
vllm serve hunyuanvideo-community/HunyuanVideo-1.5-Diffusers-720p_t2v --omni \\
  --port 8098 --flow-shift 9.0 --quantization fp8`,
        note: "OOM 缓解：--vae-use-slicing、--vae-use-tiling、--enable-cpu-offload、--quantization fp8。官方矩阵未列入 NPU。",
      },
      {
        title: "客户端调用 · /v1/videos（异步任务）",
        lang: "bash",
        code: `curl -sS -X POST "http://localhost:8098/v1/videos" \\
  -H "Accept: application/json" \\
  -F "prompt=A little girl wearing a straw hat runs through a summer meadow full of wildflowers. A wide shot is used, with the camera panning right to follow her." \\
  -F "size=832x480" -F "num_frames=33" -F "fps=24" \\
  -F "num_inference_steps=30" -F "guidance_scale=6.0" \\
  -F "flow_shift=5.0" -F "seed=42"

# 轮询 GET /v1/videos/{id} 至 completed，再 GET /v1/videos/{id}/content 下载`,
      },
    ],
    perf: {
      columns: ["任务", "分辨率", "帧数 / 时长", "帧率 (fps)", "推理步数", "机型", "卡数", "框架版本", "端到端时间 (s)", "备注"],
      rows: [],
    },
    refs: [
      { label: "在线服务脚本 · run_server_hunyuan_video_15.sh", url: "https://github.com/vllm-project/vllm-omni/blob/main/examples/online_serving/text_to_video/run_server_hunyuan_video_15.sh" },
      { label: "在线调用脚本 · run_curl_hunyuan_video_15.sh", url: "https://github.com/vllm-project/vllm-omni/blob/main/examples/online_serving/text_to_video/run_curl_hunyuan_video_15.sh" },
      { label: "支持模型矩阵", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/" },
    ],
  },
  {
    id: "hunyuanvideo-1.5-i2v",
    name: "HunyuanVideo-1.5-I2V",
    series: "hunyuanvideo",
    seriesName: "HunyuanVideo 系列",
    org: "hunyuanvideo-community",
    tasks: ["图生视频"],
    params: "480p / 720p 双分辨率（DiT）",
    paramsDetail: "DiT 8.3B（Flow Matching，参考图像条件注入），VAE 编解码",
    hfRepo: "hunyuanvideo-community/HunyuanVideo-1.5-Diffusers-480p_i2v",
    msRepo: "Tencent-Hunyuan/HunyuanVideo-1.5",
    npu: true,
    npuNote: "",
    summary: "480p / 720p 图生视频（I2V）",
    intro: `
      <p><strong>HunyuanVideo-1.5-I2V</strong> 是 HunyuanVideo-1.5 的图生视频版本：输入参考图像 + 文本提示词，生成 480p 或 720p 视频。</p>
      <p><strong>注意：</strong>官方支持矩阵仅标注 NVIDIA GPU 与 AMD GPU，<strong>暂未列入 NPU</strong>。480p BF16 约 35 GB 显存，720p 需 FP8 + VAE tiling。</p>
    `,
    arch: {
      text: `
        <p>与 T2V 相同的 DiT + VAE 管线（视频，无音频），增加参考图像条件输入；Flow Matching 调度（flow_shift）。最优配置（官方离线表）：480p I2V flow_shift 5.0 / guidance 6.0 / 50 步；720p I2V 7.0 / 6.0 / 50。</p>
        <p>数据流：参考图像（VAE 编码）+ 文本提示词 → DiT 去噪 → VAE 解码 → 视频帧。</p>
      `,
    },
    serve: [
      {
        title: "部署推理服务 · vllm serve",
        lang: "bash",
        code: `# 480p（默认）
vllm serve hunyuanvideo-community/HunyuanVideo-1.5-Diffusers-480p_i2v --omni \\
  --port 8099 --flow-shift 5.0

# 720p（需 FP8 + VAE tiling）
vllm serve hunyuanvideo-community/HunyuanVideo-1.5-Diffusers-720p_i2v --omni \\
  --port 8099 --flow-shift 7.0 --quantization fp8`,
        note: "OOM 缓解：--vae-use-slicing、--vae-use-tiling、--enable-cpu-offload、--quantization fp8。官方矩阵未列入 NPU。",
      },
      {
        title: "客户端调用 · /v1/videos（异步任务）",
        lang: "bash",
        code: `curl -sS -X POST "http://localhost:8099/v1/videos" \\
  -H "Accept: application/json" \\
  -F "prompt=A little girl wearing a straw hat runs through a summer meadow full of wildflowers." \\
  -F "input_reference=@/path/to/input.png" \\
  -F "size=832x480" -F "num_frames=33" -F "fps=24" \\
  -F "num_inference_steps=30" -F "guidance_scale=6.0" \\
  -F "flow_shift=5.0" -F "seed=42"

# 轮询 GET /v1/videos/{id} 至 completed，再 GET /v1/videos/{id}/content 下载`,
      },
    ],
    perf: {
      columns: ["任务", "分辨率", "帧数 / 时长", "帧率 (fps)", "推理步数", "机型", "卡数", "框架版本", "端到端时间 (s)", "备注"],
      rows: [],
    },
    refs: [
      { label: "在线服务脚本 · run_server_hunyuan_video_15.sh（I2V）", url: "https://github.com/vllm-project/vllm-omni/blob/main/examples/online_serving/image_to_video/run_server_hunyuan_video_15.sh" },
      { label: "在线调用脚本 · run_curl_hunyuan_video_15.sh（I2V）", url: "https://github.com/vllm-project/vllm-omni/blob/main/examples/online_serving/image_to_video/run_curl_hunyuan_video_15.sh" },
      { label: "支持模型矩阵", url: "https://docs.vllm.com.cn/projects/vllm-omni/en/latest/models/supported_models/" },
    ],
  },

  /* ─────────────────────────── Cosmos3 系列 ─────────────────────────── */
  {
    id: "cosmos3-nano",
    name: "Cosmos3-Nano",
    series: "cosmos3",
    seriesName: "Cosmos3 系列",
    org: "nvidia",
    tasks: ["文生图", "文生视频", "图生视频", "视频+音频"],
    params: "参数量未标注（BF16 权重约 17 GiB）",
    paramsDetail: "16B（MoE 双通路：UND 理解 + GEN 生成），Qwen3-VL 编码器 + Wan VAE + AVAE 音频 tokenizer",
    hfRepo: "nvidia/Cosmos3-Nano",
    msRepo: "nv-community/Cosmos3-Nano",
    npu: true,
    npuNote: "",
    summary: "NVIDIA 全模态世界模型（轻量版）：T2I / T2V / I2V / V2V / 带声音视频 / 动作策略",
    intro: `
      <p><strong>Cosmos3-Nano</strong> 是 NVIDIA Cosmos3 全模态世界模型家族中的轻量成员（ModelScope 同步镜像：nv-community/Cosmos3-Nano）：统一支持文生图（T2I）、文生视频（T2V）、图生视频（I2V）、视频生视频（V2V）、带声音的视频生成（T2VS/I2VS）以及动作策略（forward dynamics / policy / inverse dynamics）。</p>
      <p>官方支持矩阵标注其在昇腾 NPU 上<strong>支持</strong>，并有专门 NPU recipe（1× Ascend 910B/910C，Atlas A2/A3，CANN 8.5.1 + NNAL）验证：T2I 1024²/10 步约 8s、T2V 720p/20 步/49 帧约 55s。注意：NPU 上 --quantization fp8 与 --enable-layerwise-offload 不支持。</p>
    `,
    arch: {
      text: `
        <p>Mixture-of-Transformers 双通路架构：<strong>UND</strong>（理解）通路在文本 token 上做因果自注意力（Qwen3-VL 骨干），<strong>GEN</strong>（生成）通路中视觉 Q 对 [K_und, K_gen] 做交叉注意力。视频侧使用 Wan VAE（时空编解码），声音侧使用 Diffusers-format AVAE 音频 tokenizer（generate_sound 时输出 AAC 48kHz 立体声）。采用流匹配采样（flow_shift）。默认启用安全护栏（guardrail，--no-guardrails 可关闭）。支持 256p / 480p / 720p（16:9、4:3、1:1、3:4、9:16）。</p>
        <p>数据流：文本/图像/视频输入 → Qwen3-VL 编码（UND）→ GEN 交叉注意力去噪 → Wan VAE 解码（+ 音频生成）→ 输出。</p>
      `,
    },
    serve: [
      {
        title: "部署推理服务 · vllm serve（GPU / NPU）",
        lang: "bash",
        code: `# 1× GPU（H200 141GB / B300）或 1× NPU（Ascend 910B/910C，Atlas A2/A3）
vllm serve nvidia/Cosmos3-Nano \\
  --omni \\
  --host 0.0.0.0 --port 8000 \\
  --init-timeout 1800

# 多卡：GPU 用 --ulysses-degree N 或 --tensor-parallel-size N；NPU 用 --tensor-parallel-size 8
# 显存优化（仅 GPU）：--enable-layerwise-offload、--quantization fp8（720p 峰值 ~50GB → ~36GB）
# 关闭 guardrails：追加 --no-guardrails（需自行确认合规）`,
        note: "guardrails 默认开启（需 pip install cosmos-guardrail + HF_TOKEN 访问 gated 仓库 nvidia/Cosmos-1.0-Guardrail）；NPU 上 --quantization fp8 与 --enable-layerwise-offload 不支持。官方实测（1× 910B/910C，bf16，无 guardrails）：T2I 1024²/10 步约 8s；T2V 720p/20 步/49 帧约 55s；I2V 约 25s；V2V 480×320 约 12s；720p 峰值显存约 46 GiB（单卡）。",
      },
      {
        title: "客户端调用 · /v1/images/generations + /v1/videos/sync",
        lang: "bash",
        code: `# T2I（1024x1024，50 步；base64 PNG）
curl -sS -X POST http://localhost:8000/v1/images/generations \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "nvidia/Cosmos3-Nano",
    "prompt": "A photorealistic red sports car on a city street at golden hour, cinematic lighting.",
    "negative_prompt": "blurry, distorted, low quality",
    "size": "1024x1024", "n": 1, "response_format": "b64_json",
    "num_inference_steps": 50, "guidance_scale": 7.0, "seed": 42
  }' | python -c "import sys,json,base64; open('cosmos3_t2i.png','wb').write(base64.b64decode(json.load(sys.stdin)['data'][0]['b64_json']))"

# T2V（1280×720，189 帧 @24fps，35 步）
curl -sS -X POST http://localhost:8000/v1/videos/sync \\
  -H "Accept: video/mp4" \\
  -F "model=nvidia/Cosmos3-Nano" \\
  -F "prompt=A robot arm is cleaning a plate in the kitchen" \\
  -F "negative_prompt=blurry, distorted, low quality, jittery, deformed" \\
  -F "size=1280x720" -F "num_frames=189" -F "fps=24" \\
  -F "num_inference_steps=35" -F "guidance_scale=6.0" \\
  -F "max_sequence_length=4096" -F "flow_shift=10.0" \\
  -F 'extra_params={"use_resolution_template":false,"use_duration_template":false,"guardrails":true}' \\
  -F "seed=123" \\
  -o cosmos3_t2v.mp4

# I2V（参考图）
curl -sS -X POST http://localhost:8000/v1/videos/sync \\
  -H "Accept: video/mp4" \\
  -F "model=nvidia/Cosmos3-Nano" \\
  -F "prompt=The scene comes to life with smooth, natural motion." \\
  -F "negative_prompt=blurry, distorted, low quality" \\
  -F "size=1280x720" -F "num_frames=189" -F "fps=24" \\
  -F "num_inference_steps=35" -F "guidance_scale=6.0" \\
  -F "max_sequence_length=4096" -F "flow_shift=10.0" \\
  -F 'extra_params={"use_resolution_template":false,"use_duration_template":false,"guardrails":true}' \\
  -F "seed=1111" \\
  -F "input_reference=@/path/to/reference.jpg;type=image/jpeg" \\
  -o cosmos3_i2v.mp4

# V2V（参考视频）
curl -sS -X POST http://localhost:8000/v1/videos/sync \\
  -H "Accept: video/mp4" \\
  -F "model=nvidia/Cosmos3-Nano" \\
  -F "prompt=Continue the same scene with smooth natural motion and consistent subjects." \\
  -F "negative_prompt=blurry, distorted, low quality, jittery, deformed" \\
  -F "size=1280x720" -F "num_frames=189" -F "fps=24" \\
  -F "num_inference_steps=35" -F "guidance_scale=6.0" \\
  -F "max_sequence_length=4096" -F "flow_shift=10.0" \\
  -F 'extra_params={"use_resolution_template":false,"use_duration_template":false,"guardrails":true,"condition_frame_indexes_vision":[0,1],"condition_video_keep":"first"}' \\
  -F "seed=2222" \\
  -F "input_reference=@/path/to/reference.mp4;type=video/mp4" \\
  -o cosmos3_v2v.mp4`,
        note: "默认参数（recipe）：T2I 1024²/50 步/guidance 7.0；T2V/I2V/V2V 1280×720/35 步/guidance 6.0/flow_shift 10.0。",
      },
    ],
    perf: {
      columns: ["任务", "分辨率", "帧数 / 时长", "帧率 (fps)", "推理步数", "机型", "卡数", "框架版本", "端到端时间 (s)", "备注"],
      rows: [],
    },
    refs: [
      { label: "ModelScope · nv-community/Cosmos3-Nano", url: "https://www.modelscope.cn/models/nv-community/Cosmos3-Nano" },
      { label: "官方 NPU recipe · Cosmos3-Nano", url: "https://github.com/vllm-project/vllm-omni/blob/main/recipes/cosmos3/Cosmos3-Nano.md" },
      { label: "HuggingFace · nvidia/Cosmos3-Nano", url: "https://huggingface.co/nvidia/Cosmos3-Nano" },
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

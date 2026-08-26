/* ============================================================
 * 详情页渲染：读取 ?id= 参数，按统一模板渲染
 * 区块：01 模型简介（models/<id>/README.md）→ 02 部署推理脚本
 *       （models/<id>/deploy.sh）→ 03 性能数据（models/<id>/perf.json）
 * 经 server.py 访问时三个区块均从 models/ 动态获取；纯静态打开回退 data.js。
 * ============================================================ */
(function () {
  "use strict";

  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const model = (window.MODELS || []).find((m) => m.id === id);

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  const app = document.getElementById("app");

  /* ---------- 未找到模型 ---------- */
  if (!model) {
    app.innerHTML = `
      <div class="not-found">
        <div class="nf-code">404</div>
        <p>未找到模型（id: ${esc(id || "")}）。</p>
        <p style="margin-top:10px"><a href="index.html">← 返回模型列表</a></p>
      </div>`;
    return;
  }

  document.title = `${model.name} · vLLM-Omni × Ascend NPU 模型画廊`;

  /* ---------- 面包屑 ---------- */
  document.getElementById("breadcrumb").innerHTML = `
    <a href="index.html">首页</a><span class="sep">/</span>
    <a href="index.html#${esc(model.series)}">${esc(model.seriesName)}</a><span class="sep">/</span>
    <span>${esc(model.name)}</span>`;

  /* ---------- 徽章 ---------- */
  function npuBadge(m) {
    if (m.npu === true) return `<span class="badge badge-npu ok">NPU ✓ ${esc(m.npuNote || "是")}</span>`;
    if (m.npu === "unverified") return `<span class="badge badge-npu warn">NPU ⏳ 待验证</span>`;
    return `<span class="badge badge-npu no">NPU ✗ 暂不支持</span>`;
  }

  /* ---------- 轻量 Markdown → HTML 渲染器 ----------
   * 支持 README.md 中使用的子集：标题 / 表格 / 段落 / 无序有序列表 /
   * 粗体斜体 / 行内代码 / 链接。零依赖、离线可用。 */
  function mdToHtml(md) {
    let lines = String(md || "").replace(/\r\n/g, "\n").split("\n");
    let html = [];
    let inTable = false;
    let tableHtml = [];
    let inCode = false;
    let codeBuf = [];
    let listBuf = []; // {type: 'ul'|'ol', items: []}
    let para = [];

    function inline(s) {
      s = esc(s);
      s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
      s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
      s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
      return s;
    }

    function flushPara() {
      if (para.length) {
        html.push(`<p>${inline(para.join(" "))}</p>`);
        para = [];
      }
    }

    function flushList() {
      if (!listBuf.length) return;
      const tag = listBuf[0].type;
      html.push(`<${tag}>${listBuf[0].items.map((it) => `<li>${inline(it.text)}</li>`).join("")}</${tag}>`);
      listBuf = [];
    }

    function flushTable() {
      if (inTable && tableHtml.length > 1) {
        html.push(`<div class="table-wrap"><table class="perf-table">${tableHtml.join("")}</table></div>`);
      } else if (tableHtml.length) {
        html.push(`<p>${tableHtml.join(" ")}</p>`);
      }
      tableHtml = [];
      inTable = false;
    }

    for (const raw of lines) {
      const line = raw.trimEnd();

      // 代码块
      if (line.trim().startsWith("```")) {
        if (inCode) {
          html.push(`<pre><code>${esc(codeBuf.join("\n"))}</code></pre>`);
          codeBuf = [];
          inCode = false;
        } else {
          flushPara(); flushList(); flushTable();
          inCode = true;
        }
        continue;
      }
      if (inCode) { codeBuf.push(line); continue; }

      // 表格
      if (line.startsWith("|")) {
        flushPara(); flushList();
        const cells = line.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
        if (/^:?-{2,}:?$/.test(cells.join(""))) {  // 分隔行
          inTable = true;
          continue;
        }
        tableHtml.push(`<tr>${cells.map((c) => (inTable ? `<td>${inline(c)}</td>` : `<th>${inline(c)}</th>`)).join("")}</tr>`);
        continue;
      }
      if (inTable) { flushTable(); }

      // 标题
      let hm = line.match(/^(#{1,4})\s+(.*)$/);
      if (hm) {
        flushPara(); flushList();
        const level = Math.min(hm[1].length + 1, 4);  // h1 → h2 层级（页面已有 h1）
        html.push(`<h${level} class="md-h">${inline(hm[2])}</h${level}>`);
        continue;
      }

      // 列表
      let lm = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
      if (lm) {
        flushPara(); flushTable();
        const type = /^\d+\.$/.test(lm[2]) ? "ol" : "ul";
        if (!listBuf.length || listBuf[0].type !== type) {
          flushList();
          listBuf = [{ type: type, items: [] }];
        }
        listBuf[0].items.push({ text: lm[3] });
        continue;
      }

      // 空行
      if (!line.trim()) {
        flushPara(); flushList(); flushTable();
        continue;
      }

      // 普通段落
      para.push(line.trim());
    }
    flushPara(); flushList(); flushTable();
    if (inCode) html.push(`<pre><code>${esc(codeBuf.join("\n"))}</code></pre>`);
    return html.join("\n");
  }

  /* ---------- 部署脚本代码块 ---------- */
  function serveBlocksHtml(serve) {
    return (serve || [])
      .map((b) => {
        const note = b.note ? `<p class="code-note">${b.note}</p>` : "";
        return `
          <div class="code-block">
            <div class="code-head">
              <span class="cb-title">${esc(b.title || "脚本")}</span>
              <span class="cb-lang">${esc(b.lang || "text")}</span>
              <button class="copy-btn" type="button">复制</button>
            </div>
            <pre><code>${esc(b.code)}</code></pre>
          </div>${note}`;
      })
      .join("");
  }

  /* ---------- 性能数据表 ---------- */
  function perfTableHtml(columns, rows) {
    const cols = columns || [];
    const body = (rows && rows.length)
      ? rows.map((r) => `<tr>${(r || []).map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")
      : `<tr class="perf-empty"><td colspan="${cols.length}">暂无实测数据 —— 待填入（编辑 models/${esc(model.id)}/perf.json 或运行 bench 工具链）</td></tr>`;
    return `
      <div class="table-wrap">
        <table class="perf-table">
          <thead><tr>${cols.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead>
          <tbody>${body}</tbody>
        </table>
      </div>`;
  }

  /* ---------- 静态回退：模型结构 + 参考资料 ----------
   * data.js 的 intro 只含介绍；结构与参考资料在 arch.text / refs 中，
   * 纯静态打开时（fetch 失败）也一并渲染，与 README.md 动态渲染保持一致。 */
  function archHtml(m) {
    return m.arch && m.arch.text ? `<h3 class="md-h">模型结构</h3>${m.arch.text}` : "";
  }

  function refsHtml(m) {
    if (!m.refs || !m.refs.length) return "";
    return `<h3 class="md-h">参考资料</h3><ul>${m.refs
      .map((r) => `<li><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.label)}</a></li>`)
      .join("")}</ul>`;
  }

  /* ---------- 整页渲染（三个区块：简介 / 脚本 / 性能） ---------- */
  app.innerHTML = `
    <section class="page-head">
      <h1>${esc(model.name)}</h1>
      <div class="meta-badges">
        <span class="badge">${esc(model.seriesName)}</span>
        ${model.tasks.map((t) => `<span class="badge">${esc(t)}</span>`).join("")}
        <span class="badge">${esc(model.params)}</span>
        ${npuBadge(model)}
        <a class="hf-link" href="https://huggingface.co/${esc(model.hfRepo)}" target="_blank" rel="noopener">🤗 ${esc(model.hfRepo)}</a>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title"><span class="sec-no">01</span> 模型简介</h2>
      <div class="prose" id="introContent">${model.intro}${archHtml(model)}${refsHtml(model)}</div>
    </section>

    <section class="section">
      <h2 class="section-title"><span class="sec-no">02</span> 部署推理脚本</h2>
      <div id="serveBlocks">${serveBlocksHtml(model.serve)}</div>
    </section>

    <section class="section showcase-section">
      <h2 class="section-title"><span class="sec-no">🎬</span> 推理展示</h2>
      <div class="showcase-placeholder" id="showcaseContainer">
        <div class="showcase-icon">🖼</div>
        <p class="showcase-text">推理结果展示区</p>
        <span class="showcase-hint">部署推理服务后，生成的图片或视频将在此展示</span>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title"><span class="sec-no">03</span> 性能数据</h2>
      <p class="perf-hint" id="perfHint">⚠ 以下为占位表格，性能数据待填入实测结果（NPU 实测）。</p>
      <div id="perfTable">${perfTableHtml(model.perf.columns, model.perf.rows)}</div>
    </section>`;

  /* ---------- 复制按钮 ---------- */
  function bindCopy() {
    app.querySelectorAll(".code-block .copy-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const code = btn.closest(".code-block").querySelector("code").innerText;
        let ok = false;
        try {
          await navigator.clipboard.writeText(code);
          ok = true;
        } catch (e) {
          const t = document.createElement("textarea");
          t.value = code;
          t.style.position = "fixed";
          t.style.opacity = "0";
          document.body.appendChild(t);
          t.select();
          try { ok = document.execCommand("copy"); } catch (e2) { ok = false; }
          document.body.removeChild(t);
        }
        if (ok) {
          btn.textContent = "已复制 ✓";
          setTimeout(() => { btn.textContent = "复制"; }, 1500);
        }
      });
    });
  }
  bindCopy();

  /* ---------- 部署脚本分块解析（deploy.sh 内容 → 代码块数组） ---------- */
  function parseScriptFile(text) {
    const blocks = [];
    let cur = null;
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^# ---------- (.+?) ----------$/);
      if (m) { cur = { title: m[1], code: [], note: "" }; blocks.push(cur); continue; }
      if (!cur) continue; // 文件头注释，跳过
      const nm = line.match(/^# 注: (.*)$/);
      if (nm) { cur.note = (cur.note ? cur.note + " " : "") + nm[1]; continue; }
      cur.code.push(line);
    }
    return blocks.map((b) => ({
      title: b.title,
      lang: "bash",
      code: b.code.join("\n").replace(/\n+$/, ""),
      note: b.note,
    }));
  }

  /* ---------- 动态加载：三个区块均从 models/<id>/ 获取 ----------
   * 经 server.py 访问时生效；纯静态打开（fetch 失败）回退 data.js 内嵌内容。
   */
  (async () => {
    if (typeof fetch !== "function") return;
    const syncNote = (el, text) => {
      if (el) el.insertAdjacentHTML("beforebegin", `<p class="code-note">✓ ${text}</p>`);
    };

    // 01 模型简介：/api/models/<id>/readme（markdown）
    try {
      const resp = await fetch(`/api/models/${encodeURIComponent(model.id)}/readme`, { cache: "no-store" });
      if (resp.ok) {
        const md = await resp.text();
        const el = document.getElementById("introContent");
        if (el && md.trim()) {
          syncNote(el, `已与 models/${esc(model.id)}/README.md 同步，修改该文件后刷新页面即生效`);
          el.innerHTML = mdToHtml(md);
        }
      }
    } catch (e) { /* 纯静态模式：使用 data.js 中的 intro */ }

    // 02 部署脚本：/api/models/<id>/script（deploy.sh）
    try {
      const resp = await fetch(`/api/models/${encodeURIComponent(model.id)}/script`, { cache: "no-store" });
      if (resp.ok) {
        const blocks = parseScriptFile(await resp.text());
        if (blocks.length) {
          const el = document.getElementById("serveBlocks");
          if (el) {
            syncNote(el, `已与 models/${esc(model.id)}/deploy.sh 同步，修改该文件后刷新页面即生效`);
            el.innerHTML = serveBlocksHtml(blocks);
            bindCopy();
          }
        }
      }
    } catch (e) { /* 纯静态模式：使用 data.js 中的 serve */ }

    // 03 性能数据：/api/models/<id>/perf（perf.json）
    try {
      const resp = await fetch(`/api/models/${encodeURIComponent(model.id)}/perf`, { cache: "no-store" });
      if (resp.ok) {
        const data = await resp.json();
        const cols = (data && data.columns) || (model.perf && model.perf.columns) || [];
        const rows = data && Array.isArray(data.rows) ? data.rows : [];
        const el = document.getElementById("perfTable");
        if (!el) return;
        if (!rows.length) return;
        const hint = document.getElementById("perfHint");
        if (hint) hint.style.display = "none";
        syncNote(el, `性能数据已与 models/${esc(model.id)}/perf.json 同步，修改该文件后刷新页面即生效`);
        el.innerHTML = perfTableHtml(cols, rows);
      }
    } catch (e) { /* 纯静态模式：使用 data.js 中的 rows */ }

    // 🎬 推理展示：/api/models/<id>/media（目录下媒体文件）
    try {
      const resp = await fetch(`/api/models/${encodeURIComponent(model.id)}/media`, { cache: "no-store" });
      if (resp.ok) {
        const { files } = await resp.json();
        const container = document.getElementById("showcaseContainer");
        if (container && files && files.length) {
          const mediaHtml = files.map((f) => {
            const url = `/models/${encodeURIComponent(model.id)}/${encodeURIComponent(f)}`;
            const ext = f.split(".").pop().toLowerCase();
            const mediaTag = ["mp4", "webm"].includes(ext)
              ? `<video src="${url}" controls preload="metadata" class="showcase-media-item"></video>`
              : `<img src="${url}" alt="${esc(f)}" class="showcase-media-item" loading="lazy">`;
            return `<figure class="showcase-figure">${mediaTag}<figcaption class="showcase-caption">${esc(f)}</figcaption></figure>`;
          }).join("");
          container.innerHTML = `<div class="showcase-media">${mediaHtml}</div>`;
        }
      }
    } catch (e) { /* media 加载失败，保留占位 */ }
  })();
})();

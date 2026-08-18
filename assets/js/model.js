/* ============================================================
 * 详情页渲染：读取 ?id= 参数，按统一模板渲染
 * 区块：模型简介 → 架构图（占位+文字）→ 部署推理脚本 → 性能数据 → 参考资料
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
    if (m.npu === true) return `<span class="badge badge-npu ok">NPU ✓ ${esc(m.npuNote || "支持")}</span>`;
    if (m.npu === "unverified") return `<span class="badge badge-npu warn">NPU ⏳ 待验证</span>`;
    return `<span class="badge badge-npu no">NPU ✗ 暂不支持</span>`;
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
  function perfTableHtml(perf) {
    const cols = (perf && perf.columns) || [];
    const rows = (perf && perf.rows) || [];
    const body = rows.length
      ? rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")
      : `<tr class="perf-empty"><td colspan="${cols.length}">暂无实测数据 —— 待填入（编辑 assets/js/data.js 中该模型的 perf.rows）</td></tr>`;
    return `
      <div class="table-wrap">
        <table class="perf-table">
          <thead><tr>${cols.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead>
          <tbody>${body}</tbody>
        </table>
      </div>`;
  }

  /* ---------- 参考资料 ---------- */
  function refsHtml(refs) {
    if (!refs || !refs.length) return "";
    return `
      <ul class="ref-list">
        ${refs.map((r) => `<li><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.label)}</a></li>`).join("")}
      </ul>`;
  }

  /* ---------- 整页渲染 ---------- */
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
      <div class="prose">${model.intro}</div>
    </section>

    <section class="section">
      <h2 class="section-title"><span class="sec-no">02</span> 架构图</h2>
      <div class="arch-placeholder">
        <div class="arch-icon">🖼️</div>
        <p class="ph-title">架构图占位 —— 待补充</p>
        <p class="ph-sub">可在此处插入架构图（SVG / PNG），或后续改用 Mermaid 渲染</p>
      </div>
      <div class="prose">${model.arch && model.arch.text ? model.arch.text : ""}</div>
    </section>

    <section class="section">
      <h2 class="section-title"><span class="sec-no">03</span> 部署推理脚本</h2>
      <div id="serveBlocks">${serveBlocksHtml(model.serve)}</div>
    </section>

    <section class="section">
      <h2 class="section-title"><span class="sec-no">04</span> 性能数据</h2>
      <p class="perf-hint">⚠ 以下为占位表格，性能数据待填入实测结果（NPU 实测）。</p>
      ${perfTableHtml(model.perf)}
    </section>

    <section class="section">
      <h2 class="section-title"><span class="sec-no">05</span> 参考资料</h2>
      ${refsHtml(model.refs)}
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

  /* ---------- 部署脚本与 scripts/<模型id>.sh 同步 ----------
   * 通过 server.py 访问时，从 /api/scripts/<id>.sh 读取并渲染；
   * 修改 scripts/ 下的脚本后刷新页面即可生效；纯静态打开时回退 data.js。
   */
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

  (async () => {
    try {
      if (typeof fetch !== "function") return;
      const resp = await fetch(`/api/scripts/${encodeURIComponent(model.id)}.sh`, { cache: "no-store" });
      if (!resp.ok) return;
      const blocks = parseScriptFile(await resp.text());
      if (!blocks.length) return;
      const el = document.getElementById("serveBlocks");
      if (!el) return;
      el.insertAdjacentHTML(
        "beforebegin",
        `<p class="code-note">✓ 已与 scripts/${esc(model.id)}.sh 同步，修改该文件后刷新页面即生效</p>`
      );
      el.innerHTML = serveBlocksHtml(blocks);
      bindCopy();
    } catch (e) { /* 纯静态模式：使用 data.js 中的内容 */ }
  })();
})();

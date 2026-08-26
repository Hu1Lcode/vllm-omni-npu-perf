/* ============================================================
 * 主页渲染：统计、任务筛选 chips、按系列分组的模型卡片墙
 * ============================================================ */
(function () {
  "use strict";

  const models = window.MODELS || [];
  const TASKS = ["全部", "文生图", "图像编辑", "文生视频", "图生视频", "视频+音频"];
  let activeTask = "全部";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* ---------- 顶部统计 ---------- */
  function renderStats() {
    const seriesCount = new Set(models.map((m) => m.series)).size;
    const npuOk = models.filter((m) => m.npu === true).length;
    const npuWait = models.filter((m) => m.npu === "unverified").length;
    const npuNo = models.filter((m) => m.npu === false).length;
    document.getElementById("heroStats").innerHTML = `
      <div class="stat-pill"><b>${seriesCount}</b><span>个系列</span></div>
      <div class="stat-pill"><b>${models.length}</b><span>个模型</span></div>
      <div class="stat-pill"><b>${npuOk}</b><span>NPU ✓ 支持</span></div>
      <div class="stat-pill"><b>${npuWait + npuNo}</b><span>待验证 / 暂不支持</span></div>`;
  }

  /* ---------- 任务筛选 chips ---------- */
  function renderFilters() {
    const root = document.getElementById("filters");
    root.innerHTML = TASKS.map(
      (t) => `<button class="chip${t === activeTask ? " active" : ""}" data-task="${esc(t)}">${esc(t)}</button>`
    ).join("");
    root.querySelectorAll(".chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        activeTask = chip.dataset.task;
        renderFilters();
        renderSeries();
      });
    });
  }

  /* ---------- NPU 徽章 ---------- */
  function npuBadge(m) {
    if (m.npu === true) return `<span class="badge badge-npu ok">NPU ✓ ${esc(m.npuNote || "是")}</span>`;
    if (m.npu === "unverified") return `<span class="badge badge-npu warn">NPU ⏳ 待验证</span>`;
    return `<span class="badge badge-npu no">NPU ✗ 暂不支持</span>`;
  }

  function cardHtml(m) {
    return `
      <a class="card" href="model.html?id=${encodeURIComponent(m.id)}">
        <div class="card-top">
          <h3 class="card-name">${esc(m.name)}</h3>
          ${npuBadge(m)}
        </div>
        <p class="card-summary">${esc(m.summary)}</p>
        <div class="card-meta">
          ${m.tasks.map((t) => `<span class="badge">${esc(t)}</span>`).join("")}
          <span class="card-params">${esc(m.params)}</span>
        </div>
        <span class="card-more">查看详情 →</span>
      </a>`;
  }

  /* ---------- 系列分组卡片墙 ---------- */
  function renderSeries() {
    const root = document.getElementById("seriesList");
    root.innerHTML = "";

    const seriesOrder = [];
    const bySeries = {};
    models.forEach((m) => {
      if (!bySeries[m.series]) { bySeries[m.series] = []; seriesOrder.push(m.series); }
      bySeries[m.series].push(m);
    });

    seriesOrder.forEach((key) => {
      const list = bySeries[key].filter(
        (m) => activeTask === "全部" || m.tasks.includes(activeTask)
      );
      if (!list.length) return;

      const first = bySeries[key][0];
      const section = document.createElement("section");
      section.className = "series-section";
      section.innerHTML = `
        <div class="series-head">
          <h2 id="${esc(key)}">${esc(first.seriesName)}</h2>
          <span class="series-org">${esc(first.org)}</span>
          <span class="series-count">${list.length} 个模型</span>
        </div>
        <div class="cards">${list.map(cardHtml).join("")}</div>`;
      root.appendChild(section);
    });
  }

  /* ---------- 特性清单 ---------- */
  function renderFeatures() {
    const root = document.getElementById("featuresSection");
    if (!root) return;
    const feats = window.FEATURES || [];
    root.innerHTML = feats
      .map(
        (cat) => `
          <div class="feature-cat">
            <h3 class="feature-cat-title">${esc(cat.category)}</h3>
            <ul class="feature-list">
              ${cat.items
                .map(
                  (f) => `
                    <li>
                      <a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.name)}</a>
                      <span class="feature-desc">${esc(f.desc)}</span>
                    </li>`
                )
                .join("")}
            </ul>
          </div>`
      )
      .join("");
  }

  renderStats();
  renderFilters();
  renderSeries();
  renderFeatures();
})();

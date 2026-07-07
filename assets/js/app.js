const App = (() => {
  const app = document.getElementById("app");

  function route() {
    const hash = window.location.hash.replace("#", "");
    if (hash.startsWith("platform/")) {
      renderPlatform(hash.split("/")[1]);
      return;
    }
    if (hash === "trend") {
      renderTrend();
      return;
    }
    renderHome();
  }

  function setHtml(html) {
    app.innerHTML = html;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "未知";
    }
    return date.toLocaleString("zh-TW", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function renderHome() {
    setHtml(`
      <section class="hero">
        <div class="intro-panel">
          <h2>從公開社群訊號觀察婚宴討論熱度</h2>
          <p>資料存在瀏覽器 localStorage，按下平台頁面的爬取按鈕後才會嘗試讀取近 7 天文章。若平台阻擋 CORS、需要登入或沒有公開 API，頁面會顯示清楚原因。</p>
          <div class="notice">
            熱度分數 = 留言數 * 3 + 按讚數 * 2 + 關鍵字命中數 * 5 + 時間新鮮度分數
          </div>
        </div>
        <nav class="home-actions" aria-label="主要功能">
          ${homeButton("ptt")}
          ${homeButton("dcard")}
          ${homeButton("threads")}
          <button class="home-button trend" data-link="#trend">
            <span class="badge">7D</span>
            <span class="button-copy">
              <strong>綜合 7 天熱門議題趨勢分析</strong>
              <small>整合 PTT、Dcard、Threads 最新結果</small>
            </span>
          </button>
        </nav>
      </section>
    `);
    bindLinks();
  }

  function homeButton(platformKey) {
    const platform = APP_CONFIG.platforms[platformKey];
    return `
      <button class="home-button" data-link="#platform/${platform.key}">
        <span class="badge">${platform.badge}</span>
        <span class="button-copy">
          <strong>${platform.label}</strong>
          <small>${platform.description}</small>
        </span>
      </button>
    `;
  }

  function platformRows(items) {
    if (!items.length) {
      return `<p class="summary">目前沒有可顯示文章。請先嘗試爬取，或查看上方錯誤訊息。</p>`;
    }
    return `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>平台</th>
              <th>標題或內容摘要</th>
              <th>日期</th>
              <th>互動數</th>
              <th>留言數</th>
              <th>熱度分數</th>
              <th>分類</th>
              <th>原文連結</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(rowHtml).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function rowHtml(item) {
    return `
      <tr>
        <td>${escapeHtml(item.platform)}</td>
        <td><strong>${escapeHtml(item.title)}</strong><br><span class="summary">${escapeHtml(item.summary || "")}</span></td>
        <td>${formatDate(item.date)}</td>
        <td>${item.interactions}</td>
        <td>${item.comments}</td>
        <td>${item.heatScore}</td>
        <td>${escapeHtml(item.category)}</td>
        <td><a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">開啟</a></td>
      </tr>
    `;
  }

  function renderPlatform(platformKey) {
    const platform = APP_CONFIG.platforms[platformKey];
    if (!platform) {
      renderHome();
      return;
    }
    const data = RadarStorage.readPlatform(platformKey);
    const latest = data.latest;
    const items = latest?.items || [];
    const errors = latest?.errors || [];

    setHtml(`
      <section id="pdfArea" class="tool-panel">
        <span class="badge">${platform.badge}</span>
        <h2>${platform.label} 分析頁</h2>
        <p class="summary">${platform.description}</p>
        <div class="toolbar">
          <button class="action-button" data-action="crawl">開始爬取</button>
          <button class="action-button secondary" data-action="crawl">重新爬取</button>
          <button class="action-button warning" data-action="clear">清除資料</button>
          <button class="action-button secondary" data-action="pdf">匯出 PDF</button>
          <button class="action-button secondary" data-link="#">回首頁</button>
        </div>
        <div id="statusArea">
          ${latest ? `<div class="notice ok">最後爬取：${formatDate(latest.createdAt)}，共 ${items.length} 筆有效婚宴文章。</div>` : `<div class="notice">尚未爬取資料。</div>`}
          ${errors.map((error) => `<div class="notice error"><strong>${escapeHtml(error.title)}</strong><br>${escapeHtml(error.message)}</div>`).join("")}
        </div>
        ${platformRows(items)}
      </section>
    `);

    bindLinks();
    document.querySelectorAll("[data-action='crawl']").forEach((button) => {
      button.addEventListener("click", () => runCrawl(platformKey));
    });
    document.querySelector("[data-action='clear']").addEventListener("click", () => {
      RadarStorage.clearPlatform(platformKey);
      renderPlatform(platformKey);
    });
    document.querySelector("[data-action='pdf']").addEventListener("click", () => exportPdf(`${platform.label}-分析`));
  }

  async function runCrawl(platformKey) {
    const buttons = [...document.querySelectorAll("[data-action='crawl']")];
    buttons.forEach((button) => {
      button.disabled = true;
      button.textContent = "爬取中...";
    });
    document.getElementById("statusArea").innerHTML = `<div class="notice">正在嘗試抓取近 7 天文章，若平台阻擋會顯示原因。</div>`;

    try {
      const run = await RadarScrapers.crawl(platformKey);
      RadarStorage.saveRun(platformKey, run);
    } catch (error) {
      RadarStorage.saveRun(platformKey, {
        id: `${platformKey}-${Date.now()}`,
        platform: platformKey,
        platformLabel: APP_CONFIG.platforms[platformKey].label,
        createdAt: new Date().toISOString(),
        keywordScope: APP_CONFIG.keywords,
        totalScanned: 0,
        items: [],
        errors: [
          {
            title: "爬取流程發生錯誤",
            message: error.message || "未知錯誤"
          }
        ]
      });
    } finally {
      renderPlatform(platformKey);
    }
  }

  function computeTrend() {
    const runs = RadarStorage.getAllLatest();
    const items = runs.flatMap((run) => run.items || []);
    const categoryCounts = {};
    const platformCounts = {};
    const dailyCounts = {};
    const now = new Date();

    for (let index = 6; index >= 0; index -= 1) {
      const date = new Date(now);
      date.setDate(now.getDate() - index);
      dailyCounts[date.toISOString().slice(0, 10)] = 0;
    }

    items.forEach((item) => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      platformCounts[item.platform] = (platformCounts[item.platform] || 0) + 1;
      const day = RadarScoring.toDayKey(item.date);
      if (Object.prototype.hasOwnProperty.call(dailyCounts, day)) {
        dailyCounts[day] += 1;
      }
    });

    return {
      totalRuns: runs.length,
      totalArticles: runs.reduce((total, run) => total + Number(run.totalScanned || 0), 0),
      validArticles: items.length,
      categoryLabels: Object.keys(categoryCounts),
      categoryValues: Object.values(categoryCounts),
      platformLabels: Object.keys(platformCounts),
      platformValues: Object.values(platformCounts),
      dailyLabels: Object.keys(dailyCounts),
      dailyValues: Object.values(dailyCounts),
      topItems: [...items].sort((a, b) => b.heatScore - a.heatScore).slice(0, APP_CONFIG.maxTopArticles),
      errors: runs.flatMap((run) => run.errors || [])
    };
  }

  function renderTrend() {
    const stats = computeTrend();
    setHtml(`
      <section id="pdfArea" class="tool-panel">
        <span class="badge">7D</span>
        <h2>綜合 7 天熱門議題趨勢分析</h2>
        <div class="toolbar">
          <button class="action-button secondary" data-action="pdf">匯出 PDF</button>
          <button class="action-button secondary" data-link="#">回首頁</button>
        </div>
        <div class="grid">
          <div class="metric"><strong>${stats.totalArticles}</strong><span>總文章數</span></div>
          <div class="metric"><strong>${stats.validArticles}</strong><span>有效婚宴文章數</span></div>
          <div class="metric"><strong>${stats.totalRuns}</strong><span>已整合平台數</span></div>
        </div>
        ${stats.errors.map((error) => `<div class="notice error"><strong>${escapeHtml(error.title)}</strong><br>${escapeHtml(error.message)}</div>`).join("")}
        <div class="chart-grid">
          <div class="chart-panel"><h3>各分類比例</h3><canvas id="categoryChart"></canvas></div>
          <div class="chart-panel"><h3>近 7 天每日文章數</h3><canvas id="dailyChart"></canvas></div>
          <div class="chart-panel"><h3>平台來源比例</h3><canvas id="platformChart"></canvas></div>
        </div>
        <h3>Top 50 熱門文章</h3>
        ${platformRows(stats.topItems)}
      </section>
    `);
    bindLinks();
    document.querySelector("[data-action='pdf']").addEventListener("click", () => exportPdf("綜合7天熱門議題趨勢分析"));
    RadarCharts.renderTrendCharts(stats);
  }

  function bindLinks() {
    document.querySelectorAll("[data-link]").forEach((element) => {
      element.addEventListener("click", () => {
        window.location.hash = element.getAttribute("data-link");
      });
    });
  }

  function exportPdf(filename) {
    const target = document.getElementById("pdfArea") || app;
    if (!window.html2pdf) {
      alert("html2pdf.js 尚未載入，請確認網路可連到 CDN。");
      return;
    }
    window.html2pdf()
      .set({
        margin: 8,
        filename: `${filename}.pdf`,
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      })
      .from(target)
      .save();
  }

  function init() {
    window.addEventListener("hashchange", route);
    route();
  }

  return {
    init
  };
})();

window.addEventListener("DOMContentLoaded", App.init);

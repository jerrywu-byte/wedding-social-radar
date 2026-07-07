const RadarScrapers = (() => {
  function emptyRun(platformKey, message) {
    const platform = APP_CONFIG.platforms[platformKey];
    return {
      id: `${platformKey}-${Date.now()}`,
      platform: platformKey,
      platformLabel: platform.label,
      createdAt: new Date().toISOString(),
      keywordScope: APP_CONFIG.keywords,
      totalScanned: 0,
      items: [],
      errors: [
        {
          title: "尚未找到靜態結果",
          message
        }
      ]
    };
  }

  function normalizeRun(platformKey, payload) {
    const platform = APP_CONFIG.platforms[platformKey];
    const sourceRun = payload?.platforms?.[platformKey] || {};
    const rawItems = Array.isArray(sourceRun.items) ? sourceRun.items : [];
    const items = rawItems
      .map((item) => RadarScoring.scorePost({
        platform: platform.label,
        title: item.title || item.summary || "無標題",
        summary: item.summary || item.title || "",
        date: item.date,
        likes: Number(item.likes || 0),
        comments: Number(item.comments || 0),
        url: item.url || ""
      }))
      .filter((item) => RadarScoring.isWithinSevenDays(item.date))
      .filter((item) => item.keywordHits > 0)
      .sort((a, b) => b.heatScore - a.heatScore)
      .map((item) => ({
        platform: platform.label,
        title: item.title,
        summary: item.summary,
        date: item.date,
        likes: Number(item.likes || 0),
        comments: Number(item.comments || 0),
        interactions: Number(item.likes || 0) + Number(item.comments || 0),
        heatScore: item.heatScore,
        category: item.category,
        url: item.url
      }));

    return {
      id: sourceRun.id || `${platformKey}-${Date.now()}`,
      platform: platformKey,
      platformLabel: platform.label,
      createdAt: sourceRun.createdAt || payload?.createdAt || new Date().toISOString(),
      keywordScope: payload?.keywords || APP_CONFIG.keywords,
      totalScanned: Number(sourceRun.totalScanned || rawItems.length),
      items,
      errors: Array.isArray(sourceRun.errors) ? sourceRun.errors : []
    };
  }

  async function loadResults() {
    const response = await fetch("data/results.json", {
      cache: "no-store"
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  }

  async function crawl(platformKey) {
    try {
      const payload = await loadResults();
      return normalizeRun(platformKey, payload);
    } catch (error) {
      return emptyRun(
        platformKey,
        "請先用 local-tool/import.html 在本機產生 data/results.json，並將它放到網站的 data/ 資料夾。若你是直接用 file:// 開啟網站，瀏覽器可能會阻擋讀取 JSON，請改用本機靜態伺服器或 GitHub Pages。"
      );
    }
  }

  return {
    crawl
  };
})();

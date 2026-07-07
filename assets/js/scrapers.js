class PlatformRestrictionError extends Error {
  constructor(message, detail) {
    super(message);
    this.name = "PlatformRestrictionError";
    this.detail = detail;
  }
}

const RadarScrapers = (() => {
  function makeRun(platformKey, items, errors, totalScanned = items.length) {
    return {
      id: `${platformKey}-${Date.now()}`,
      platform: platformKey,
      platformLabel: APP_CONFIG.platforms[platformKey].label,
      createdAt: new Date().toISOString(),
      keywordScope: APP_CONFIG.keywords,
      totalScanned,
      items,
      errors
    };
  }

  async function guardedFetch(url, options = {}) {
    const response = await fetch(url, {
      mode: "cors",
      cache: "no-store",
      ...options
    });
    if (!response.ok) {
      throw new PlatformRestrictionError(
        `HTTP ${response.status}`,
        `平台回應 ${response.status}，可能需要登入、限制跨來源請求，或暫時阻擋公開存取。`
      );
    }
    return response;
  }

  function finalize(platformKey, rawItems) {
    const seen = new Set();
    return rawItems
      .map((item) => RadarScoring.scorePost(item))
      .filter((item) => RadarScoring.isWithinSevenDays(item.date))
      .filter((item) => item.keywordHits > 0)
      .filter((item) => {
        const id = item.url || `${item.platform}-${item.title}-${item.date}`;
        if (seen.has(id)) {
          return false;
        }
        seen.add(id);
        return true;
      })
      .sort((a, b) => b.heatScore - a.heatScore)
      .map((item) => ({
        platform: APP_CONFIG.platforms[platformKey].label,
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
  }

  function parsePttDate(mmdd) {
    const match = String(mmdd || "").match(/(\d{1,2})\/(\d{1,2})/);
    if (!match) {
      return new Date().toISOString();
    }
    const now = new Date();
    let date = new Date(now.getFullYear(), Number(match[1]) - 1, Number(match[2]), 12);
    if (date.getTime() > now.getTime() + 24 * 60 * 60 * 1000) {
      date = new Date(now.getFullYear() - 1, Number(match[1]) - 1, Number(match[2]), 12);
    }
    return date.toISOString();
  }

  function parsePttPush(value) {
    const text = String(value || "").trim();
    if (text === "爆") {
      return 100;
    }
    const parsed = Number(text);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }

  async function crawlPtt() {
    const rawItems = [];
    const errors = [];
    let pageUrl = "https://www.ptt.cc/bbs/GetMarry/index.html";

    try {
      for (let page = 0; page < 3; page += 1) {
        const response = await guardedFetch(pageUrl, {
          credentials: "omit",
          headers: {
            Accept: "text/html"
          }
        });
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, "text/html");
        const rows = [...doc.querySelectorAll(".r-ent")];

        rows.forEach((row) => {
          const titleLink = row.querySelector(".title a");
          const title = titleLink ? titleLink.textContent.trim() : row.querySelector(".title")?.textContent.trim();
          if (!title || !titleLink) {
            return;
          }
          const date = parsePttDate(row.querySelector(".date")?.textContent);
          const comments = parsePttPush(row.querySelector(".nrec")?.textContent);
          rawItems.push({
            platform: "PTT",
            title,
            summary: title,
            date,
            likes: 0,
            comments,
            url: new URL(titleLink.getAttribute("href"), "https://www.ptt.cc").href
          });
        });

        const prevLink = [...doc.querySelectorAll(".btn-group-paging a")].find((link) => {
          return link.textContent.includes("上頁");
        });
        if (!prevLink) {
          break;
        }
        pageUrl = new URL(prevLink.getAttribute("href"), "https://www.ptt.cc").href;
      }
    } catch (error) {
      errors.push({
        title: "PTT 無法從 GitHub Pages 直接抓取",
        message: error.detail || error.message || "瀏覽器跨來源限制可能阻擋 PTT HTML 讀取。"
      });
    }

    return makeRun("ptt", finalize("ptt", rawItems), errors, rawItems.length);
  }

  async function crawlDcard() {
    const rawItems = [];
    const errors = [];

    try {
      for (const keyword of APP_CONFIG.keywords.slice(0, 8)) {
        const url = `https://www.dcard.tw/service/api/v2/search/posts?query=${encodeURIComponent(keyword)}&limit=30`;
        const response = await guardedFetch(url, {
          headers: {
            Accept: "application/json"
          }
        });
        const posts = await response.json();
        posts.forEach((post) => {
          rawItems.push({
            platform: "Dcard",
            title: post.title || post.excerpt || "無標題",
            summary: post.excerpt || post.title || "",
            date: post.createdAt || post.updatedAt,
            likes: post.likeCount || 0,
            comments: post.commentCount || 0,
            url: post.id ? `https://www.dcard.tw/f/all/p/${post.id}` : "https://www.dcard.tw/"
          });
        });
      }
    } catch (error) {
      errors.push({
        title: "Dcard 無法從 GitHub Pages 直接抓取",
        message: error.detail || error.message || "Dcard 公開 API 可能限制 CORS、頻率或需要登入。"
      });
    }

    return makeRun("dcard", finalize("dcard", rawItems), errors, rawItems.length);
  }

  async function crawlThreads() {
    return makeRun("threads", [], [
      {
        title: "Threads 採 best-effort 模式",
        message:
          "Threads 沒有穩定的免登入公開爬取 API。本專案不登入、不破解、不繞過平台限制，因此目前只保留資料結構、錯誤呈現與匯出流程。"
      }
    ]);
  }

  async function crawl(platformKey) {
    if (platformKey === "ptt") {
      return crawlPtt();
    }
    if (platformKey === "dcard") {
      return crawlDcard();
    }
    if (platformKey === "threads") {
      return crawlThreads();
    }
    throw new Error(`Unsupported platform: ${platformKey}`);
  }

  return {
    crawl
  };
})();

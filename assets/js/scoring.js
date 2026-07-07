const RadarScoring = (() => {
  function normalizeText(value) {
    return String(value || "").trim();
  }

  function countKeywordHits(text) {
    const haystack = normalizeText(text);
    return APP_CONFIG.keywords.reduce((total, keyword) => {
      return haystack.includes(keyword) ? total + 1 : total;
    }, 0);
  }

  function classify(text) {
    const haystack = normalizeText(text);
    for (const [category, keywords] of Object.entries(APP_CONFIG.categories)) {
      if (keywords.some((keyword) => haystack.includes(keyword))) {
        return category;
      }
    }
    return "其他";
  }

  function freshnessScore(dateValue) {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      return 0;
    }
    const ageDays = Math.max(0, (Date.now() - date.getTime()) / (24 * 60 * 60 * 1000));
    return Math.max(0, Math.round((7 - ageDays) * 2));
  }

  function scorePost(post) {
    const text = `${post.title || ""} ${post.summary || ""}`;
    const keywordHits = countKeywordHits(text);
    const comments = Number(post.comments || 0);
    const likes = Number(post.likes || 0);
    const freshness = freshnessScore(post.date);
    const heatScore = comments * 3 + likes * 2 + keywordHits * 5 + freshness;

    return {
      ...post,
      keywordHits,
      category: classify(text),
      heatScore
    };
  }

  function isWithinSevenDays(dateValue) {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      return false;
    }
    const diff = Date.now() - date.getTime();
    return diff >= 0 && diff <= APP_CONFIG.sevenDaysMs;
  }

  function toDayKey(dateValue) {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      return "未知";
    }
    return date.toISOString().slice(0, 10);
  }

  return {
    countKeywordHits,
    classify,
    freshnessScore,
    scorePost,
    isWithinSevenDays,
    toDayKey
  };
})();

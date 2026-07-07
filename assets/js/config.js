const APP_CONFIG = {
  storagePrefix: "wedding-social-radar",
  sevenDaysMs: 7 * 24 * 60 * 60 * 1000,
  maxTopArticles: 50,
  keywords: [
    "婚宴",
    "婚禮",
    "結婚",
    "訂婚",
    "喜宴",
    "宴客",
    "婚宴會館",
    "婚宴場地",
    "婚禮主持",
    "婚企",
    "試菜",
    "一桌多少",
    "低消",
    "停車",
    "二進"
  ],
  categories: {
    "價格": ["價格", "低消", "一桌", "預算", "加價", "服務費"],
    "菜色": ["試菜", "菜色", "好吃", "難吃", "份量"],
    "流程": ["二進", "儀式", "訂結", "流程", "進場"],
    "停車": ["停車", "車位", "交通", "捷運"],
    "主持": ["主持", "婚禮主持", "婚企", "司儀"],
    "場地": ["場地", "會館", "飯店", "宴會廳"],
    "長輩": ["爸媽", "長輩", "親戚", "家人"]
  },
  platforms: {
    ptt: {
      key: "ptt",
      label: "PTT",
      badge: "PTT",
      description: "PTT GetMarry 看板近 7 天婚宴相關文章"
    },
    dcard: {
      key: "dcard",
      label: "Dcard",
      badge: "DC",
      description: "Dcard 公開搜尋 API 的婚宴相關文章"
    },
    threads: {
      key: "threads",
      label: "Threads",
      badge: "TH",
      description: "Threads best-effort 模式，不登入、不破解限制"
    }
  }
};

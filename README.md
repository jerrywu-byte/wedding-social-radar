# wedding-social-radar

本機半自動擷取 + GitHub Pages 靜態展示的婚宴社群 7 天熱門議題分析工具。

## 核心原則

- 不使用任何付費服務。
- 不使用資料庫。
- 不使用 OpenAI API。
- 不需要每日排程。
- 不在網站內輸入或保存任何平台帳號密碼。
- 不做登入破解、不繞過平台限制、不自動翻頁或隱藏式大量請求。
- 你自行在瀏覽器登入平台後，只把「可見頁面資料」交給本機工具整理。
- GitHub Pages 只讀取靜態檔案 `data/results.json`。

## 檔案結構

```text
wedding-social-radar/
  index.html
  README.md
  assets/
    css/
      styles.css
    js/
      app.js
      charts.js
      config.js
      scoring.js
      scrapers.js
      storage.js
    icons/
      .gitkeep
  data/
    results.json
  local-tool/
    import.html
    bookmarklet.js
```

## 使用流程

1. 在瀏覽器自行登入 PTT、Dcard 或 Threads。
2. 開到你要整理的搜尋結果、列表頁或文章頁。
3. 用下列任一方式取得資料：
   - 將 `local-tool/bookmarklet.js` 的內容新增成瀏覽器書籤，在平台頁面點擊書籤，下載 JSON。
   - 手動複製頁面文字或 HTML。
   - 手動整理 CSV，欄位建議為 `title,summary,date,likes,comments,url`。
4. 開啟 `local-tool/import.html`。
5. 選擇平台，貼上 JSON / CSV / 文字 / HTML。
6. 按「解析並加入結果」。
7. 累積完 PTT、Dcard、Threads 後，按「下載 results.json」。
8. 將下載的 `results.json` 放到 `data/results.json`。
9. 上傳整個專案到 GitHub Pages。

## 網站功能

首頁包含四個主要入口：

- PTT
- Dcard
- Threads
- 綜合 7 天熱門議題趨勢分析

平台分析頁包含：

- 載入靜態結果
- 重新載入
- 清除資料
- 匯出 PDF
- 回首頁

文章欄位包含：

- 平台
- 標題或內容摘要
- 日期
- 互動數
- 留言數
- 熱度分數
- 分類
- 原文連結

## 關鍵字

```text
婚宴、婚禮、結婚、訂婚、喜宴、宴客、婚宴會館、婚宴場地、婚禮主持、婚企、試菜、一桌多少、低消、停車、二進
```

## 熱度分數

```text
熱度分數 = 留言數 * 3 + 按讚數 * 2 + 關鍵字命中數 * 5 + 時間新鮮度分數
```

時間新鮮度分數依文章日期距今 7 天內遞減，越新的文章分數越高。

## 分類規則

- 價格：價格、低消、一桌、預算、加價、服務費
- 菜色：試菜、菜色、好吃、難吃、份量
- 流程：二進、儀式、訂結、流程、進場
- 停車：停車、車位、交通、捷運
- 主持：主持、婚禮主持、婚企、司儀
- 場地：場地、會館、飯店、宴會廳
- 長輩：爸媽、長輩、親戚、家人
- 其他：無法分類

## 靜態資料格式

`data/results.json` 的格式如下：

```json
{
  "schemaVersion": 1,
  "createdAt": "2026-07-07T00:00:00.000Z",
  "generatedBy": "local-tool/import.html",
  "keywords": ["婚宴"],
  "platforms": {
    "ptt": {
      "id": "ptt-local",
      "createdAt": "2026-07-07T00:00:00.000Z",
      "totalScanned": 10,
      "items": [
        {
          "title": "文章標題",
          "summary": "內容摘要",
          "date": "2026-07-07T00:00:00.000Z",
          "likes": 0,
          "comments": 12,
          "url": "https://example.com"
        }
      ],
      "errors": []
    }
  }
}
```

網站會在載入時重新計算近 7 天範圍、關鍵字命中、分類與熱度分數。

## 本機預覽

建議用靜態伺服器開啟，這樣瀏覽器才能讀取 `data/results.json`：

```bash
python -m http.server 8080
```

然後瀏覽：

```text
http://localhost:8080
```

如果直接用 `file://` 開啟，部分瀏覽器可能會阻擋 JSON 讀取。

## GitHub Pages 部署

1. 在 GitHub 建立新 repository，名稱建議為 `wedding-social-radar`。
2. 將本資料夾內的所有檔案上傳到 repository 根目錄，確認根目錄有 `index.html` 和 `data/results.json`。
3. 進入 repository 的 `Settings`。
4. 左側選擇 `Pages`。
5. `Build and deployment` 選擇 `Deploy from a branch`。
6. Branch 選 `main`，資料夾選 `/root`。
7. 按 `Save`。
8. 等待數分鐘後，GitHub Pages 會顯示公開網址。

## 後續放置合法圖檔

第一版按鈕使用文字徽章，不仿製官方商標。若之後取得合法圖檔，可放入：

```text
assets/icons/
```

再更新首頁按鈕的呈現方式。

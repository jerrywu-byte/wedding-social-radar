# wedding-social-radar

純前端婚宴社群 7 天熱門議題分析工具，可部署到 GitHub Pages。

## 專案限制

- 不使用任何付費服務。
- 不使用資料庫。
- 不使用 OpenAI API。
- 不需要每日排程。
- 使用 `localStorage` 儲存每次爬取結果。
- 使用 Chart.js 製作趨勢圖。
- 使用 html2pdf.js 匯出 PDF。
- 自動爬取採公開資料 best-effort 模式。
- 不輸入帳號密碼、不接管登入狀態、不破解登入、不繞過平台限制。
- 若平台因 CORS、登入或平台政策無法抓取，畫面會顯示清楚錯誤訊息。
- Threads 沒有穩定免登入公開爬取 API，因此只保留 best-effort 錯誤呈現與匯出流程。

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
```

## 功能

首頁包含四個主要入口：

- PTT
- Dcard
- Threads
- 綜合 7 天熱門議題趨勢分析

平台分析頁包含：

- 開始爬取
- 重新爬取
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

## 平台限制說明

這是純前端 GitHub Pages 專案，瀏覽器會受到 CORS、登入狀態、反爬蟲與平台 API 政策限制。

- PTT：嘗試讀取 `GetMarry` 看板 HTML。若 PTT 未允許跨來源讀取，頁面會顯示錯誤。
- Dcard：嘗試讀取公開搜尋 API。若 API 限制 CORS、頻率或登入，頁面會顯示錯誤。
- Threads：沒有穩定免登入公開爬取 API，本專案不做登入破解或繞過限制，因此以 best-effort 顯示限制訊息。

若未來需要穩定爬取，建議另建合法後端代理或 GitHub Actions 定期產出靜態 JSON，但這會超出目前「純前端、無每日排程」的限制。

## 本機預覽

直接開啟 `index.html` 即可預覽。若瀏覽器限制本機檔案或 CDN，可用任何靜態伺服器開啟，例如：

```bash
python -m http.server 8080
```

然後瀏覽：

```text
http://localhost:8080
```

## GitHub Pages 部署

1. 在 GitHub 建立新 repository，名稱建議為 `wedding-social-radar`。
2. 將本資料夾內的所有檔案上傳到 repository 根目錄，確認根目錄有 `index.html`。
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

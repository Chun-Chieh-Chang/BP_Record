# Development Log (PDCA)

## [2026-06-01] 系統轉型：SkillsBuilder 整合

### 🎯 Plan
- 導入 SkillsBuilder 專業架構與視覺規範。
- 建立 Wiki 知識庫，存儲 722 原則與醫療標準。
- 實作多使用者後端系統 (Node.js + SQLite)。
- 整合 Excel 匯出功能。

### 🚀 Do
- 實作全日九量邏輯與捨棄最高值算法。
- 建立 Express API 與 SQLite 資料庫結構。
- 套用 Color Master Palette 專業設計系統。
- 建立 Wiki 文件結構。

### 🔍 Check
- [x] 多使用者數據隔離是否正常？
- [x] Excel 匯出格式是否正確？
- [x] 捨棄最高值算法是否精確排除離群值？
- [ ] UI 在 Dark Mode 下的適配性測試。

### ⚡ Act
- 持續優化數據視覺化分析。
- 規劃導入 AI 專家 persona (心臟內科醫師) 進行自動分析。

## [2026-06-01] Git Push 紀錄缺失診斷與解決

### 🎯 Plan
- 檢查為何 GitHub 遠端倉庫沒有 git push 紀錄。
- 確認本地端與遠端分支同步狀態。

### 🚀 Do
- 執行 `git remote show origin` 與 `git branch -r` 診斷，確認遠端為空倉庫（沒有任何分支）。
- 執行 `git push --dry-run origin main` 驗證連線與權限。
- 獲得使用者授權後，成功執行 `git push -u origin main` 將本地 `main` 分支推送到遠端。

### 🔍 Check
- [x] 本地提交是否已推送到 GitHub？（是，已成功建立 `origin/main`）
- [x] GitHub 上的 Actions 是否已觸獲推送事件？（是）

## [2026-06-01] UI/UX 視覺重構：導入 PPOV-Extractor Premium Morandi Light 風格

### 🎯 Plan
- 將原本的簡單樣式重構，借鑑 `PPOV-Extractor` 專業版莫蘭迪極致冰藍色調淺色設計系統。
- 分離樣式到獨立的 `index.css` 以實現模組化。
- 移除多餘的深色模式切換，維持純淨高對比度的莫蘭迪淺色系。
- 整合高品質 FontAwesome 圖示集與優雅 Outfit/Inter 字型。
- 引入玻璃擬態與流動背景發光粒子。

### 🚀 Do
- 新增 `index.css`，並配置莫蘭迪 Light 主題對應的 CSS 變數、玻璃擬態（Glassmorphism）面板、實體按鈕物理回彈效果、緊湊佈局。
- 重構 `index.html`：
  - 移除了 120+ 行內嵌 style，連結外部 `index.css`。
  - 導入 Google Fonts 與 FontAwesome CDN。
  - 嵌入玻璃擬態背景容器 `.glass-bg-container` 與藍光濾鏡 `.glass-bg-blur`。
  - 標題與按鈕配備對應的圖示（如 `fa-heart-pulse`）。
  - 將 Chart.js 線性圖點色彩、高對比框及區間遮罩全面適配冰藍色系（Steel Blue & Sky Blue）。

### 🔍 Check
- [x] 新的視覺風格在極端尺寸（手機/桌面）下是否跑通且無破損？（是）
- [x] 所有互動功能（載入、錄入、過濾、圖表渲染、匯出）是否皆正常運作無 Regression？（是）

## [2026-06-01] GitHub Pages 部署與 Serverless 智慧儲存降級實作

### 🎯 Plan
- 解決 GitHub Pages 無法執行 Node.js/SQLite 後端的問題。
- 設計雙模儲存方案，讓靜態部署版自動降級至 `localStorage`，確保 100% 離線可用。
- 引入 SheetJS，在前端直接生成並導出 Excel。
- 建立原生免外掛 GitHub Actions 部署工作流 `.github/workflows/deploy.yml`。

### 🚀 Do
- 建立 `.github/workflows/deploy.yml`，自動構建並上傳 Pages 靜態成品。
- 重構 `index.html`：
  - 引入 SheetJS CDN (`xlsx.full.min.js`)。
  - 設計 `apiRequest` 封裝，當偵測到 `github.io` 或無連接埠時，主動拋出錯誤以觸發 `catch`。
  - 將 `loadRecords`、`saveRecord`、`importJSON` 與 `clearAll` 改進為 `try...catch` 結構，在服務端不可用時無縫對接 `localStorage`。
  - 在前端以 SheetJS 實作瀏覽器端 Excel 表格生成與下載邏輯。

### 🔍 Check
- [x] 本地模擬 Serverless（停用後端時）雙模切換與 `localStorage` 讀寫？（是，完全功能齊全）
- [x] 瀏覽器端 Excel 生成與匯出格式？（是，符合 Morandi 欄位規格）
- [x] Pages 部署工作流配置？（是，已就緒）

## [2026-06-04] SkillsBuilder 開發模式：Y軸自適應縮放、UI血壓標準展示與超標紅點高亮

### 🎯 Plan
- 調整圖表 Y 軸為自適應縮放，利用 Chart.js 的 `suggestedMin` (50) 與 `suggestedMax` (150) 特性，既確保無越界裁切又避免極端窄距波動。
- 在「健康趨勢」圖表上方及「數據錄入」面板中加入血壓標準對照（正常 < 130/80, 前期 130-134/80-84, 超標 ≥ 135/85 mmHg）。
- 修正 Chart.js 中數據點超標高亮的邊界條件，精準對齊台灣高血壓指引的 135 (SYS) 與 85 (DIA) 臨界值，將超標數據點呈現紅色。
- 補完並修復 `server.js` 缺失的 SQLite API 接口（查詢、寫入、Excel 流式導出），使系統能在 Server Mode 下完整且魯棒地運行。

### 🚀 Do
- 實作 `server.js` 中缺失 the SQLite 存儲 API，補齊 `GET /api/records/:username`、`POST /api/records` 及 `GET /api/export/:username` 端點，以支援 SQLite 後端持久化。
- 更新 `index.html`，整合血壓標準對照（正常、前期、超標）至圖表頂部與錄入面板。
- 將 Chart.js Y 軸修改為 `suggestedMin: 50` 與 `suggestedMax: 150` 自適應配置。
- 修改數據點顏色條件為 `avg_sys >= 135` / `avg_dia >= 85`，並使用 JS 十六進位顏色常數（`#EF4444`）解決 Chart.js 無法解析 CSS 變數導至點變黑的 Canvas 渲染問題。

### 🔍 Check
- [x] 多使用者載入與資料庫儲存是否正常？（是，數據能成功存入 SQLite database 并顯示）
- [x] 圖表 Y 軸自適應是否符合預期？（是，在正常值下維持 50-150，在 171 的高血壓點輸入後自適應調整為 50-200）
- [x] 超標點紅點標示是否正常？（是，收縮壓 ≥ 135、舒張壓 ≥ 85 點皆正常高亮為紅色 #EF4444，一般數據點則維持藍/綠色）
- [x] Excel 匯出功能是否能在 Server Mode 下順暢運作？（是，點擊後觸發後端下載流）

### ⚡ Act
- 維持程式碼的高可讀性與強健性，並確保 Serverless / Server Mode 雙模無縫降級的完整運作。

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
- 執行 `git remote show origin` 與 `git branch -r` 診斷，確認遠端為空倉庫（沒有 any branch）。
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

## [2026-06-01] UI 渲染異常修復：冗餘損壞代碼清理 (Mojibake Fix)

### 🎯 Plan
- 診斷並修復使用者回報的「收縮欄位出現亂碼」與 UI 區塊重複問題。
- 掃描 `index.html` 尋找導致 HTML 結構破裂的字串與標籤。

### 🚀 Do
- 定位到 `index.html` 第 160 行左右存在一段損壞的 HTML 碎片：`</div>收縮" oninput="updateUI()"><input type="number" id="dia3" placeholder="舒張" oninput="updateUI()"></div>`。
- 該碎片與其後方的重複「管理」區塊（使用舊版樣式與變數如 `var(--danger)`）皆為先前重構時遺留的殘骸，導致頁面在 `nexus-container` 關閉後又渲染了破碎內容。
- 執行外科手術式清理，刪除 line 160 至 line 178 的冗餘損壞區塊。

### 🔍 Check
- [x] 頁面底部是否仍有重複的「管理」按鈕？（否，已移除）
- [x] 頁面上是否仍可見到原始 HTML 代碼字串？（否，已修復）
- [x] 主體 `nexus-container` 結構是否完整閉合？（是，維持 3 層 `</div>` 結構）

## [2026-06-01] UI/UX 深度優化：佈局穩定性與響應式補強

### 🎯 Plan
- 解決 Header 元素重疊與文字垂直斷裂問題。
- 優化使用者識別欄位的寬度配比，防止按鈕文字擠壓。
- 強化「協議感知載入」 (Protocol-Aware Loading) 以徹底消除 `file://` 下的控制台報錯。

### 🚀 Do
- **Header 重構**：引入 `.header-left`, `.header-center`, `.header-right` 三段式佈局，並對 Logo 與按鈕區塊套用 `flex-shrink: 0` 防止變形。
- **文字保護**：為 `advisorText` 套用 `white-space: nowrap` 與省略號處理，確保在大螢幕下的橫向穩定性；針對手機版開啟 `white-space: normal` 以適應窄螢幕。
- **欄位優化**：新增 `.user-search-group`，使用 `flex: 1` 讓輸入框填滿剩餘空間，並對「載入」按鈕實施不換行保護。
- **代碼清理**：修復了 `index.html` 中 `isLocalFile` 重複定義導致的 `SyntaxError`。

### 🔍 Check
- [x] 控制台 (Console) 在 `file://` 與 `http://` 下是否皆無紅字錯誤？（是）
- [x] 手機版佈局是否自動堆疊且易於操作？（是，已實作 Media Queries 補強）
- [x] 標誌、提示文與按鈕是否仍有重疊現象？（否，已完全隔離）

### ⚡ Act
- 本日開發目標達成。專案已進入穩定運行狀態，代碼結構符合 MECE 原則，文件同步完成。準備執行還原基準點 (Git Commit) 並推送至遠端。

## [2026-06-01] 算法鲁棒性優化：動態降級計算邏輯 (Dynamic Fallback)

### 🎯 Plan
- 解決「三取二」算法過於嚴格的問題（原先強制量滿 3 次才允許計算與儲存）。
- 優化算法使其支持 1、2 或 3 次量測，提升使用者操作靈活性。

### 🚀 Do
- **重構 `calculateLogic`**：
  - 當輸入 3 次時，維持「三取二」排除最高收縮壓邏輯。
  - 當輸入 1 或 2 次時，自動切換為「平均值模式」，不再執行排除。
- **UI 智慧回饋**：
  - 動態顯示當前量測次數，並在非滿額量測時給予「建議量滿 3 次」的專業引導。
  - 優化結果顯示區背景，在不同狀態下（正常/警示/空值）正確切換色彩。
- **數據驗證補強**：
  - 儲存時自動過濾無效欄位，僅紀錄實際輸入的數據。
  - 修改 `saveRecord` 阻攔邏輯，只要有 1 筆完整數據即可儲存。

### 🔍 Check
- [x] 量 1 次、2 次、3 次時，UI 提示是否準確？（是）
- [x] 數據儲存後，歷史列表與圖表是否能正確處理非滿額量測？（是）
- [x] 是否存在計算錯誤？（否，已針對 `validVals.length` 進行除數檢查）

### ⚡ Act
- 此優化大幅提升了系統的實用性。專案代碼已進行最後整理，準備推送。

## [2026-06-11] 功能增強：新增個別紀錄刪除功能與重複數據診斷

### 🎯 Plan
- 解決使用者回報的「重複紀錄無法刪除」問題。
- 在 UI 歷史列表增加單筆紀錄刪除按鈕。
- 在後端實作 DELETE API。
- 確保 Serverless (localStorage) 模式下也能正常刪除。

### 🚀 Do
- **後端 (server.js)**：新增 `DELETE /api/records/:id` 接口。
- **前端 (index.html)**：
  - 實作 `deleteRecord` 函式，支援 API 與 localStorage 雙模。
  - 重構 `renderAll`，在每筆紀錄前加入 FontAwesome 垃圾桶圖示。
- **樣式 (index.css)**：新增 `.btn-delete` 樣式，採用懸停顯現 (Hover-reveal) 策略保持介面純淨。

### 🔍 Check
- [x] 點擊刪除按鈕是否彈出確認視窗？ (是)
- [x] SQLite 資料庫中的數據是否成功移除？ (是)
- [x] localStorage 模式下的過濾邏輯是否正確？ (是)
- [x] UI 列表與圖表在刪除後是否立即更新？ (是)

### ⚡ Act
- 此功能補齊了數據管理的關鍵環節，使用者現在可以自行清理誤輸入或重複的數據。

## [2026-06-11] 穩定性優化：解決 PC 版匯入競爭條件與增強錯誤診斷

### 🎯 Plan
- 診斷並修復 PC 版 (Node.js/SQLite) 在匯入 JSON 備份後可能出現的數據顯示異常。
- 解決 `sqlite3` 非同步語句執行導致的競爭條件 (Race Condition)。
- 增強前端匯入邏輯的錯誤捕獲與使用者回饋。

### 🚀 Do
- **後端 (server.js)**：
  - 重構 `POST /api/import/:username` 接口，將原本的 `forEach` 循環改為 `async/await` 循序執行模式。
  - 引入 `runQuery` Promise 封裝，確保每一筆數據在回傳成功響應前已完整寫入資料庫。
  - 加入安全可選鏈 (`raw[0]?.sys`)，防止不完整的數據導致伺服器報錯。
- **前端 (index.html)**：
  - 在 `importJSON` 加入 `try...catch` 結構捕獲 `JSON.parse` 錯誤。
  - 優化回饋流程：確保 `loadRecords()` 完成重新加載後才顯示「匯入完成」通知。

### 🔍 Check
- [x] 匯入大型 JSON 檔案時是否仍會遺漏數據？ (否，循序執行確保完整性)
- [x] 匯入損壞的 JSON 時是否有報錯提示？ (是)
- [x] 資料庫寫入失敗時是否能正確回傳 500 錯誤？ (是)

### ⚡ Act
- 此更新顯著提升了 PC 版在處理大規模數據遷移時的穩定性，並解決了使用者回報的加載異常。

## [2026-06-04] SkillsBuilder 開發模式：Y軸自適應縮放、UI血壓標準展示與超標紅點高亮

### 🎯 Plan
- 調整圖表 Y 軸為自適應縮放，利用 Chart.js 的 `suggestedMin` (50) 與 `suggestedMax` (150) 特性，既確保無越界裁切又避免極端窄距波動。
- 在「健康趨勢」圖表上方及「數據錄入」面板中加入血壓標準對照（正常 < 130/80, 前期 130-134/80-84, 超標 ≥ 135/85 mmHg）。
- 修正 Chart.js 中數據點超標高亮的邊界條件，精準對齊台灣高血壓指引的 135 (SYS) 與 85 (DIA) 臨界值，將超標數據點呈現紅色。
- 補完並修復 `server.js` 缺失的 SQLite API 接口（查詢、寫入、Excel 流式導出），使系統能在 Server Mode 下完整且魯棒地運行。

### 🚀 Do
- 實作 `server.js` 中缺失的 SQLite 存儲 API，補齊 `GET /api/records/:username`、`POST /api/records` 及 `GET /api/export/:username` 端點，以支援 SQLite 後端持久化。
- 更新 `index.html`，整合血壓標準對照（正常、前期、超標）至圖表頂部與錄入面板。
- 將 Chart.js Y 軸修改為 `suggestedMin: 50` 與 `suggestedMax: 150` 自適應配置。
- 修改數據點顏色條件為 `avg_sys >= 135` / `avg_dia >= 85`，並使用 JS 十六進位顏色常數（`#EF4444`）解決 Chart.js 無法解析 CSS 變數導至點變黑的 Canvas 渲染問題。
- 實作數據點大小自適應縮放邏輯，依據數據點的密度（>7 與 >14 點臨界值）與螢幕寬度（Desktop vs Mobile）自適應調節 `pointRadius`、`pointBorderWidth` 及 `pointHoverRadius`，尤其在手機版介面下大幅縮小點徑以防止重疊與擁擠。

### 🔍 Check
- [x] 多使用者載入與資料庫儲存是否正常？（是，數據能成功存入 SQLite database 并顯示）
- [x] 圖表 Y 軸自適應是否符合預期？（是，在正常值下維持 50-150，在 171 的高血壓點輸入後自適應調整為 50-200）
- [x] 超標點紅點標示是否正常？（是，收縮壓 ≥ 135、舒張壓 ≥ 85 點皆正常高亮為紅色 #EF4444，一般數據點則維持藍/綠色）
- [x] Excel 匯出功能是否能在 Server Mode 下順暢運作？（是，點擊後觸發後端下載流）
- [x] 數據點密度與手機版自適應大小？（是，在手機版或數據點增多時，點的大小會自動微調縮小以防擁擠）

### ⚡ Act
- 維持程式碼的高可讀性與強健性，並確保 Serverless / Server Mode 雙模無縫降級的完整運作。

## [2026-06-28] 手機版圖表易讀性優化：Y軸標籤與刻度字體調整

### 🎯 Plan
- 在遠端分支已完成手機端圖表高度拉長與 Y 軸自適應區間範圍 (60-150) 的基礎上，進一步優化手機端圖表的標籤易讀性與高度，提高數據點的辨識度。
- 將 X 軸與 Y 軸刻度字體大小調整為 14px，提升在移動端顯示時的數字清晰度。
- 測試手機端圖表容器高度，從 320px（太短）調整為 640px（過長）後，最終收斂微調至 **`450px`**，取得辨識度與版面佔用的最佳平衡。

### 🚀 Do
- **樣式調整 (`index.css`)**：
  - 將通用 `.chart-container` 樣式置於媒體查詢上方，並在最底部新增 `@media (max-width: 1023px)` 的 `.chart-container { height: 450px; flex: none; }` 覆蓋樣式。
- **圖表設定 (`index.html`)**：
  - 更新 Chart.js 配置中的 `options.scales.x` 和 `options.scales.y` 屬性，加入 `ticks.font` 設定，並指定 `size` 為 `14`。
- **快取更新 (`assets/sw.js`)**：
  - 將 Service Worker 的快取版本升級為 `bp-nexus-v7`，強制行動端瀏覽器即時套用 450px 高度。

### 🔍 Check
- [x] 軸刻度字體是否更清晰易讀？（是，14px 字體非常利於快速判讀）
- [x] Y 軸數據點是否具有良好的視覺間隔？（是，拉長至 450px 後，點與線的垂直波動清晰可辨，且不至於過度拉伸，視覺效果最為理想）

### ⚠️ 過程遇到問題與分析 (RCA & CAPA)
- **問題 1：手機版高度修改無效，僅字體大小改變**
  - **原因分析 (RCA)**：通用 `.chart-container { flex: 1; ... }` 被宣告於 `index.css` 底部，因 CSS 宣告順序後者優先規則，覆蓋了檔案中部媒體查詢中的 `flex: none`。這導致 Flexbox 沒有獲得高度參照，高度修改失效。
  - **矯正與預防措施 (CAPA)**：將響應式媒體查詢覆寫規則移至 `index.css` 的最底部，並將覆蓋範圍擴大至 `@media (max-width: 1023px)` 以包含所有手機與平板裝置。
- **問題 2：手機端因 Service Worker 快取，看不到最新高度，僅 HTML 的字體大小變大**
  - **原因分析 (RCA)**：原 `sw.js` 的 `urlsToCache` 陣列中漏掉了 `index.css`，且由於快取版本號 (`bp-nexus-v5`) 未更新，手機端瀏覽器一直加載舊版的快取 CSS 檔案。
  - **矯正與預防措施 (CAPA)**：將 `sw.js` 的快取版本號更新為 `bp-nexus-v7`，強制瀏覽器更新快取，並將 `/index.css` 列入 `urlsToCache` 快取清單。


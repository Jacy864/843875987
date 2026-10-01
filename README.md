# RP Shell — 手機端純前端 GLM 角色扮演

> 單文件、零依賴、無後端。瀏覽器直連智譜 API，資料全存本機。
> 架構同 RisuAI 路線：前端只是殼，模型與數據主權都在你手裡。

## 快速開始

1. 手機瀏覽器打開 `index.html`（任一方式）：
   - 檔案管理器直接打開（推薦加進瀏覽器書籤/主屏幕）
   - 或局域網：`python3 -m http.server 8080` 後手機訪問 `http://電腦IP:8080`
   - 或扔 GitHub Pages / Cloudflare Pages，永久在線（HTTPS 域名後可「加到主屏幕」當 App 用，離線也打得開——已內建 manifest＋service worker＋圖標）
2. 「設置」填 API Key（bigmodel.cn 後台申請），模型默認 `glm-5.2`
3. 「人設」寫角色卡 → 開聊
4. 模型填 `mock` 可無 Key 試玩全部介面流程

## 用 Coding Plan 訂閱額度（重要）

**普通 API Key 和 Coding Plan 是兩條通道**。報「資源包不足額度」= 你拿 Coding Plan 的 Key 打了普通端點。Coding Plan 有三條專用端點，**推薦第一條**：

| 選項 | 端點 | 瀏覽器直連 | 模型 |
|---|---|---|---|
| **套餐（OpenAI 格式）·推薦** | `https://open.bigmodel.cn/api/coding/paas/v4` | ✅ 已實測放行（含本地文件打開） | **glm-5.2 原生可用**（與 Operit 同路）/ glm-5.3 / flash 系 |
| 套餐（Anthropic 格式）·備選 | `https://open.bigmodel.cn/api/anthropic` | ❌ CORS 預檢不通，需 Cloudflare Worker 反代（見 worker.js） | glm-5.3 / glm-5.3-flash（填 5.2 會被自動升級） |

**設定（推薦路線，零部署）**：
1. 設置 → API 格式 → **GLM Coding Plan 套餐（OpenAI 格式·推薦）**（Base URL 自動切到 coding 端點）
2. 模型填 `glm-5.2`，Key 填 Coding Plan 的 Key → 開聊

額度規則：每 5 小時 + 每週積分上限（Lite 10000/週、Pro 60000/週、Max 140000/週）；夜間 23:00–09:00 及假日有 5 折活動，flash 系模型更省。官方條款：套餐額度「僅限指定編碼工具」，自有前端屬灰色使用，後果自擔（與 Operit 接法同理）。

## 已驗證

- ✅ **bigmodel.cn 普通 API 與 Coding Plan OpenAI 端點（`/api/coding/paas/v4`）均允許瀏覽器 CORS 直連**（2026-09-30 實測，`Origin: null` 本地文件打開也放行，無需任何反代）
- ✅ **Anthropic 端點（`/api/anthropic`）CORS 預檢不通** → 走此路線需 Worker 反代（`worker.js` 已附）
- ✅ UI 全鏈路自動化測試通過（渲染/設置/三格式切換/流式輸出/本機持久化/面板/Anthropic 協議 system 拆分+流式解析+非流式摘要）

## 敏感度控制（三層）

| 層 | 手段 | 位置 |
|---|---|---|
| 端點 | bigmodel 1301 硬攔 → 換 `https://api.z.ai/api/paas/v4`（國際版，社群反饋較寬） | 設置→Base URL |
| 提示詞 | 全域 System Prompt 完全自定義（可放破甲/文風指令，{{char}}{{user}} 自動替換） | 設置→System Prompt |
| 輸出 | 正則清洗：每行 `規則###替換為`，抹掉說教/口癖/水印 | 設置→清洗正則 |

破甲提示詞自備，參考生態：https://github.com/chiina66/Ai-jailbreak （自行評估風險）

## 記憶系統

- **項目分組**：Sessions 旁的資料夾鈕建「項目」。項目＝獨立的記憶/人設空間：項目內所有對話共享同一份角色人設與長期記憶（隨改隨生效，摘要也寫進去）；項目外開的對話是全新空白記憶。對話的「組」鈕可移入/脫離項目（帶走副本）；刪項目不刪對話
- **自動**：每次請求注入「長期記憶」欄位（側欄→長期記憶）
- **摘要**：聊多了點「自動摘要對話」，模型自動提煉關係進度/關鍵事件/伏筆併入記憶
- **永久**：全部數據存 localStorage，卸載頁面不丟；「側欄→導出備份」生成 JSON（ver4，含項目）可遷移任何設備，舊備份 ver2/ver3 也能導回
- **上下文**：點頂欄「模型 · N 條 · 帶M」副標隨手調——檔位「無限 · 20 · 50 · 100 · 200」或滑桿/數字微調（也可在模型設置調，0＝不限帶全部）；太長易觸發攔截，長劇情靠摘要補
- **輸出上限**：預設不設限（請求不帶 max_tokens，走模型上限）；要限就點檔位「2k/4k/8k/16k」或填數字

## 導入酒館角色卡

「人設→📥 導入酒館卡」支援 `chara_card_v2` / `chara_card_v3` JSON（PNG 卡請先用其他工具轉出 JSON，或直接複製 description 貼進角色設定）

## 安全提醒

- API Key 明文存在本機 localStorage，勿在公共設備使用；「☰→💥 銷毀」可一鍵清全部
- bigmodel 國內端點內容有日誌留存，敏感劇情自行斟酌端點選擇
- index.html 是唯一文件，改任何東西備份這一個文件即可

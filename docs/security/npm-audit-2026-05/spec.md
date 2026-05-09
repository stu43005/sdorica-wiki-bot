# Spec: 修復 npm audit 漏洞（2026-05）

## 1. 背景與目標

### 1.1 現況

`npm audit` 報告 8 個漏洞（1 low、4 moderate、1 high、2 critical），分布在五個傳遞依賴鏈中：

| 套件 | 嚴重度 | 來源 | GHSA |
| --- | --- | --- | --- |
| `form-data` <2.5.4 | critical | `mwbot` → `request` → `form-data` | GHSA-fjxv-7rqg-78g4 |
| `qs` <6.14.1 | moderate | `mwbot` → `request` → `qs` | GHSA-6rw7-vpxm-498p |
| `tough-cookie` <4.1.3 | moderate | `mwbot` → `request` / `tough-cookie` | GHSA-72xf-g2v4-qvf3 |
| `request` * | (deprecated) | `mwbot` → `request` | 無單獨 advisory，但已 deprecated 多年且為其他漏洞的容器 |
| `http-proxy-middleware` <=2.0.8 | high | direct dep | GHSA-c7qv-q95q-8v27、GHSA-9gqv-wp59-fq42、GHSA-4www-5p9h-95mh |
| `fast-xml-parser` <5.7.0 | moderate | direct dep | GHSA-gh4j-gqv2-49f6 |
| `vue` 2.x | low | direct dep（僅型別使用） | GHSA-5j4c-8p2g-v4jx |

### 1.2 目標

- 在不破壞現有功能的前提下，使 `npm audit` 報告 **0 個生產環境漏洞（production vulnerabilities）**。
- 移除已 deprecated 的 `request` 套件。
- 保留 Vue 2 型別相容性（與 Sdorica viewerjs 執行環境一致），但讓 `npm audit --omit=dev` 不再報 vue。

### 1.3 非目標

- 不改變任何業務邏輯（wiki 編輯流程、proxy 行為、asset bundle 解析結果）。
- 不升級無漏洞但版本較舊的套件。
- 不新增測試框架（專案目前無 unit test）。
- 不重構 `src/wiki/auto/*.ts`、`src/wiki.ts` 的呼叫端流程；僅調整為新 API 的最小必要改動。

## 2. 範圍與處置策略

### 2.1 套件處置矩陣

| # | 套件 | 處置 | 影響檔案 |
| --- | --- | --- | --- |
| A | `mwbot` ^1.0.10 | **替換為 `mwn` ^3.0.2** | `src/wiki-bot.ts`、`src/wiki.ts`、`src/wiki/auto/*.ts`、`src/typings/mwbot/index.d.ts` |
| B | `request` ^2.88.2 | **隨 mwbot 移除**（package.json 中的 direct dep 也要移除） | `package.json` |
| C | `http-proxy-middleware` ^1.0.6 | **升級到 ^4.0.0** + 改寫 options | `src/origin-proxy.ts` |
| D | `fast-xml-parser` ^4.3.2 | **升級到 ^5.7.3**（無需改 code） | `package.json` |
| E | `vue` ^2.6.12 + `vue-axios` ^2.1.5 | **移到 `devDependencies`** | `package.json` |
| F | `@types/request` | **移除**（隨 request 一起） | `package.json` |

### 2.2 處置理由

**A. mwbot → mwn**
- `mwbot` 全系列（含最新 2.1.3）都依賴 deprecated `request@^2.88.2`，三個漏洞無法透過升級 mwbot 解決。
- `mwn` 為現代化 fork，使用 `axios` + `form-data@^4`，無受影響依賴鏈。
- mwn 內建 TypeScript 型別，可移除自訂 `src/typings/mwbot/index.d.ts`。

**B. request 移除**
- `request` 在 `package.json` 中是 direct dep（^2.88.2），但程式碼中無 `import "request"`（只有 `src/typings/mwbot/index.d.ts` 的 ambient import）。隨 mwbot 替換後可一併移除。

**C. http-proxy-middleware 1.x → 4.x**
- 我們僅在 [src/origin-proxy.ts](../../../src/origin-proxy.ts) 的單一位置使用 `createProxyMiddleware`。
- v4 改動點僅兩處：`logProvider` → `logger`、`onProxyReq` 移到 `on.proxyReq`。其餘 options（`target`、`changeOrigin`、`ssl`、`secure`、`router`）名稱與形態不變。

**D. fast-xml-parser 4.x → 5.x**
- 我們僅使用 `XMLParser` constructor 與 `.parse()`，配合 `ignoreAttributes`、`attributeNamePrefix`、`isArray` 三個 options。
- v5 完全保留這些 options 的 v4 行為；輸出結構（`#text`、`@` prefix）不變。
- 漏洞發生在 `XMLBuilder`，本專案沒用。升級僅為清除 audit 報告。

**E. vue / vue-axios 移到 devDependencies**
- 程式碼僅在 `src/viewerjs/*.ts` 將 `Vue` 用作型別（執行階段是外部 viewerjs 環境注入）。
- vue 2.x ReDoS 漏洞發生在 `parseHTML`（SSR），本專案不會在執行階段觸發。
- 移到 devDependencies 後，`npm audit --omit=dev` 不會再報 vue；保留 ^2.6.12 以維持與 viewerjs 執行環境的型別一致性。
- **不升級至 Vue 3**：viewerjs 執行環境是 Vue 2，升級到 3 會破壞型別。

**F. @types/request**
- 在 mwbot 移除後不再有任何使用點，刪除 devDependency。

### 2.3 不採用 npm overrides 的理由

雖然 `npm overrides` 可以強制 `request` 拉取受影響套件的較新版本，但：
1. `request` 本身已 deprecated，繼續用會持續累積維護債。
2. mwn 替換成本可控（重寫一個檔案 + 簡單呼叫端調整），長期收益遠大於 overrides。

## 3. 技術設計

### 3.1 mwn 替換設計

#### 3.1.1 公開介面（呼叫端視角）

呼叫端目前依賴的能力（從 `src/wiki/auto/*.ts`、`src/wiki.ts` 提取）：

| 能力 | 目前用法 | 替換後行為（必須等價） |
| --- | --- | --- |
| 取得 bot 實例並登入 | `await getMWBot()` 回傳已登入的 `MWBot` | `await getWikiBot()` 回傳已登入的 `WikiBot` 包裝物件 |
| 讀取頁面文字 | `bot.readText(title, redirect=false)` | `bot.readText(title, redirect=false)` |
| 判斷頁面是否存在 | `bot.exists(title)` | `bot.exists(title)` |
| 差異比對後寫入 | `bot.editOnDifference(title, content, summary?)` | `bot.editOnDifference(title, content, summary?)` |

設計原則：**保留現有的方法名稱與簽名**（`readText`、`exists`、`editOnDifference`），讓 `src/wiki/auto/*.ts` 的呼叫端只需要改 import / type 名稱即可。

#### 3.1.2 內部實作（mwn 對應）

```
mwbot                          → mwn
─────────────────────────────────────────────────────────
new MWBot({apiUrl, defaultSummary})
  + bot.loginGetEditToken({user, pass})
                               → await Mwn.init({apiUrl, username, password, userAgent, defaultParams: {assert: 'user'}})

bot.read(title, redirect, opts) → bot.read(title, opts)（無 redirect 參數）
bot.request(params, opts)       → bot.request(params, opts)（簽名相同）
bot.edit(title, content, summary, opts)
                               → bot.save(title, content, summary, opts)
                                  （save 是 mwn 提供的「直接寫入」API，內含衝突重試；
                                   edit() 是回調模式，本專案的 editOnDifference 流程不需要回調）
```

> Research subagent 報告中提及 mwn 的 `bot.edit(title, transform, editConfig)` 採用回調，但 mwn v3 同時提供 `bot.save(title, content, summary?, options?)` 作為直接寫入的便捷方法。本 spec 採用 `save` 以最小化呼叫端改動。

#### 3.1.3 redirect 處理

`mwbot` 的 `bot.read(title, redirect, opts)` 在 `redirect=true` 時會自動跟隨重新導向。`mwn` 的 `bot.read()` 預設不跟隨，但可透過 `request` 加 `redirects: true` 參數，或透過 `bot.request({ action: 'query', titles, redirects: 1, ... })` 達成。

本專案 `readText` 內所有呼叫端都傳 `redirect=false`（grep 確認），因此可：
- **保留 `readText` 的 `redirect` 參數簽名**以維持呼叫相容
- 內部實作僅支援 `redirect=false` 路徑（直接走 `bot.request({ action: 'query', prop: 'revisions', rvprop: 'content', titles })`）
- 若 `redirect=true` 被傳入，使用 `bot.read(title, { redirects: 1 })` 等效路徑（防禦性實作，雖然目前無呼叫端使用）

#### 3.1.4 RequestOptions 型別替換

`MWBot.RequestOptions` 在呼叫端僅作為 `customRequestOptions?: MWBot.RequestOptions` 的選用參數型別出現，且呼叫端**不會傳入此參數**（grep 確認所有 `bot.readText`、`bot.exists`、`bot.editOnDifference` 呼叫處皆無第三或第四個引數）。

替換策略：
- 在新的 `WikiBot` wrapper 中宣告 `RequestOptions` 為 `mwn` 的 `RawRequestParams` alias。
- 對外 export 的型別別名 `WikiRequestOptions` 給呼叫端引用（雖然目前無人引用）。

#### 3.1.5 編輯後的 webhook 通知

現有 [src/wiki-bot.ts:91-120](../../../src/wiki-bot.ts#L91) 在 `editOnDifference` 成功後讀取 `editRes.edit.newrevid`、`editRes.edit.pageid`、`editRes.edit.oldrevid` 來組 diff URL。

mwn 的 `bot.save()` 回傳 `ApiEditResponse`，欄位結構與 mwbot 的 edit response 對應 MediaWiki API 原生 response 結構（兩者最終都是 MW API 的 `edit` action response），預期欄位 `newrevid`、`pageid`、`oldrevid` 同名同義。

**驗證機制**（在實作 Task 中）：寫入後以 `console.log` 印出 `editRes.edit` 的鍵值結構一次，比對欄位名稱；若 mwn 回傳結構不同，spec 需修訂。但根據 MW API 文件，這三個欄位是 MW server 原生回傳，client 不會改名，預期相容。

### 3.2 http-proxy-middleware 升級設計

[src/origin-proxy.ts:101-116](../../../src/origin-proxy.ts#L101) 改寫：

```ts
// 改前
const exampleProxy = createProxyMiddleware({
  target: "https://origin-sdorica.rayark.download",
  changeOrigin: true,
  ssl: credentials,
  secure: true,
  router: {
    "sdorica.rayark.download": "https://sdorica.rayark.download",
    "soe.rayark.download": "https://soe.rayark.download",
  },
  logProvider: (provider) => logger,
  onProxyReq: onProxyReq,
});

// 改後
const exampleProxy = createProxyMiddleware({
  target: "https://origin-sdorica.rayark.download",
  changeOrigin: true,
  ssl: credentials,
  secure: true,
  router: {
    "sdorica.rayark.download": "https://sdorica.rayark.download",
    "soe.rayark.download": "https://soe.rayark.download",
  },
  logger: logger,
  on: {
    proxyReq: onProxyReq,
  },
});
```

`onProxyReq` 函式本身的簽名 `(proxyReq, req, res) => void` 在 v4 維持不變。

### 3.3 fast-xml-parser 升級設計

不需要任何 code 改動。僅升 `package.json` 版本。XMLParser constructor、`.parse()`、`ignoreAttributes`、`attributeNamePrefix`、`isArray` 行為皆不變；輸出物件中的 `#text` key 與 `@` 屬性 prefix 維持。

### 3.4 vue / vue-axios 移到 devDependencies

`package.json` 改動：

```diff
   "dependencies": {
     ...
-    "vue": "^2.6.12",
-    "vue-axios": "^2.1.5",
     "xlsx": "..."
   },
   "devDependencies": {
     ...
+    "vue": "^2.6.12",
+    "vue-axios": "^2.1.5",
     ...
   }
```

`@types/vue` 已在 devDependencies 中（^2.0.0），不變。

不需要改任何 import 路徑。`src/viewerjs/*.ts` 的型別 import (`vue-axios`) 仍可從 devDependencies 解析。

### 3.5 移除 `src/typings/mwbot/index.d.ts`

mwn 內建型別，本專案的自訂 ambient module 宣告不再需要：
- 直接刪除整個檔案。
- 確認 [tsconfig.json](../../../tsconfig.json) 的 `include` / `typeRoots` 不會因此失效（typings 目錄若僅剩此檔，可一併刪除空目錄；保留與否依 tsconfig 配置決定）。

## 4. 驗證標準

### 4.1 安全驗證

- `npm audit --omit=dev` → **0 vulnerabilities**
- `npm audit`（含 dev）→ 預期僅剩 vue 在 dev 範圍內（low），不影響生產環境

### 4.2 編譯與 Lint

- `npx tsc --noEmit -p tsconfig.json` → exit code 0
- `npx eslint .`（依專案現有 config）→ exit code 0

### 4.3 功能驗證

| 場景 | 驗證方式 | 通過標準 |
| --- | --- | --- |
| 編譯所有入口檔 | `npm run build` | 無錯誤產出 dist/ |
| origin-proxy 啟動 | 程式碼層級驗證（type check + lint）；不要求運行時測試（需 credentials） | 編譯通過 |
| mwbot 行為等價 | 程式碼層級驗證 + 手動單次 dry-run（在 dev 模式下執行 `npm run wiki:dev` 至少一次，觀察 log 中 `Edit` / `No modify` 訊息出現且無例外）| 至少一次成功讀寫流程 |
| asset list 解析 | 在 dev 模式跑 `npm run assetbundle:dev` 至少一次，觀察輸出 `assets.json` 結構與升級前一致 | 結構等價 |

### 4.4 兼容性檢查

- 確認 `package.json` 不再有 `request`、`mwbot`、`@types/request`。
- 確認 `dependencies` 中不再有 `vue`、`vue-axios`；`devDependencies` 中加入。
- 確認新增 `mwn`（dependencies）、`fast-xml-parser` 升至 ^5.7.3、`http-proxy-middleware` 升至 ^4.0.0。

## 5. 風險與緩解

| 風險 | 機率 | 影響 | 緩解 |
| --- | --- | --- | --- |
| mwn 的 `save()` 行為與 mwbot `edit()` 不完全等價（例如 token 處理、重試策略） | 中 | wiki 編輯失敗 | 實作時保留 `editOnDifference` 函式內的 try/catch 與既有 logging；首次 dry-run 觀察 |
| mwn 的 `read()` 在頁面不存在時的回傳形態不同於 mwbot | 中 | `exists()` 邏輯誤判 | 在 `readText` 實作時直接走 `bot.request({action:'query', ...})`，自己解析 `query.pages` 結構，避開 `bot.read()` 的便捷封裝差異（完全保留現有 mwbot 實作的解析邏輯） |
| http-proxy-middleware v4 對 `router` 物件型別更嚴格 | 低 | type error | type check 階段就會出現；如出現可改用 `pathRewrite` 或 function form |
| vue 移到 devDependencies 後 webpack 找不到 vue-axios | 低 | webpack build fail | webpack 將 vue-axios 視為外部 module（viewerjs 環境提供），實際上不打包；若有問題加 `externals` 設定 |

## 6. 交付物

- 修改後的 `package.json` + `package-lock.json`（lockfile 重建）
- 重寫的 `src/wiki-bot.ts`（從 mwbot 換到 mwn）
- 微調的 `src/wiki.ts`、`src/wiki/auto/rune-redirect.ts`、`src/wiki/auto/sc-redirect.ts`、`src/wiki/auto/monster.ts`、`src/wiki/auto/update-explore-item.ts`、`src/wiki/auto/hero.ts`（替換 import 與型別）
- 微調的 `src/origin-proxy.ts`（升級 http-proxy-middleware options）
- 移除 `src/typings/mwbot/index.d.ts`
- 不需要改 `src/assetbundle/asset-list.ts`、`src/viewerjs/*`

## 7. 不在本 spec 範圍

- 任何 Vue 3 升級工作
- 替換 `request` 之外的其他 deprecated 套件（如 `bluebird` via mwn — 由 mwn 維護者管理，不是我們的責任）
- 為 wiki-bot 增加單元測試框架
- 任何 refactor（純粹 dependency 升級 + 必要的 API 對應改動）

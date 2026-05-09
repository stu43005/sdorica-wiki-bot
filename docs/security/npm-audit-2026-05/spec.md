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
| A | `mwbot` ^1.0.10 | **替換為 `mwn` ^3.0.2** | `src/wiki-bot.ts`、`src/wiki.ts`、`src/wiki/auto/*.ts`、~~`src/typings/mwbot/index.d.ts`~~（刪除） |
| B | `request` ^2.88.2 | **隨 mwbot 移除**（package.json 中的 direct dep 也要移除） | `package.json` |
| C | `http-proxy-middleware` ^1.0.6 | **升級到 ^3.0.5** + 改寫 options | `src/origin-proxy.ts` |
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

**C. http-proxy-middleware 1.x → 3.x（不到 4.x）**
- 我們僅在 [src/origin-proxy.ts](../../../src/origin-proxy.ts) 的單一位置使用 `createProxyMiddleware`。
- 升級目標為 **v3.0.5**（不是 v4）。理由：v4.0.0 要求 `node ^22.15.0 || ^24.0.0 || >=26.0.0` 並僅支援 ESM，本專案 `package.json` 的 `engines.node` 為 `>=20.9.0`，升 v4 會打破 Node 20 相容性。v3.0.5 的 engines 為 `^14.15.0 || ^16.10.0 || >=18.0.0`，相容 Node 20。
- v3.0.5 已修復 spec §1.1 列出的所有 GHSA（GHSA-c7qv-q95q-8v27、GHSA-9gqv-wp59-fq42、GHSA-4www-5p9h-95mh — 這些 advisory 範圍是 `<=2.0.8`）。
- v2 → v3 的 migration 改動點（亦即我們從 v1 直接跳 v3 需處理的全部變動）：`logProvider` → `logger`、`onProxyReq` 移到 `on.proxyReq`。其餘 options（`target`、`changeOrigin`、`ssl`、`secure`、`router`）名稱與形態不變。

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
| 取得 bot 實例並登入 | `await getMWBot()` 回傳已登入的 `MWBot` | `await getMWBot()` 回傳已登入的 `Mwn`（保留函式名稱不變） |
| 讀取頁面文字 | `bot.readText(title, redirect=false)` | `bot.readText(title, redirect=false)` |
| 判斷頁面是否存在 | `bot.exists(title)` | `bot.exists(title)` |
| 差異比對後寫入 | `bot.editOnDifference(title, content, summary?)` | `bot.editOnDifference(title, content, summary?)` |

設計原則：**保留現有的函式 / 方法名稱與簽名**（`getMWBot`、`readText`、`exists`、`editOnDifference`），讓 [src/wiki.ts:12](../../../src/wiki.ts#L12)、[src/wiki.ts:142](../../../src/wiki.ts#L142) 與 `src/wiki/auto/*.ts` 的呼叫端只需要改 import 來源（從 `"mwbot"` 改成 `"mwn"`）與 bot 物件的型別名稱（`MWBot` 改成 `Mwn`），不需修改函式呼叫名稱。

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
                                  （save 是 mwn 提供的「直接寫入」API；
                                   edit() 是回調模式，本專案的 editOnDifference 流程不需要回調）
```

> 已驗證 `node_modules/mwn` 的 `bot.d.ts` 簽名：
>
> - `save(title: string | number, content: string, summary?: string, options?: ApiEditPageParams): Promise<ApiEditResponse>`（bot.d.ts:405）
> - `bot.save()` 內部呼叫 `request({action:'edit', ...})` 並回傳 `data.edit`（bot.js:842-850），即 mwn 已**自動 unwrap** MW API 的 `{ edit: {...} }` 外層。
>
> **重要差異**：mwbot 的 `bot.edit()` 回傳原始 MW API response（`editRes.edit.newrevid`），mwn 的 `bot.save()` 回傳已 unwrap 的物件（直接 `editRes.newrevid`）。本 spec §3.1.5 與實作 Task 必須使用 unwrap 後的存取路徑。

#### 3.1.3 redirect 處理

已驗證 `mwn` 的 `bot.read()` 在 `bot.js:693-703` 預設帶 `redirects: true`（即會自動跟隨）。本專案 `readText` 的呼叫端**全部傳 `redirect=false`**（grep 確認 `src/wiki/auto/*.ts`、`src/wiki-bot.ts`），因此採用以下策略：

- **保留 `readText(title, redirect, customRequestOptions?)` 的簽名不變**，維持呼叫相容性。
- **內部實作完全沿用現有 `src/wiki-bot.ts` 中以 `bot.request({ action: 'query', prop: 'revisions', rvprop: 'content', titles })` 的解析邏輯**，不依賴 `bot.read()`。原有實作已經能處理 `redirects` 參數差異：當 `redirect=true` 時加 `redirects: 1`、當 `redirect=false` 時不加。
- 採用此設計可避免依賴 mwn 的 `bot.read()` 預設值與 unwrap 行為差異，是最小風險路徑。

mwn 的 `bot.request(params, customOptions)` 簽名與 mwbot 一致（mwn `bot.d.ts` 確認），回傳 `ApiResponse`，內含 `query.pages` 結構，與 mwbot 行為一致。

#### 3.1.4 RequestOptions 型別替換

`MWBot.RequestOptions` 在呼叫端僅作為 `customRequestOptions?: MWBot.RequestOptions` 的選用參數型別出現，且呼叫端**不會傳入此參數**（grep 確認所有 `bot.readText`、`bot.exists`、`bot.editOnDifference` 呼叫處皆無第三或第四個引數）。

替換策略：

- 在 `src/wiki-bot.ts` 內部使用 `mwn` 的 `RawRequestParams` 型別作為 `customRequestOptions?` 的型別宣告。
- **不對外 export** 任何新的型別別名；若未來呼叫端需要引用，再依需求新增。遵守最小改動原則。

#### 3.1.5 編輯後的 webhook 通知

現有 [src/wiki-bot.ts:83-120](../../../src/wiki-bot.ts#L83) 在 `editOnDifference` 中：第 83 行 `const editRes = await this.edit(...)` 賦值；第 94 行起的 webhook block 讀取 `editRes.edit.newrevid`、`editRes.edit.pageid`、`editRes.edit.oldrevid`。

**已驗證的 mwn API 結構**（從 `node_modules/mwn` 提取）：

- `mwn` 的 `ApiEditResponse` 型別（`build/api_response_types.d.ts:8-17`）為 `{ result: string; pageid: number; title: string; contentmodel: string; nochange?: true; oldrevid: number; newrevid: number; newtimestamp: string }`（所有欄位於頂層，無 `edit` 包裝層）。
- `bot.save()` 內部回傳 `data.edit`（`bot.js:850`），即已 unwrap。

**因此實作上的具體改動**：

- 將 `editRes.edit.newrevid` 改為 `editRes.newrevid`
- 將 `editRes.edit.pageid` 改為 `editRes.pageid`
- 將 `editRes.edit.oldrevid` 改為 `editRes.oldrevid`

無需 fallback 路徑，欄位名稱與存在性已透過型別定義確認。

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

`onProxyReq` 函式本身的簽名 `(proxyReq, req, res) => void` 在 v3 維持不變。

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

- `npm audit --omit=dev` → **必須回傳 0 vulnerabilities**（pass 條件）
- `npm audit`（含 dev）→ 允許出現 vue 2.x 的 low 等級 advisory（GHSA-5j4c-8p2g-v4jx）。**不允許出現任何 moderate 或以上的新 advisory**，特別是不允許 mwn 的傳遞依賴新增任何 advisory；若出現需在實作 Task 中評估並回報。

### 4.2 編譯與 Lint

- `npx tsc --noEmit -p tsconfig.json` → exit code 0
- `npx eslint .`（依專案現有 config）→ exit code 0

### 4.3 功能驗證

| # | 場景 | 驗證方式 | 通過標準 |
| --- | --- | --- | --- |
| V1 | 編譯所有入口檔 | `npm run build` | exit code 0，產出 `dist/` |
| V2 | viewerjs webpack 打包 | `npm run webpack` | exit code 0；`dist/viewerjs/*.js`（或現有的 webpack 產出位置）存在；若失敗，可能需要在 `webpack.config.*` 加 `externals: { vue: 'Vue', 'vue-axios': 'VueAxios' }` |
| V3 | origin-proxy 啟動 | 程式碼層級驗證（type check + lint）；不要求運行時測試（需 credentials） | V1、V2 通過即視為通過 |
| V4 | mwbot → mwn 行為等價 | 在 dev 模式（`NODE_ENV=development`）執行 `npm run wiki:dev` 一次。現行流程會寫入三類頁面：`使用者:小飄飄/wiki/*`、`使用者:小飄飄/bot/*.json`、`模板:Constant/*`（皆由 [src/wiki.ts:104-134](../../../src/wiki.ts#L104) 的 `outWiki` / `outWikiJson` / `outWikiConstant` 統一控制）。觀察 log。 | (a) 至少一次 `Edit:` 或 `No modify:` log 出現；(b) 無 `UnhandledPromiseRejection` / 拋出 Error；(c) 若出現 `Edit:` log，**手動到 sdorica.xyz 該頁面查看 diff，確認內容與本地產出一致**（手動 visual check 即可）。本驗證不要求新增 sandbox filter（明確排除於 spec 範圍）；驗收者需注意 dev 模式仍會對線上 wiki 寫入。 |
| V5 | asset list 解析 | 在 dev 模式執行 `npm run assetbundle:dev` 一次 | (a) exit code 0；(b) 任一輸出的 `assets.json` 與升級前同 commit 的對應 `assets.json` diff 為空（升級前先以 git stash 暫存或 worktree 比對） |

### 4.4 兼容性檢查

- 確認 `package.json` 不再有 `request`、`mwbot`、`@types/request`。
- 確認 `dependencies` 中不再有 `vue`、`vue-axios`；`devDependencies` 中加入。
- 確認新增 `mwn`（dependencies）、`fast-xml-parser` 升至 ^5.7.3、`http-proxy-middleware` 升至 ^3.0.5。

## 5. 風險與緩解

| 風險 | 機率 | 影響 | 緩解 |
| --- | --- | --- | --- |
| mwn 的 `save()` 行為與 mwbot `edit()` 不完全等價（例如 token 處理、重試策略） | 中 | wiki 編輯失敗 | 實作時保留 `editOnDifference` 函式內的 try/catch 與既有 logging；首次 dry-run 觀察 |
| mwn 的 `read()` 在頁面不存在時的回傳形態不同於 mwbot | 中 | `exists()` 邏輯誤判 | 在 `readText` 實作時直接走 `bot.request({action:'query', ...})`，自己解析 `query.pages` 結構，避開 `bot.read()` 的便捷封裝差異（完全保留現有 mwbot 實作的解析邏輯） |
| http-proxy-middleware v3 對 `router` 物件型別比 v1 更嚴格 | 低 | type error | type check 階段就會出現；如出現可改用 `pathRewrite` 或 function form |
| vue 移到 devDependencies 後 webpack 找不到 vue-axios | 低 | webpack build fail | webpack 將 vue-axios 視為外部 module（viewerjs 環境提供），實際上不打包；若有問題加 `externals` 設定 |

## 6. 交付物

- 修改後的 `package.json` + `package-lock.json`（lockfile 重建）
- 重寫的 `src/wiki-bot.ts`（從 mwbot 換到 mwn；保留 `getMWBot` 函式名稱、`readText`/`exists`/`editOnDifference` 方法名稱與簽名；改用 `bot.save()` 並改寫 unwrap 後的 `editRes` 欄位存取）
- 微調的 `src/wiki.ts`、`src/wiki/auto/rune-redirect.ts`、`src/wiki/auto/sc-redirect.ts`、`src/wiki/auto/monster.ts`、`src/wiki/auto/update-explore-item.ts`、`src/wiki/auto/hero.ts`（僅替換 import 來源 `"mwbot"` → `"mwn"` 與 `MWBot` 型別 → `Mwn`；不改函式呼叫名稱）
- 微調的 `src/origin-proxy.ts`（升級 http-proxy-middleware v3 options：`logProvider` → `logger`、`onProxyReq` 移到 `on.proxyReq`）
- 刪除 `src/typings/mwbot/index.d.ts`（若該目錄因此空了，連同空目錄一併刪除）
- **若** §4.3 V2 webpack 驗證失敗，可能額外修改 `webpack.config.*`（加入 `externals: { vue: 'Vue', 'vue-axios': 'VueAxios' }`）；此為條件式交付物，僅在驗證 fail 時才需處理
- 不需要改 `src/assetbundle/asset-list.ts`、`src/viewerjs/*`

## 7. 不在本 spec 範圍

- 任何 Vue 3 升級工作
- 替換 `request` 之外的其他 deprecated 套件（如 `bluebird` via mwn — 由 mwn 維護者管理，不是我們的責任）
- 為 wiki-bot 增加單元測試框架
- 任何 refactor（純粹 dependency 升級 + 必要的 API 對應改動）

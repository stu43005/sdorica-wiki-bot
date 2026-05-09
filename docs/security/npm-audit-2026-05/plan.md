# npm audit fix Implementation Plan (2026-05)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修復 [docs/security/npm-audit-2026-05/spec.md](spec.md) 中列出的 8 個 npm audit 漏洞，使生產依賴 `npm audit --omit=dev` 回傳 0 vulnerabilities，且不破壞既有功能。

**Architecture:** 直接更新 `package.json` 與必要的程式碼呼叫位點：(1) 將 `mwbot`（依賴 deprecated `request`）替換為 `mwn`，重寫 `src/wiki-bot.ts`；(2) `http-proxy-middleware` 升至 v3.0.5（保持 Node 20 相容）並改寫 [src/origin-proxy.ts](../../../src/origin-proxy.ts) 的 options；(3) `fast-xml-parser` 升至 5.x（無 code 改動）；(4) `vue` / `vue-axios` 移到 devDependencies。每個 Task 結束後做 type check / lint / build 驗證後再 commit。

**Tech Stack:** TypeScript 5.x、Node.js 20+、`mwn` ^3.0.2、`http-proxy-middleware` ^3.0.5、`fast-xml-parser` ^5.7.3、ESLint 8、TSC `--noEmit`，無 unit test framework（驗證以 type check + build + dry-run 取代）。

---

## File Structure

| 檔案 | 動作 | 責任 |
| --- | --- | --- |
| [package.json](../../../package.json) | Modify | 升級 / 替換依賴版本 |
| [package-lock.json](../../../package-lock.json) | Modify（自動） | 由 npm 重新生成 |
| [src/wiki-bot.ts](../../../src/wiki-bot.ts) | Modify（重寫） | mwbot → mwn 替換、保留公開 API 簽名（`getMWBot`、`readText`、`exists`、`editOnDifference`） |
| [src/wiki.ts](../../../src/wiki.ts) | Modify | 將 `MWBot` 型別 import 改為 `Mwn` |
| [src/wiki/auto/rune-redirect.ts](../../../src/wiki/auto/rune-redirect.ts) | Modify | 同上（純型別 import 替換） |
| [src/wiki/auto/sc-redirect.ts](../../../src/wiki/auto/sc-redirect.ts) | Modify | 同上 |
| [src/wiki/auto/monster.ts](../../../src/wiki/auto/monster.ts) | Modify | 同上 |
| [src/wiki/auto/update-explore-item.ts](../../../src/wiki/auto/update-explore-item.ts) | Modify | 同上 |
| [src/wiki/auto/hero.ts](../../../src/wiki/auto/hero.ts) | Modify | 同上 |
| [src/origin-proxy.ts](../../../src/origin-proxy.ts) | Modify | http-proxy-middleware v3 options 結構 |
| [src/typings/mwbot/index.d.ts](../../../src/typings/mwbot/index.d.ts) | Delete | mwn 內建型別，自訂 ambient 宣告不再需要；`src/typings/mwbot/` 子目錄一併刪除，但**保留** `src/typings/` 父目錄（tsconfig.json 的 `typeRoots` 仍指向它，TypeScript 對不存在的 typeRoot 會靜默忽略，但保留空目錄可避免日後新增 ambient 宣告時還要回頭改 tsconfig.json） |

無檔案需新建。`src/assetbundle/asset-list.ts`、`src/viewerjs/*` 不需修改。

---

## Pre-flight Check（在進入 Task 1 之前必須完成）

Executor 啟動 plan 之前必須先完成兩項準備並寫入交付摘要：

### P1: 判定 V4_ENABLED（wiki:dev runtime 驗證是否可執行）

V4 是 mwbot→mwn 替換後唯一的 runtime 行為驗證點。在 Task 1 之前先檢查：

```bash
ls config/local*.json 2>/dev/null
```

並檢查（若檔案存在）內容是否包含 `mwbot.user` 與 `mwbot.pass` 欄位：

```bash
node -e "try { const c = require('./config/local.json'); console.log(c.mwbot && c.mwbot.user ? 'V4_ENABLED=true' : 'V4_ENABLED=false'); } catch(e) { console.log('V4_ENABLED=false'); }"
```

- 若輸出 `V4_ENABLED=true` → Task 7 Step 4 必須執行。
- 若輸出 `V4_ENABLED=false` → 在最終 verification-report.md 中明確標示「V4 未執行，需由具備 credentials 的環境補驗證才能正式合併」；user review gate 由使用者決定是否繼續。

將 V4_ENABLED 結果記下，後續 Task 7 會用到。

### P2: 取得 V5 baseline（fast-xml-parser 升級前 `assets.json`）

V5 驗證要求 baseline diff 為空。必須在 Task 1 動 `package.json` 之前取得：

```bash
git status --porcelain | grep -v '^??' | head -1
```

Expected: 無輸出（working tree clean）。若有 modified 檔，先 `git stash -u` 保存後再繼續，並在 P2 結束後 `git stash pop`。

接著執行 baseline 採集（若 `data/` 目錄不存在 asset 資料，**標記 V5_BASELINE_AVAILABLE=false**，後續 Task 7 Step 5 跳過並在 verification-report.md 註記）：

```bash
test -d data && npm run assetbundle:dev
```

若上述指令成功（exit 0），找出產生的 `assets.json` 並複製到工作目錄外：

```bash
find . -name 'assets.json' -newer package.json -not -path './node_modules/*' 2>/dev/null | head -3
# 將找到的 assets.json 複製到 /tmp/audit-baseline-assets.json
# （複製命令需依實際路徑調整；若有多份，全部複製到 /tmp/audit-baseline-assets-<i>.json）
```

記錄是否成功取得 baseline：V5_BASELINE_AVAILABLE=true 或 false。

**P1 與 P2 完成後才能進入 Task 1。**

---

## Task 1: 升級 fast-xml-parser 至 v5（無 code 改動）

**Rationale:** 從低風險開始：fast-xml-parser v5 對我們使用的 options 完全相容，僅升 version。先做這個確保 baseline 工具鏈（`npm install`、`tsc`、build）正常。

**Files:**

- Modify: `package.json`（單行）
- 自動更新: `package-lock.json`

- [ ] **Step 1: 修改 package.json 中 fast-xml-parser 版本**

打開 `package.json`，找到 `"fast-xml-parser": "^4.3.2"`（位於 `dependencies` 區塊），改為：

```json
"fast-xml-parser": "^5.7.3",
```

不要動其他行。

- [ ] **Step 2: 執行 npm install 重建 lockfile**

Run:

```bash
npm install
```

Expected: 無錯誤；輸出顯示 `fast-xml-parser` 5.x 被安裝；`package-lock.json` 被更新。

- [ ] **Step 3: 驗證 fast-xml-parser 確實升至 5.x**

Run:

```bash
npm ls fast-xml-parser
```

Expected output 包含 `fast-xml-parser@5.7.3`（或 5.7.x 較新版）。

- [ ] **Step 4: 執行 type check**

Run:

```bash
npx tsc --noEmit -p tsconfig.json
```

Expected: exit code 0。若有 error 顯示與 `XMLParser` 或 `fast-xml-parser` 相關，停下來檢查 `src/assetbundle/asset-list.ts` 是否有需要調整型別處（spec §3.3 已確認應無需改動，若出錯回報並停止）。

- [ ] **Step 5: 執行 ESLint**

Run:

```bash
npx eslint .
```

Expected: exit code 0。

- [ ] **Step 6: 執行 build**

Run:

```bash
npm run build
```

Expected: exit code 0；`dist/` 產生且包含編譯後檔案。

- [ ] **Step 7: 提交**

Run:

```bash
git add package.json package-lock.json
git commit -m "chore(deps): upgrade fast-xml-parser to ^5.7.3

Closes GHSA-gh4j-gqv2-49f6. v5 is fully compatible with our
XMLParser usage in src/assetbundle/asset-list.ts (verified in spec §3.3)."
```

---

## Task 2: 升級 http-proxy-middleware 至 v3.0.5 並改寫 origin-proxy options

**Rationale:** v3.0.5 是相容於 Node 20 的最高版本，且已修復 spec §1.1 列出的 3 個 GHSA。v2 → v3 改動點僅 `logProvider` → `logger` 與 `onProxyReq` 移到 `on.proxyReq`（spec §3.2）。

**Files:**

- Modify: `package.json`（單行）
- Modify: `src/origin-proxy.ts`（行 101-116 範圍）
- 自動更新: `package-lock.json`

- [ ] **Step 1: 修改 package.json 中 http-proxy-middleware 版本**

打開 `package.json`，找到 `"http-proxy-middleware": "^1.0.6"`（dependencies 區塊），改為：

```json
"http-proxy-middleware": "^3.0.5",
```

- [ ] **Step 2: 執行 npm install**

Run:

```bash
npm install
```

Expected: 無錯誤；http-proxy-middleware 3.x 被安裝。

- [ ] **Step 3: 確認 http-proxy-middleware 升至 3.0.5+**

Run:

```bash
npm ls http-proxy-middleware
```

Expected output 包含 `http-proxy-middleware@3.0.5`（或 3.0.x 較新版）。

- [ ] **Step 4: 執行 type check（預期會出錯）**

Run:

```bash
npx tsc --noEmit -p tsconfig.json
```

Expected: 失敗於 `src/origin-proxy.ts`，錯誤訊息會指向 `logProvider` / `onProxyReq` 不在 v3 的型別中。這是預期的，下一步會修。

- [ ] **Step 5: 修改 src/origin-proxy.ts 的 createProxyMiddleware 呼叫**

> **重要**：此檔案使用 **TAB** 縮排。下方 before / after code block **必須**保留 TAB（不可改為 spaces），否則 Edit tool 的 `old_string` 將無法匹配。

打開 `src/origin-proxy.ts`，在第 101-116 行找到目前的（縮排為 TAB）：

```ts
	const exampleProxy = createProxyMiddleware({
		target: "https://origin-sdorica.rayark.download", // target host
		changeOrigin: true, // needed for virtual hosted sites
		ssl: credentials,
		secure: true,
		router: {
			// when request.headers.host == 'dev.localhost:3000',
			// override target 'http://www.example.org' to 'http://localhost:8000'
			// 'dev.localhost:3000': 'http://localhost:8000',
			"sdorica.rayark.download": "https://sdorica.rayark.download",
			"soe.rayark.download": "https://soe.rayark.download",
		},
		logProvider: (provider) => logger,
		// logLevel: 'debug',
		onProxyReq: onProxyReq,
	});
```

把它改為（同樣使用 TAB 縮排）：

```ts
	const exampleProxy = createProxyMiddleware({
		target: "https://origin-sdorica.rayark.download", // target host
		changeOrigin: true, // needed for virtual hosted sites
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

注意：

- 移除原來 `logProvider: (provider) => logger,` 這行（v3 的 `logger` 直接接受 logger 物件，無需 provider 函式）。
- 移除中間舊註解 `// when request.headers.host...`（過時，與本案實作無關）。
- 移除舊註解 `// logLevel: 'debug',`。
- 程式碼以外的 import 與其他段落不變。

- [ ] **Step 6: 執行 type check**

Run:

```bash
npx tsc --noEmit -p tsconfig.json
```

Expected: exit code 0。若仍有錯誤指向 `router` 型別，請確認 `router` 物件結構與上一步一致（v3 仍支援 `Record<string, string>` form）。

- [ ] **Step 7: 執行 ESLint**

Run:

```bash
npx eslint .
```

Expected: exit code 0。

- [ ] **Step 8: 執行 build**

Run:

```bash
npm run build
```

Expected: exit code 0。

- [ ] **Step 9: 提交**

Run:

```bash
git add package.json package-lock.json src/origin-proxy.ts
git commit -m "fix(deps): upgrade http-proxy-middleware to ^3.0.5

Closes GHSA-c7qv-q95q-8v27, GHSA-9gqv-wp59-fq42, GHSA-4www-5p9h-95mh.
Pinned to v3.x because v4 requires Node 22+ but project engines is
Node >=20.9.0. Migrated v2->v3 breaking changes:
- logProvider -> logger
- onProxyReq -> on.proxyReq"
```

---

## Task 3: 安裝 mwn 並重寫 src/wiki-bot.ts

**Rationale:** 這是本 plan 的核心 Task。`mwbot` 全系列都依賴 deprecated `request` 套件，必須整套替換。`src/wiki-bot.ts` 是 mwbot 的唯一封裝點；spec §3.1 規定保留 `getMWBot` 函式名稱與 `readText`/`exists`/`editOnDifference` 方法簽名，因此呼叫端僅需改 import 來源（Task 4 處理）。

**Files:**

- Modify: `package.json`（移除 `mwbot`、`request`、`@types/request`；新增 `mwn`）
- Modify: `src/wiki-bot.ts`（完整重寫）
- 自動更新: `package-lock.json`

- [ ] **Step 1: 修改 package.json 套件清單**

打開 `package.json`：

a. 在 `dependencies` 區塊：

- 找到 `"mwbot": "^1.0.10",` → 刪除整行
- 找到 `"request": "^2.88.2",` → 刪除整行
- 在合適字母順序位置（在 `msgpack5` 之後、`numeral` 之前）新增：

```json
        "mwn": "^3.0.2",
```

b. 在 `devDependencies` 區塊：

- 找到 `"@types/request": "^2.48.12",` → 刪除整行

存檔。

- [ ] **Step 2: 執行 npm install**

Run:

```bash
npm install
```

Expected: 無錯誤；輸出顯示 `mwn` 3.x 被加入、`mwbot` 與 `request` 被移除。

- [ ] **Step 3: 驗證套件變更**

Run:

```bash
npm ls mwn
npm ls mwbot 2>&1 | head -5
npm ls request 2>&1 | head -5
```

Expected:

- `npm ls mwn` 顯示 `mwn@3.0.2`（或更高 3.x）
- `npm ls mwbot` 報告 `(empty)` 或 `not found`（已移除）
- `npm ls request` 報告 `(empty)` 或 `not found`

- [ ] **Step 4: 執行 type check（預期會出錯）**

Run:

```bash
npx tsc --noEmit -p tsconfig.json 2>&1 | head -50
```

Expected: 失敗，因為 `src/wiki-bot.ts`、`src/wiki.ts`、`src/wiki/auto/*.ts` 都還 import `mwbot`。這是預期的；本 Task 解掉 `wiki-bot.ts`，Task 4 解掉其餘檔案。

- [ ] **Step 5: 重寫 src/wiki-bot.ts**

完全覆寫 `src/wiki-bot.ts` 為以下內容（使用 Write tool）：

> **重要**：此檔案使用 **TAB** 縮排（與專案其他 .ts 檔案一致）。下方 code block 中的縮排為 TAB；Write tool 必須完整保留。

```ts
import config from "config";
import { Mwn } from "mwn";
import type { ApiEditResponse, ApiParams, RawRequestParams } from "mwn";
import url from "url";
import { discordWebhook } from "./discord-webhook.js";
import { Logger } from "./logger.js";
import { isDevMode } from "./utils.js";

const logger = new Logger("mwbot");
const DEFAULT_SUMMARY = "Upload by MWBot";

type MWRevision = {
	contentmodel?: string;
	contentformat?: string;
	"*": string;
};

type MWRevisionSlot = {
	slots: {
		main: MWRevision;
	};
};

declare module "mwn" {
	interface Mwn {
		readText(
			title: string,
			redirect: boolean,
			customRequestOptions?: RawRequestParams,
		): Promise<string>;
		exists(title: string, customRequestOptions?: RawRequestParams): Promise<boolean>;
		editOnDifference(
			title: string,
			content: string,
			summary?: string,
			customRequestOptions?: RawRequestParams,
		): Promise<void>;
	}
}

export async function getMWBot(): Promise<Mwn> {
	const bot = await Mwn.init({
		apiUrl: "https://sdorica.xyz/api.php",
		username: config.get<string>("mwbot.user"),
		password: config.get<string>("mwbot.pass"),
		defaultParams: {
			assert: "user",
		},
		userAgent: "sdorica-wiki-bot (https://github.com/stu43005/sdorica-wiki-bot)",
	});

	bot.readText = async function (
		this: Mwn,
		title: string,
		redirect: boolean,
		customRequestOptions?: RawRequestParams,
	): Promise<string> {
		const params: ApiParams = {
			action: "query",
			prop: "revisions",
			rvprop: "content",
			titles: title,
		};
		if (redirect) {
			params.redirects = 1;
		}
		const res = await this.request(params, customRequestOptions);

		if (res.query) {
			if (res.query.redirects) {
				for (let i = 0; i < res.query.redirects.length; i++) {
					const r = res.query.redirects[i];
					if (r.from == title) {
						title = r.to;
						break;
					}
				}
			}
			if (res.query.pages) {
				for (const pageid in res.query.pages) {
					const page = res.query.pages[pageid];
					if (page.title == title && page.revisions) {
						if ("slots" in page.revisions[0]) {
							const slot = page.revisions[0] as MWRevisionSlot;
							return slot["slots"]["main"]["*"];
						} else {
							const revision = page.revisions[0] as MWRevision;
							return revision["*"];
						}
					}
				}
			}
		}
		return "";
	};

	bot.exists = async function (
		this: Mwn,
		title: string,
		customRequestOptions?: RawRequestParams,
	): Promise<boolean> {
		return (await this.readText(title, false, customRequestOptions)) ? true : false;
	};

	bot.editOnDifference = async function (
		this: Mwn,
		title: string,
		content: string,
		summary?: string,
		customRequestOptions?: RawRequestParams,
	): Promise<void> {
		const online = await this.readText(title, false, customRequestOptions);
		content = content.replace(/\r/g, "\n");
		if (content != online) {
			const editRes: ApiEditResponse = await this.save(
				title,
				content,
				summary ?? DEFAULT_SUMMARY,
				{ bot: true },
			);
			if (
				config.get("dcWebhook") &&
				title.startsWith("使用者:小飄飄/wiki/") &&
				editRes.newrevid &&
				!isDevMode()
			) {
				const pageUrl = url.format({
					protocol: "https",
					hostname: "sdorica.xyz",
					pathname: "/index.php",
					query: {
						title,
					},
				});
				const diffUrl = url.format({
					protocol: "https",
					hostname: "sdorica.xyz",
					pathname: "/index.php",
					query: {
						title,
						curid: editRes.pageid,
						diff: editRes.newrevid,
						oldid: editRes.oldrevid,
					},
				});
				await discordWebhook({
					username: "MWBot",
					content: `Edit: [${title}](${pageUrl}) ([diff](${diffUrl}))`,
				});
			}
			logger.log(`Edit: ${title}`);
		} else {
			logger.log(`No modify: ${title}`);
		}
	};

	return bot;
}
```

要點解釋（給 implementer 參考；**勿將以下說明寫進原始碼或註解**）：

- `Mwn.init()` 直接帶 username/password，會 auto login 並取得 token，等價於 mwbot 的 `loginGetEditToken`。
- `defaultParams: { assert: "user" }` 確保所有 request 都驗證已登入。
- `declare module "mwn"` 將自訂 method（`readText` / `exists` / `editOnDifference`）合併到 `Mwn` 介面，讓呼叫端 `bot.readText(...)` 通過型別檢查。
- `editRes.newrevid` / `editRes.pageid` / `editRes.oldrevid`：mwn 的 `bot.save()` 已自動 unwrap MW API 的 `{ edit: {...} }` 外層。
- `bot.save()` 第四個參數型別為 `ApiEditPageParams`（MW API 編輯參數），與 `bot.request()` 的 `RawRequestParams`（axios-level）不同型別，因此**不能**把 `customRequestOptions` 合併進去。`customRequestOptions` 僅透過 `readText` 的 `bot.request()` 路徑使用；目前所有呼叫端皆未傳入此參數（grep 已確認），保留簽名僅為相容性。
- `summary ?? DEFAULT_SUMMARY` 取代 mwbot 的 `defaultSummary` option（mwn 沒有此 init 選項）。
- `redirects: 1` 處理 `redirect=true` 路徑（防禦性實作，目前無呼叫端使用）。
- `params: ApiParams` 使用 mwn root export 的 `ApiParams` 型別，相容 `redirects: number | boolean`。
- 內部解析 `query.pages` 結構與舊版完全相同，保證行為等價。

- [ ] **Step 6: 執行 type check（部分檔案仍會錯）**

Run:

```bash
npx tsc --noEmit -p tsconfig.json 2>&1 | head -30
```

Expected: 仍會顯示 `src/wiki.ts`、`src/wiki/auto/*.ts` 對 `mwbot` 的 import 失敗，**但 `src/wiki-bot.ts` 本身應無錯誤**。

如果 `src/wiki-bot.ts` 內部有錯誤訊息，必須先修。常見可能：

- mwn export 名稱大小寫：確認是 `import { Mwn } from "mwn"`（大寫 M、小寫 wn）。
- `RawRequestParams` 型別名稱：若 mwn 此版本使用其他名稱，從 `node_modules/mwn/build/core.d.ts` 查實際 export，並更新此處 import。
- `ApiEditResponse` 型別名稱：應在 `mwn` 的 root export 中。

僅 `wiki.ts` / `wiki/auto/*.ts` 的錯誤可以接受，留到 Task 4 處理。

- [ ] **Step 7: 不在此 Task commit**

說明：因為現在 type check 還會 fail（其他檔案還沒修），不要在這裡 commit。Task 3 與 Task 4 在 git 上會合併為一個邏輯單元。但保留檔案修改在 working tree 進入 Task 4。

如果 subagent-driven-development 流程要求每 Task 都 commit，則使用以下訊息建立中繼 commit（之後 Task 4 會接續再 commit 一次）：

```bash
git add package.json package-lock.json src/wiki-bot.ts
git commit -m "refactor(wiki-bot): replace mwbot with mwn (WIP, callers next)

WIP: src/wiki.ts and src/wiki/auto/*.ts still import from 'mwbot'.
Will be fixed in the following commit. tsc will fail at this point;
type-check will pass after the next commit."
```

---

## Task 4: 更新所有 mwbot 呼叫端 import

**Rationale:** Task 3 完成後，[src/wiki-bot.ts](../../../src/wiki-bot.ts) 的對外 API 簽名與舊版完全相容，呼叫端僅需改 import 來源（`"mwbot"` → `"mwn"`）與 default import → named import（mwn 是 named export `Mwn`）。

**Files:**

- Modify: `src/wiki.ts`（line 1）
- Modify: `src/wiki/auto/rune-redirect.ts`（line 1、type 引用）
- Modify: `src/wiki/auto/sc-redirect.ts`（line 1、type 引用）
- Modify: `src/wiki/auto/monster.ts`（line 1、type 引用）
- Modify: `src/wiki/auto/update-explore-item.ts`（line 1、type 引用）
- Modify: `src/wiki/auto/hero.ts`（line 1、type 引用）

- [ ] **Step 1: 修改 src/wiki.ts**

打開 `src/wiki.ts`，將第 1 行：

```ts
import MWBot from "mwbot";
```

改為：

```ts
import type { Mwn } from "mwn";
```

接著把該檔內所有 `MWBot` 型別引用替換為 `Mwn`（檔內目前使用點：第 104、119、129、139 行 `bot: MWBot | undefined` 之類的型別宣告）。`getMWBot()` 函式呼叫名稱**不變**（在第 142 行附近）。

可以用以下命令幫助確認替換完整：

```bash
grep -n "MWBot" src/wiki.ts
```

Expected after edit: 應僅剩第 12 行與第 142 行的 `getMWBot` 識別字（函式名稱保留不變，內含 `MWBot` 子字串為正常現象）；其餘第 1、104、119、129、139 行的 `MWBot` 都應已替換為 `Mwn` 或被 import 改寫覆蓋。**禁止**修改 `getMWBot` 識別字（這是 spec §3.1.1 的硬性要求：呼叫端不需改函式名稱）。

- [ ] **Step 2: 修改 src/wiki/auto/rune-redirect.ts**

將第 1 行：

```ts
import MWBot from "mwbot";
```

改為：

```ts
import type { Mwn } from "mwn";
```

把第 58 行 `export async function wikiRuneRedirectBot(bot: MWBot)` 中的 `MWBot` 改為 `Mwn`。

確認:

```bash
grep -n "MWBot" src/wiki/auto/rune-redirect.ts
```

Expected: 無輸出。

- [ ] **Step 3: 修改 src/wiki/auto/sc-redirect.ts**

將第 1 行：

```ts
import MWBot from "mwbot";
```

改為：

```ts
import type { Mwn } from "mwn";
```

把第 20 行 `export async function wikiScRedirectBot(bot: MWBot)` 中的 `MWBot` 改為 `Mwn`。

確認:

```bash
grep -n "MWBot" src/wiki/auto/sc-redirect.ts
```

Expected: 無輸出。

- [ ] **Step 4: 修改 src/wiki/auto/monster.ts**

將第 1 行：

```ts
import MWBot from "mwbot";
```

改為：

```ts
import type { Mwn } from "mwn";
```

把第 21 行 `export async function wikiMonsterBot(bot: MWBot)` 中的 `MWBot` 改為 `Mwn`。

確認:

```bash
grep -n "MWBot" src/wiki/auto/monster.ts
```

Expected: 無輸出。

- [ ] **Step 5: 修改 src/wiki/auto/update-explore-item.ts**

將第 1 行：

```ts
import MWBot from "mwbot";
```

改為：

```ts
import type { Mwn } from "mwn";
```

把第 7 行 `export async function wikiUpdateExploreItemBot(bot: MWBot)` 中的 `MWBot` 改為 `Mwn`。

確認:

```bash
grep -n "MWBot" src/wiki/auto/update-explore-item.ts
```

Expected: 無輸出。

- [ ] **Step 6: 修改 src/wiki/auto/hero.ts**

將第 1 行：

```ts
import MWBot from "mwbot";
```

改為：

```ts
import type { Mwn } from "mwn";
```

把第 9 行 `export async function wikiHeroBot(bot: MWBot)` 中的 `MWBot` 改為 `Mwn`。

確認:

```bash
grep -n "MWBot" src/wiki/auto/hero.ts
```

Expected: 無輸出。

- [ ] **Step 7: 全 repo 確認 mwbot 殘留**

Run:

```bash
grep -rn "from \"mwbot\"\|from 'mwbot'\|require(\"mwbot\")\|require('mwbot')" src/ 2>/dev/null
```

Expected: 無輸出。（注意：`src/typings/mwbot/index.d.ts` 使用 `declare module "mwbot"` 語法，不會被此 grep pattern 捕捉，無需特別排除；該檔案會在 Task 5 刪除。）

- [ ] **Step 8: 執行 type check**

Run:

```bash
npx tsc --noEmit -p tsconfig.json
```

Expected: exit code 0。若有錯誤：

- 若指向 `MWBot` 識別字未定義 → 漏改某個檔，回頭以 grep 找出再修。
- 若指向 `Mwn` 找不到 → 確認 `node_modules/mwn` 已安裝、`package.json` 中 `mwn` 在 dependencies 區塊。

- [ ] **Step 9: 執行 ESLint**

Run:

```bash
npx eslint .
```

Expected: exit code 0。

- [ ] **Step 10: 執行 build**

Run:

```bash
npm run build
```

Expected: exit code 0。

- [ ] **Step 11: 提交**

Run:

```bash
git add src/wiki.ts src/wiki/auto/rune-redirect.ts src/wiki/auto/sc-redirect.ts src/wiki/auto/monster.ts src/wiki/auto/update-explore-item.ts src/wiki/auto/hero.ts
git commit -m "refactor(wiki): switch all mwbot callers to mwn

Closes GHSA-fjxv-7rqg-78g4 (form-data via request),
GHSA-6rw7-vpxm-498p (qs via request),
GHSA-72xf-g2v4-qvf3 (tough-cookie).

Replaces deprecated mwbot+request chain with mwn (axios-based).
Public API of src/wiki-bot.ts (getMWBot, readText, exists,
editOnDifference) preserved; call sites only swap MWBot type
for Mwn type."
```

---

## Task 5: 刪除 src/typings/mwbot/index.d.ts

**Rationale:** mwn 內建型別，舊的 ambient module 宣告已無作用且會混淆 TypeScript module resolution。

**Files:**

- Delete: `src/typings/mwbot/index.d.ts`
- Possibly delete: `src/typings/mwbot/`（空目錄）

- [ ] **Step 1: 刪除 ambient 宣告檔**

Run:

```bash
rm -f src/typings/mwbot/index.d.ts
```

`-f` 用於避免檔案已不存在時失敗（例如本 Task 重跑）。

- [ ] **Step 2: 確認 mwbot 目錄已空並刪除目錄本體**

Run:

```bash
ls src/typings/mwbot/ 2>/dev/null
```

Expected: 無輸出（目錄存在但已空）。

接著刪除 mwbot 子目錄：

```bash
rmdir src/typings/mwbot 2>/dev/null || true
```

`|| true` 避免目錄已不存在時失敗。**若 `ls` 顯示有意外殘留檔案，停止本 Task 並回報**，不要強制刪除。

- [ ] **Step 3: 保留 src/typings/ 父目錄（不執行刪除）**

決策紀錄（不需執行任何指令）：

[tsconfig.json](../../../tsconfig.json) 第 20-23 行的 `typeRoots` 包含 `"./src/typings"`。雖然 TypeScript 對不存在的 typeRoot 會靜默忽略（不會報錯），本 plan 仍選擇**保留 `src/typings/` 空父目錄**，以避免日後新增 ambient 宣告時還要回頭改 tsconfig.json。

**禁止**執行 `rmdir src/typings`。

確認目前狀態（純驗證，不修改）：

```bash
ls src/typings/ 2>/dev/null
```

Expected: 無輸出（空目錄存在但內容為空）。

- [ ] **Step 4: 執行 type check**

Run:

```bash
npx tsc --noEmit -p tsconfig.json
```

Expected: exit code 0。

- [ ] **Step 5: 執行 build**

Run:

```bash
npm run build
```

Expected: exit code 0。

- [ ] **Step 6: 提交**

本 commit 僅包含一筆檔案刪除（`src/typings/mwbot/index.d.ts`）。**不使用 `git add -A`**（user 全域規則禁止）；以 `git rm` 顯式刪除：

```bash
git rm src/typings/mwbot/index.d.ts 2>/dev/null || git add src/typings/mwbot/index.d.ts
git commit -m "chore(typings): remove obsolete mwbot ambient module declaration

mwn ships built-in types; the custom declaration is no longer needed."
```

說明：若 Step 1 已實際刪除檔案，`git rm` 會失敗，後段 `|| git add` 會把刪除狀態納入 staging。

---

## Task 6: 移動 vue / vue-axios 至 devDependencies

**Rationale:** spec §3.4 — vue 在執行階段由 viewerjs 環境提供，本專案僅用作 TypeScript 型別。移到 devDependencies 後 `npm audit --omit=dev` 不會再報 vue 漏洞。

**Files:**

- Modify: `package.json`（移動兩條目，不改版本）
- 自動更新: `package-lock.json`

- [ ] **Step 1: 修改 package.json**

打開 `package.json`：

a. 在 `dependencies` 區塊，刪除這兩行：

```json
        "vue": "^2.6.12",
        "vue-axios": "^2.1.5",
```

b. 在 `devDependencies` 區塊，依字母順序插入這兩行（在 `typescript` 之後或合適位置；JSON 排序不嚴格，跟現有風格一致即可）：

```json
        "vue": "^2.6.12",
        "vue-axios": "^2.1.5",
```

注意：`@types/vue` 已在 devDependencies 中，不變。

- [ ] **Step 2: 執行 npm install**

Run:

```bash
npm install
```

Expected: 無錯誤；vue 和 vue-axios 仍會出現在 node_modules（dev dep 也會安裝），但會在 `package.json` 的 `devDependencies` 區塊。

- [ ] **Step 3: 確認 vue 已不在 production dep**

Run:

```bash
npm ls --omit=dev vue 2>&1 | head -5
```

Expected: 顯示 `(empty)` 或 vue 不在生產樹中。

```bash
npm ls vue 2>&1 | head -5
```

Expected: 仍可看到 vue@2.6.x（因為是 dev dep）。

- [ ] **Step 4: 執行 type check**

Run:

```bash
npx tsc --noEmit -p tsconfig.json
```

Expected: exit code 0。`src/viewerjs/*.ts` 對 vue 的型別 import 仍能解析（因為 dev dep 也在 `node_modules` 內，TypeScript module resolution 不區分 prod/dev）。

- [ ] **Step 5: 執行 ESLint**

Run:

```bash
npx eslint .
```

Expected: exit code 0。

- [ ] **Step 6: 執行 build**

Run:

```bash
npm run build
```

Expected: exit code 0。

- [ ] **Step 7: 執行 webpack（viewerjs 打包驗證）**

Run:

```bash
npm run webpack
```

Expected:

- exit code 0。
- `dist/viewerjs/`（或現有 webpack 輸出位置）存在打包後 JS 檔。
- **若失敗**且訊息與 `vue` 或 `vue-axios` 相關（例如 webpack 找不到 module），則需要修改 `webpack.config.js`。

  **重要事實**：[webpack.config.js](../../../webpack.config.js) 是 ESM（檔頂使用 `import` 語法、第 23 行為 `export default {`），且現有的 `externals` 是一個 **Array**（line 68-90，包含 `"config"` / `"csv-stringify"` / `"msgpack5"` / `"request"` / `"stream-to-promise"` / `"xlsx"` 等字串條目，以及兩個 object literal 條目 `{ "node-fetch": "fetch" }` 與 `{ "node:child_process": ..., ... }`）。**不能**新增一個 top-level `externals: { ... }` 物件鍵——那會與既有 array 鍵衝突，JavaScript 物件 literal 的重複鍵會讓 array 整個被覆寫，導致 viewerjs bundle 缺失多個 externals。

  正確做法：在 `webpack.config.js` 的 `export default { ... }` 物件內，於既有 `externals` **Array 的尾端**追加一個新 object literal 條目（保留 array 形式）：

  ```js
  externals: [
  		"config",
  		"csv-stringify",
  		"msgpack5",
  		"request",
  		"stream-to-promise",
  		"xlsx",
  		{
  			"node-fetch": "fetch",
  		},
  		{
  			"node:child_process": "commonjs child_process",
  			"node:fs": "commonjs fs",
  			"node:fs/promises": "commonjs fs/promises",
  			"node:module": "commonjs module",
  			"node:path": "commonjs path",
  			"node:process": "commonjs process",
  			"node:readline": "commonjs readline",
  			"node:stream": "commonjs stream",
  			"node:url": "commonjs url",
  			"node:util": "commonjs util",
  		},
  		{
  			vue: "Vue",
  			"vue-axios": "VueAxios",
  		},
  	],
  ```

  注意：（i）保留所有既有條目順序與內容；（ii）`externalsType: "window"`（line 91）已存在，新加入的 `vue: "Vue"` 會被解析為 `window.Vue`，正符合 viewerjs runtime 的 Vue 2 全域物件。（iii）webpack.config.js 使用 TAB 縮排，新增條目也必須使用 TAB。

  加完後重跑 `npm run webpack`，並把 `webpack.config.js` 一併納入提交。

- [ ] **Step 8: 提交**

若 Step 7 不需改 webpack.config.js：

```bash
git add package.json package-lock.json
git commit -m "chore(deps): move vue and vue-axios to devDependencies

Closes GHSA-5j4c-8p2g-v4jx (vue ReDoS) for production audit scope.

vue and vue-axios are only used as TypeScript types in src/viewerjs/*;
the runtime Vue object is provided by Sdorica's external viewerjs
environment, not bundled by this project. Cannot upgrade to Vue 3
because the viewerjs runtime is Vue 2."
```

若 Step 7 需要改 webpack.config.js：

```bash
git add package.json package-lock.json webpack.config.js
git commit -m "chore(deps): move vue and vue-axios to devDependencies

Closes GHSA-5j4c-8p2g-v4jx (vue ReDoS) for production audit scope.

vue/vue-axios are TypeScript-only types here; runtime Vue is supplied
by Sdorica viewerjs (Vue 2). Added webpack externals to keep them out
of the bundle."
```

---

## Task 7: 最終驗證

**Rationale:** 所有改動完成後，執行 spec §4 的驗證標準確認 audit 真的清乾淨且無回歸。

**Files:** 無修改（純執行驗證）

- [ ] **Step 1: 執行 npm audit（生產範圍）**

Run:

```bash
npm audit --omit=dev
```

Expected: `found 0 vulnerabilities`。

若仍有任何 vulnerability，**停止後續步驟**，回報具體 advisory，評估是否需要 patch override 或回頭修。

- [ ] **Step 2: 執行 npm audit（含 dev）並比對 advisory whitelist**

Run:

```bash
npm audit
```

通過標準：`npm audit` 輸出的所有 advisory 必須**完全等於**以下集合（unordered）：

- `vue` low — GHSA-5j4c-8p2g-v4jx

**任何不在此清單中的 advisory（無論等級）都視為 fail**。若 npm audit 報告了非預期的 advisory（特別是 mwn 傳遞依賴新增的），停止並在 verification-report.md 中列出實際 advisory 清單，回報後不要繼續 user review gate。

若想自動化比對，可用以下 shell helper（僅輔助；人眼比對也可）：

```bash
npm audit --json | node -e "let s=''; process.stdin.on('data',d=>s+=d); process.stdin.on('end',()=>{const j=JSON.parse(s); const allowed=new Set(['GHSA-5j4c-8p2g-v4jx']); const found=[]; for (const v of Object.values(j.vulnerabilities||{})) { for (const via of v.via) { if (typeof via==='object' && via.url) { const m=via.url.match(/(GHSA-[a-z0-9-]+)/); if (m && !allowed.has(m[1])) found.push(m[1]+' on '+v.name+' ['+via.severity+']'); } } } if (found.length){console.error('UNEXPECTED:\n'+found.join('\n')); process.exit(1);} console.log('audit advisory set OK');});"
```

Expected: 印出 `audit advisory set OK`，exit 0。

- [ ] **Step 3: 執行完整工具鏈（每段獨立記錄結果）**

依序執行並各自記錄 exit code，**不要用 `&&` 串接**（避免掩蓋失敗位置）：

```bash
npx tsc --noEmit -p tsconfig.json; echo "tsc exit=$?"
npx eslint .;                       echo "eslint exit=$?"
npm run build;                      echo "build exit=$?"
npm run webpack;                    echo "webpack exit=$?"
```

Expected: 四個 exit code 全為 0。任一段非 0：停止後續步驟，回報具體錯誤輸出，回到對應 Task 修復。

- [ ] **Step 4: 執行 dev mode dry-run（mwbot 行為驗證）**

> **此步驟僅在 Pre-flight Check 中 V4_ENABLED=true 時執行**。若 V4_ENABLED=false，跳過本 Step 並在 Step 6 verification-report.md 中註記為 SKIPPED 與原因。

Run:

```bash
npm run wiki:dev
```

Expected:

- 過程中至少出現一次 `Edit:` 或 `No modify:` 的 log（來自 [src/wiki-bot.ts](../../../src/wiki-bot.ts) 的 logger）。
- 無 `UnhandledPromiseRejection` / 無 throw error。
- 程式正常結束。

若出現 `Edit:` log，**手動到 sdorica.xyz 查看對應頁面**確認 diff 內容與本地產出一致。

注意：dev 模式仍會對線上 wiki 寫入；spec 排除 sandbox filter 於本案範圍，這是已知行為。

- [ ] **Step 5: 執行 assetbundle dry-run（fast-xml-parser 解析驗證）**

> **此步驟僅在 Pre-flight Check P2 中 V5_BASELINE_AVAILABLE=true 時執行**；否則跳過並在 verification-report.md 註記。

Run（升級後）：

```bash
npm run assetbundle:dev
```

驗證：把升級後產生的 `assets.json` 與 P2 取得的 baseline 做 diff：

```bash
# 升級後輸出路徑需依專案實際路徑調整（與 P2 找到的路徑相同）
diff /tmp/audit-baseline-assets.json <new_assets_json_path>
```

Expected:

- (a) `npm run assetbundle:dev` exit code 0。
- (b) `diff` 無輸出（檔案完全相同）。

若 diff 非空：fail-stop，回報內容差異，回到 Task 1 檢查是否確實只升 fast-xml-parser 版本。

- [ ] **Step 5.5: 兼容性檢查（spec §4.4 自動化）**

驗證 `package.json` 內的依賴變更是否完全符合 spec §4.4。Run:

```bash
node -e "
const p = require('./package.json');
const must_absent = ['request', 'mwbot', '@types/request'];
const dep_must_absent = ['vue', 'vue-axios'];
const dev_must_present = ['vue', 'vue-axios'];
const dep_must_present = { 'mwn': '^3', 'fast-xml-parser': '^5', 'http-proxy-middleware': '^3' };
const errs = [];
const allDeps = Object.assign({}, p.dependencies || {}, p.devDependencies || {});
for (const k of must_absent) {
  if (allDeps[k]) errs.push('STILL PRESENT: ' + k + '=' + allDeps[k]);
}
for (const k of dep_must_absent) {
  if (p.dependencies && p.dependencies[k]) errs.push('SHOULD BE IN devDeps: ' + k);
}
for (const k of dev_must_present) {
  if (!p.devDependencies || !p.devDependencies[k]) errs.push('MISSING in devDeps: ' + k);
}
for (const [k, prefix] of Object.entries(dep_must_present)) {
  const cur = p.dependencies && p.dependencies[k];
  if (!cur) { errs.push('MISSING in deps: ' + k); continue; }
  if (!cur.startsWith(prefix)) errs.push(k + ' version mismatch: got ' + cur + ' expect ' + prefix + '.x');
}
if (errs.length) { console.error(errs.join('\n')); process.exit(1); }
console.log('compat OK');
"
```

Expected: 印出 `compat OK`，exit 0。任一條失敗則 fail-stop，回到對應 Task 修正。

- [ ] **Step 6: 寫驗證報告檔**

將驗證結果寫入 **`docs/security/npm-audit-2026-05/verification-report.md`**（新檔案；此檔案不在 spec §6 交付物原始清單中，是本 Task 新增的記錄產物）。範本：

```markdown
# Verification Report — npm-audit-2026-05

執行時間：<YYYY-MM-DD HH:MM>
執行環境：<hostname / CI / local>
V4_ENABLED：<true|false>（來自 Pre-flight Check P1）
V5_BASELINE_AVAILABLE：<true|false>（來自 Pre-flight Check P2）

## 驗證結果

| 項目 | 結果 | 備註 |
| --- | --- | --- |
| audit --omit=dev | PASS / FAIL | 0 vulnerabilities / 列出殘留 advisory |
| audit (含 dev) advisory whitelist | PASS / FAIL | 至多 1 low (vue, GHSA-5j4c-8p2g-v4jx) |
| tsc --noEmit | PASS / FAIL | exit code |
| eslint | PASS / FAIL | exit code |
| V1 build | PASS / FAIL | exit code |
| V2 webpack | PASS / FAIL | exit code |
| V3 origin-proxy | PASS (compile-only) | |
| V4 wiki dry-run | PASS / SKIPPED / FAIL | 若 SKIPPED 註記原因 |
| V5 assetbundle diff | PASS / SKIPPED / FAIL | 若 SKIPPED 註記原因 |
| 兼容性檢查 (compat OK) | PASS / FAIL | |

## 結論

<PASS：可進入 user review gate / FAIL：列出 blocker>
```

寫檔後，subagent 在最終回報中也必須完整貼出本檔內容。**不得在 verification-report.md 中出現 `spec §X.Y` 或 `plan Task N` 字樣**——必要時用自然語言描述。

- [ ] **Step 7: 提交 verification report**

```bash
git add docs/security/npm-audit-2026-05/verification-report.md
git commit -m "docs(security): add npm audit fix verification report"
```

本 commit 為記錄性質；若 Step 4/5 過程中發現 bug 而需修正，回到對應 Task 修復後再回到 Step 1 重新驗證。

---

## Spec Coverage

對照 spec.md 的需求逐項確認：

| Spec 段落 | 需求 | 對應 Task |
| --- | --- | --- |
| §2.1 A / §3.1 | mwbot → mwn 替換、保留公開 API | Task 3 + Task 4 |
| §2.1 B | 移除 `request` direct dep | Task 3 Step 1 |
| §2.1 C / §3.2 | http-proxy-middleware → ^3.0.5 + options 改寫 | Task 2 |
| §2.1 D / §3.3 | fast-xml-parser → ^5.7.3 | Task 1 |
| §2.1 E / §3.4 | vue / vue-axios 移到 devDependencies | Task 6 |
| §2.1 F | 移除 `@types/request` | Task 3 Step 1 |
| §3.5 | 刪除 `src/typings/mwbot/index.d.ts` | Task 5 |
| §4.1 | npm audit --omit=dev = 0 | Task 7 Step 1 |
| §4.2 | tsc + eslint 全 green | 每個 Task 內均驗證；Task 7 Step 3 統合 |
| §4.3 V1 (build) | npm run build 成功 | 每個 Task 內均驗證；Task 7 Step 3 統合 |
| §4.3 V2 (webpack) | npm run webpack 成功 | Task 6 Step 7、Task 7 Step 3 |
| §4.3 V3 (origin-proxy) | compile-only | Task 2 |
| §4.3 V4 (wiki dry-run) | 行為等價 | Task 7 Step 4 |
| §4.3 V5 (assetbundle) | 結構等價 | Task 7 Step 5 |
| §4.4 | 依賴版本確認 | 每個 Task Step 3（npm ls）+ Task 7 |
| §6（交付物） | 列舉的所有檔案修改 | Task 1-6 涵蓋 |

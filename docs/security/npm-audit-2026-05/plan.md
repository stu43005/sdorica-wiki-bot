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
| [src/typings/mwbot/index.d.ts](../../../src/typings/mwbot/index.d.ts) | Delete | mwn 內建型別，自訂 ambient 宣告不再需要；若 `src/typings/mwbot/` 變空目錄則一併刪除 |

無檔案需新建。`src/assetbundle/asset-list.ts`、`src/viewerjs/*` 不需修改。

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

打開 `src/origin-proxy.ts`，在第 101-116 行找到目前的：

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

把它改為：

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

```ts
import config from "config";
import { Mwn } from "mwn";
import type { ApiEditResponse, RawRequestParams } from "mwn";
import url from "url";
import { discordWebhook } from "./discord-webhook.js";
import { Logger } from "./logger.js";
import { isDevMode } from "./utils.js";

const logger = new Logger("mwbot");

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
        const params: Record<string, unknown> = {
            action: "query",
            prop: "revisions",
            rvprop: "content",
            rvslots: "main",
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
                summary,
                Object.assign({}, customRequestOptions, {
                    bot: true,
                }),
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

要點解釋：

- `Mwn.init()` 直接帶 username/password，會 auto login 並取得 token，等價於 mwbot 的 `loginGetEditToken`。
- `defaultParams: { assert: "user" }` 確保所有 request 都驗證已登入。
- `declare module "mwn"` 將自訂 method（`readText` / `exists` / `editOnDifference`）合併到 `Mwn` 介面，讓呼叫端 `bot.readText(...)` 通過型別檢查。
- `editRes.newrevid` / `editRes.pageid` / `editRes.oldrevid`：mwn 的 `bot.save()` 已自動 unwrap MW API 的 `{ edit: {...} }` 外層（spec §3.1.5 已驗證）。
- `redirects: 1` 處理 `redirect=true` 路徑（防禦性實作）。
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

Expected after edit: 無 `MWBot` 殘留（除了註解、字串、非型別場景外，本檔中皆為型別使用）。

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

Expected: 無輸出（除了 `src/typings/mwbot/index.d.ts` 內部的 ambient 宣告，但下個 Task 會刪除整個檔案）。

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

- [ ] **Step 1: 刪除檔案**

Run:

```bash
rm src/typings/mwbot/index.d.ts
```

- [ ] **Step 2: 檢查目錄是否空，若空則刪除**

Run:

```bash
ls src/typings/mwbot/ 2>/dev/null
```

Expected: 無輸出（空目錄）。

若空，刪除目錄：

```bash
rmdir src/typings/mwbot
```

- [ ] **Step 3: 確認 src/typings 是否仍有其他內容**

Run:

```bash
ls src/typings/ 2>/dev/null
```

如果 `src/typings/` 內無其他內容，可一併刪除：

```bash
rmdir src/typings
```

注意：[tsconfig.json](../../../tsconfig.json) 中 `"typeRoots"` 包含 `"./src/typings"`，但 typeRoots 指向不存在的目錄不會造成錯誤（TypeScript 會忽略），所以即使刪掉 `src/typings/` 目錄也不需修改 tsconfig.json。為保留 future flexibility，**僅刪除 mwbot 子目錄即可，保留 `src/typings/` 即使是空的**。實際操作：執行 Step 1、Step 2，**不執行** Step 3 的 `rmdir src/typings`。

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

Run:

```bash
git add -A src/typings/
git commit -m "chore(typings): remove obsolete mwbot ambient module declaration

mwn ships built-in types; the custom declaration is no longer needed."
```

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
- **若失敗**且訊息與 `vue` 或 `vue-axios` 相關（例如 webpack 找不到 module），則需要修改 `webpack.config.js` 加入：

  ```js
  externals: {
      vue: "Vue",
      "vue-axios": "VueAxios",
  },
  ```

  位置：`webpack.config.js` 的 `module.exports = { ... }` 物件內，與 `entry` / `output` 同層。

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

- [ ] **Step 2: 執行 npm audit（含 dev）**

Run:

```bash
npm audit
```

Expected: 至多剩 `vue` 的 low 等級 advisory（GHSA-5j4c-8p2g-v4jx）。**不允許**任何 moderate 或更高的 advisory 殘留。

若出現新增的 moderate+ advisory（特別是 mwn 的傳遞依賴新增的），停止並回報。

- [ ] **Step 3: 執行完整工具鏈**

```bash
npx tsc --noEmit -p tsconfig.json && npx eslint . && npm run build && npm run webpack
```

Expected: 全 green，每段都 exit 0。

- [ ] **Step 4: 執行 dev mode dry-run（mwbot 行為驗證）**

> **此步驟需要實際 wiki 寫入權限**；若執行環境無 `config/local*.json` 或無 mwbot 帳號 credentials，可跳過此步驟，但需在交付摘要中明確標註「V4 驗證未執行，需由有 credentials 的環境補執行」。

Run:

```bash
npm run wiki:dev
```

Expected:

- 過程中至少出現一次 `Edit:` 或 `No modify:` 的 log（來自 [src/wiki-bot.ts](../../../src/wiki-bot.ts) 的 logger）。
- 無 `UnhandledPromiseRejection` / 無 throw error。
- 程式正常結束。

若出現 `Edit:` log，**手動到 sdorica.xyz 查看對應頁面**確認 diff 內容與本地產出一致。

注意：dev 模式仍會對線上 wiki 寫入。spec §1.3 明確排除「sandbox filter」於本案範圍，所以這是已知行為。

- [ ] **Step 5: 執行 assetbundle dry-run（fast-xml-parser 解析驗證）**

> 此步驟需要 `data/` 目錄已存在 asset 檔案。

預先準備：在執行升級**之前**先 stash 一份 `assets.json` 作為 baseline；或 checkout 升級前的 commit 跑一次 `npm run assetbundle:dev` 取得 baseline `assets.json`。

Run（升級後）：

```bash
npm run assetbundle:dev
```

驗證：把升級後產生的 `assets.json` 與 baseline 做 diff：

```bash
diff <baseline_path>/assets.json <new_path>/assets.json
```

Expected: 無 diff（內容完全相同）。

若 baseline 不可得（例如此環境第一次跑），**接受跳過**並在交付摘要中標註「V5 baseline 無法取得，僅以 type check + build 驗證」。

- [ ] **Step 6: 寫驗證摘要**

在交付前列出本 Task 各 Step 的實際結果（pass / skip / fail），給 user review 用。例：

```
V1 (build):       PASS
V2 (webpack):     PASS
V3 (origin-proxy): PASS (compile-only)
V4 (wiki dry-run): SKIPPED (no credentials in this env)
V5 (assetbundle): PASS
audit --omit=dev: 0 vulnerabilities
audit (with dev): 1 low (vue, expected)
```

- [ ] **Step 7: 不需要新 commit**（除非 Step 4 / 5 發現 bug 而修正）

如果一切通過，本 Task 不產生 commit。

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

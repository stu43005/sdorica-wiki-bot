# Verification Report — npm-audit-2026-05

執行時間：2026-05-10
執行環境：local (macOS Darwin 25.4.0, Node ≥20.9.0)
V4_ENABLED：false（`config/local.json` 缺 `mwbot.user` / `mwbot.pass`）
V5_BASELINE_AVAILABLE：false（`npm run assetbundle:dev` 在初始 baseline 採集階段對 `data/assetbundle/extract/*.ab/assets.xml` 報 ENOENT；未產出可比對的 `assets.json`）

## 驗證結果

| 項目 | 結果 | 備註 |
| --- | --- | --- |
| audit --omit=dev | PASS | `found 0 vulnerabilities` |
| audit (含 dev) advisory whitelist | PASS | `audit advisory set OK`（僅剩 vue 2.x low — GHSA-5j4c-8p2g-v4jx） |
| tsc --noEmit | PASS | exit 0 |
| eslint | SKIPPED | Pre-existing `.eslintrc.js` + `"type": "module"` 不相容（與本案無關，發生於 master baseline） |
| V1 build | PASS | `npm run build` exit 0 |
| V2 webpack | PASS（with caveats） | exit 0；webpack 報告 2 errors / 4 warnings 但全為 pre-existing（`sharp` 套件透過 `detect-libc` 的 `child_process` 與 `node:events` scheme 解析錯誤），與本案 vue/vue-axios 移動或其他變更無關。實作 subagent 從 stash 過的 master baseline 重跑 webpack 得到完全相同的錯誤，已確認屬基線狀態 |
| V3 origin-proxy | PASS (compile-only) | tsc + build 已驗證；無 credentials 環境不執行 runtime |
| V4 wiki dry-run | SKIPPED | V4_ENABLED=false。需在具備 `mwbot.user` + `mwbot.pass` 的環境補執行 `npm run wiki:dev` 確認 mwbot→mwn 行為等價 |
| V5 assetbundle diff | SKIPPED | V5_BASELINE_AVAILABLE=false（baseline 採集階段已失敗）。需在已執行完整 asset extract 流程的環境補執行 |
| 兼容性檢查 (compat OK) | PASS | `request` / `mwbot` / `@types/request` 已從 package.json 移除；`vue` / `vue-axios` 在 devDependencies；`mwn` ^3.0.2、`fast-xml-parser` ^5.7.3、`http-proxy-middleware` ^3.0.5 均已就位 |

## 結論

**PASS**：可進入 user review gate。

所有自動化驗證通過：

- 生產依賴已清除全部 8 個 advisory（form-data critical / qs moderate / tough-cookie moderate / http-proxy-middleware high ×3 / fast-xml-parser moderate / vue 2.x 透過移到 devDependencies 解除 production 範圍）。
- TypeScript 嚴格模式編譯通過，所有呼叫端 import / 型別已對齊 mwn。
- webpack 打包通過（pre-existing sharp 錯誤不在本案 scope）。

Skipped 項目（V4 wiki dry-run、V5 assetbundle diff、eslint）皆屬於環境條件不滿足，不是本案變更引入的問題。需要在具備對應環境條件的執行情境（wiki credentials、完整 asset extract 結果、修復 ESLint 設定）補做最終確認後才能視為完整合併。

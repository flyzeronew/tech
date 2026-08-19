# TVBS TECH

TVBS TECH 官方網站前端，使用 [Astro](https://astro.build) 打造的形象／新聞單頁式網站，內容以繁體中文（`zh-Hant`）呈現。

## 技術棧

- **框架**：Astro（SSR，`output: 'server'` + `@astrojs/node` adapter，standalone 模式）
- **套件管理**：pnpm（請勿使用 npm / yarn，避免產生多餘的 lockfile）
- **樣式**：純 CSS（非 Astro scoped `<style>`），依頁面／區塊拆分於 `src/styles/`
- **字型**：`@fontsource/noto-sans-tc`、`@fontsource/roboto`、`@fontsource/roboto-flex`
- **其他套件**：`swiper`（輪播）、`sharp`（Astro 圖片處理）
- **內容來源**：部分區塊於 request time 向後台 Strapi CMS 拉取資料

## 開發環境需求

- Node.js `>= 22.12.0`
- pnpm（建議透過 `corepack enable` 啟用）

## 快速開始

```bash
# 安裝依賴
pnpm install

# 啟動開發伺服器
pnpm dev

# 建置正式環境
pnpm build

# 預覽正式建置（Astro preview server）
pnpm preview

# 執行建置後的 SSR server（等同 Docker image 內的啟動方式）
pnpm start
```

沒有設定測試框架、linter 或 formatter。

## 環境變數

大部分首頁區塊與獨立頁面（僅 `Issue` 區塊目前仍是靜態內容）會在 server-side render 時向 Strapi 拉取資料，需要下列環境變數（放在專案根目錄的 `.env`，已被 `.gitignore` 排除，不會進版控）：

| 變數 | 說明 |
| --- | --- |
| `STRAPI_URL` | Strapi 後台的 base URL |
| `STRAPI_API_TOKEN` | 具讀取權限的 Strapi API token（以 `Bearer` header 帶入） |
| `GTM_ID` | Google Tag Manager 容器 ID，埋在 `Layout.astro`；正式站／測試站用不同容器（`GTM-PT2WZ25B` ／ `GTM-N25M9XCV`） |

若未設定或請求失敗，相關區塊會 fallback 為預設靜態內容，不會導致頁面壞掉。

## 專案結構

```
src/
├── pages/
│   ├── index.astro          # 首頁，由 src/components/index/* 區塊組成
│   ├── [category].astro     # 分類列表頁（/tech、/money，動態路由）
│   ├── [category]/[id].astro# 文章內頁（動態路由，id 為 news_article_id）
│   ├── experts.astro        # 專家列表頁
│   ├── experts/[slug].astro # 專家詳情頁（動態路由）
│   ├── api/                 # 伺服器端代理端點（分頁「更多」用，前端不能直連 Strapi）
│   └── 404.astro
├── layouts/
│   └── Layout.astro        # 共用 HTML shell（meta、GTM、JSON-LD、Header、Footer）
├── components/
│   ├── index/               # 首頁各區塊（Hero、New、Issue、Video…）
│   └── article/             # 文章頁專用元件
├── lib/                     # 跨頁／跨元件共用的 Strapi 抓取與資料轉換邏輯
├── data/                    # 跨頁共用的靜態資料（如 experts.ts）
└── styles/
    ├── global.css           # 共用版型與工具 class
    ├── components/index/    # 對應各首頁區塊的樣式
    ├── components/article/  # 對應文章頁元件的樣式
    └── pages/                # 對應各獨立頁面的樣式
```

首頁 (`index.astro`) 純粹以堆疊區塊元件組成：Hero、New、Issue、Video、Crossover、Tech、Experts、Publications、EditorPick、TechLeaders、Partners，各自對應 `Header.astro` 的錨點導覽（`#new`、`#spotlight`…）。

## 部署

專案透過多階段 `Dockerfile` 建置為 Docker image：安裝依賴 → `pnpm build` → 以 `node ./dist/server/entry.mjs` 啟動 SSR server，預設監聽 `0.0.0.0:4321`。

## 更多開發細節

給 AI 協作或深入開發前的架構慣例（Hover 規範、CMS 資料串接模式、動態路由注意事項等）請參考 [`CLAUDE.md`](./CLAUDE.md)。

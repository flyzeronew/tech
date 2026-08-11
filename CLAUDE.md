# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A one-page Astro marketing/news site for "TVBS TECH" (`src/pages/index.astro`), built from stacked section components rather than a scaffold. Default page language is `zh-Hant` (Traditional Chinese), set in `src/layouts/Layout.astro`. Package manager is **pnpm** (see `pnpm-lock.yaml`, `pnpm-workspace.yaml`); do not use npm/yarn commands or lockfiles.

## Commands

- `pnpm install` — install dependencies
- `pnpm dev` — start the Astro dev server
- `pnpm build` — build for production (outputs to `dist/`)
- `pnpm preview` — preview the production build locally

There is no test suite, linter, or formatter configured.

## Architecture

- `src/pages/index.astro` is the only route. It composes the page purely by importing and stacking section components from `src/components/index/` (Hero, New, Issue, Video, Crossover, Tech, Experts, Publications, EditorPick, TechLeaders, Partners) inside `<Layout>`.
- `src/layouts/Layout.astro` provides the HTML shell (meta tags, `<Header>`/`<Footer>`, `<slot />`) and takes `title`/`description`/`keywords`/`ogTitle`/`ogImage` props.
- Each section component in `src/components/index/*.astro` has a matching stylesheet in `src/styles/components/index/*.css`, imported directly in that component's frontmatter (e.g. `import '../../styles/components/index/hero.css';`). Styles are plain global CSS, not Astro scoped `<style>` blocks — class names must stay unique enough to not collide across sections.
- `src/styles/global.css` holds shared layout primitives and utility classes reused across sections: `.frameBox`/`.inBox` (outer/inner width containers with breakpoints at 1599/1279/1023/767/449px), `.newslist`/`.newslist.type2` (article list layouts), `.more` (CTA button), `.itemTitle`/`.animLabel` (section title + entrance animation), `.statusIcon` (hover icon overlay), and `.pc`/`.mobile` visibility toggles (breakpoint at 1023px). Reuse these instead of re-implementing equivalent styles per section.
- Section anchor IDs (e.g. `#new`, `#issue`, `#video`, `#crossover`, `#experts`, `#publications`, `#partners`) match `Header.astro`'s nav links; keep them in sync when adding/renaming sections.
- Client-side behavior (nav scroll-based light/dark theming via `data-nav="dark"|"light"` on sections, smooth-scroll-to-anchor easing, mobile burger/submenu toggles) lives in inline `<script>` blocks in `Header.astro`, written in vanilla TypeScript — no framework/store is used for interactivity.
- `public/` holds all static assets (images, SVG icons) referenced by absolute path (e.g. `/main-view-01.jpg`); there's no image import pipeline for these.
- `astro.config.mjs` — Astro config, currently empty (`defineConfig({})`).
- `tsconfig.json` — extends `astro/tsconfigs/strict`.

## Fonts

Fonts are loaded via `@fontsource` packages (`@fontsource/noto-sans-tc`, `@fontsource/roboto`, `@fontsource/roboto-flex`) and imported per-weight in `global.css`, e.g. `@import '@fontsource/noto-sans-tc/400.css';`. When adding new font weights/styles, import the specific weight file rather than the whole package.

## Other dependencies

- `swiper` is available for carousels; currently used in `EditorPick.astro`.
- `sharp` is installed for Astro's image processing but assets are currently served unprocessed from `public/`.

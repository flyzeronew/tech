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

## Hover conventions

Hover treatments follow the Figma handoff's component specs (`newsRow` and `card/latestNews` etc. in the "Handoff: TVBS TECH Website Design" file) rather than ad-hoc per-section choices. Two shared patterns are established — reuse them instead of inventing new hover language:

- **List rows** (date/time + thumbnail `.img` + `.titleBox` + arrow, e.g. `.newslist` in `global.css` used by Hero/Crossover/Tech, and `#category .list`): on hover, the thumbnail gets a `rgba(0,0,0,0.2)` overlay via `.img::after`, and `.titleBox` fades to `opacity: 0.6`. Date and arrow are untouched.
- **Image cards with a corner reveal button** (e.g. EditorPick's "影響 AI 的十件事" cards, New.astro's scrollytelling cards): on hover, the image gets the same `rgba(0,0,0,0.2)` `::after` overlay, and a 60×60 white/blue-bordered arrow button (`.cardArraw`, reusing `/arraw-right-01.svg`) slides in from just outside the corner (`right/bottom: -60px` → `0`) — the same off-canvas-slide-in mechanic as the pre-existing shared `.statusIcon` component in `global.css`, just sized/bordered differently per that Figma component.
- If a card's clickable root isn't already an `<a>` (e.g. New.astro's `.item` was a plain `<div>`), wrap the content in `<a class="cardLink">` with `display: contents` so the anchor becomes clickable/hoverable without needing to rewrite the existing child layout CSS. Any nested `<a>` tags (e.g. tag chips) must be converted to non-anchor elements first — `<a>` cannot nest inside `<a>`.
- Don't assume a hover effect belongs somewhere just because a visually similar block elsewhere has one — confirm against the actual Figma node for that component before adding it (e.g. `#video`'s scattered mosaic list intentionally keeps its own bespoke hover — image scale + title reveal — instead of the list-row pattern above, and its play-icon button was deliberately left as the pre-existing unbordered `.statusIcon`, not resized to match the card pattern).

## Fonts

Fonts are loaded via `@fontsource` packages (`@fontsource/noto-sans-tc`, `@fontsource/roboto`, `@fontsource/roboto-flex`) and imported per-weight in `global.css`, e.g. `@import '@fontsource/noto-sans-tc/400.css';`. When adding new font weights/styles, import the specific weight file rather than the whole package.

## Other dependencies

- `swiper` is available for carousels; currently used in `EditorPick.astro`.
- `sharp` is installed for Astro's image processing but assets are currently served unprocessed from `public/`.

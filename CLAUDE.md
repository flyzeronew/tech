# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A minimal Astro site (currently the default Astro scaffold, not yet customized). Package manager is **pnpm** (see `pnpm-lock.yaml`, `pnpm-workspace.yaml`); do not use npm/yarn commands or lockfiles.

## Commands

- `pnpm install` — install dependencies
- `pnpm dev` — start the Astro dev server
- `pnpm build` — build for production (outputs to `dist/`)
- `pnpm preview` — preview the production build locally

There is no test suite, linter, or formatter configured yet.

## Architecture

- `src/pages/` — file-based routing; each `.astro` file becomes a route (e.g. `src/pages/index.astro` → `/`).
- `src/styles/global.css` — global stylesheet, imported directly in page frontmatter (e.g. `import '../styles/global.css';`). Defines the `--font-sans` CSS variable used for body text.
- `public/` — static assets served as-is (e.g. `favicon.svg`).
- `astro.config.mjs` — Astro config, currently empty (`defineConfig({})`).
- `tsconfig.json` — extends `astro/tsconfigs/strict`.
- Default page language is `zh-Hant` (Traditional Chinese), set via `<html lang="zh-Hant">` in `src/pages/index.astro`.

## Fonts

Fonts are loaded via `@fontsource` packages (`@fontsource/noto-sans-tc`, `@fontsource/roboto`, `@fontsource/roboto-flex`) and imported per-weight in CSS, e.g. `@import '@fontsource/noto-sans-tc/400.css';`. When adding new font weights/styles, import the specific weight file rather than the whole package.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Tom Pham's personal portfolio styled as a Windows XP desktop: CRT boot intro, draggable/spinnable windows, scroll-driven story (About -> Projects -> Contact), taskbar navigation. Next.js 16 App Router, but built and served through **vinext + Vite + Cloudflare Workers** (not `next build`). See `IMPLEMENTATION.md` for the full interaction spec.

## Commands

```sh
npm install
npm run dev          # vinext dev on http://localhost:5173
npm run build        # vinext build -> dist/client + dist/server
npm run start        # wrangler dev serving dist/ locally (Miniflare)
npm run lint         # eslint (next core-web-vitals + typescript)
npx tsc --noEmit     # typecheck; no test runner is configured
```

Browser verification (requires dev server on :5173 and Playwright):

```sh
node scripts/verify-desktop.mjs      # interaction checks + screenshots into qa/ (gitignored)
node scripts/verify-edge-cases.mjs
```

Both scripts default to a Codex-runtime Playwright path; set `PLAYWRIGHT_MODULE=<path to playwright package>` if that path doesn't exist. `verify-edge-cases.mjs` also hardcodes a `sharp` path from the same runtime.

Node >= 22.13 required. `scripts/run-framework.mjs` picks the runner based on `.sites-runtime/execution-profile.json` (`portable` on a clean clone -> vinext CLI; `managed-linux` -> Vite + `build-verified.sh`). `.sites-runtime/`, `.openai/hosting.json` d1/r2 bindings, `build/sites-vite-plugin.ts`, `db/`, `drizzle/`, `examples/d1/`, and `app/chatgpt-auth.ts` are scaffolding from the OpenAI Sites starter; the portfolio itself does not use D1, R2, or ChatGPT auth.

## Architecture

**Single page, all client state in `app/page.tsx`.** `Home` owns every piece of desktop state: `booting`, `active` section, `open` windows, z-`order`, `focused`, `completed` (story finished), `reset` counter, projects feed. Four `DesktopWindow` instances (`photo`, `about`, `projects`, `contact`) are grouped into three sections via `groups`. Navigation funnels through `go(id, via)`; `via` matters because taskbar behaviour flips once `completed` is true (select-a-section before, toggle-independently after; mobile keeps one group open).

**Scroll = story advance, not page scroll.** `page.tsx` intercepts `wheel`, `keydown`, and touch at `window` level and calls `advance(±1)`. Elements marked `data-scrollable` scroll natively until they hit their edge, then the story advances (`canScroll`). Debounce via `scrollLock` and accumulated `wheel.total`. Changing this logic affects every window.

**`components/desktop-window.tsx`** — one window chrome: drag by title bar, double-click maximize, minimize/restore/close, corner hold-to-rotate with Motion springs, arrow keys on corners, Escape reset, 10s auto-return. The `reset` prop is a counter; incrementing it snaps all windows back to origin. Exposes `data-window`, `data-visible`, `data-task` attributes that `verify-desktop.mjs` and `desktop.css` depend on.

**`components/boot.tsx`** — photo-based CRT intro (no video yet; `assets.bootVideo` is null until supplied). `components/ambient.tsx` lazily loads `components/effects/AeroShards.jsx` (WebGPU, vendored verbatim — do not edit) and skips it when WebGPU is missing or reduced-motion is on.

**Content lives in `lib/portfolio.ts`**: `profile`, `assets`, `projects`, and the `Project` type. Edit copy/links/assets here, not in components.

**Projects are hard-coded in `lib/projects.json`** (rows show in file order), mapped to the `Project` type in `lib/portfolio.ts` with Personal Desktop appended last. There is no database, API route, or admin page; the Supabase feed was removed in Nov 2026 after the project went offline and the site silently showed one placeholder. To add a project: add a row to the JSON, put any cover image in `public/assets/` and reference it as `/assets/<file>`, then push. Projects without a cover render as a text-only card. No server routes remain, so a static export is possible.

**Styling**: `app/globals.css` (Tailwind v4 + shadcn tokens) and `app/desktop.css` (all XP desktop/window/taskbar/CRT styles, keyed off `data-section`, `data-story-complete`, `data-visible`). `components/ui/*` and `hooks/use-mobile.ts` are vendored shadcn — eslint relaxes rules for them; prefer not to modify.

## Conventions worth knowing

- `page.tsx` and `desktop-window.tsx` are written in dense single-line style; match it when editing rather than reformatting.
- Social links in `profile` are intentionally empty strings -> UI renders "Coming soon" rather than fake URLs. Keep that behaviour until real links exist.
- Pending assets (`bootVideo`, `monitorFrame`) are `null`; code already branches on them — supply a path in `lib/portfolio.ts` to activate.

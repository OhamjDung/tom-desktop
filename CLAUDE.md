# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Tom Pham's personal portfolio styled as a Windows XP desktop: CRT boot intro, draggable/spinnable windows, scroll-driven story (About -> Projects -> Contact), taskbar navigation. Next.js 16 App Router, but built and served through **vinext + Vite + Cloudflare Workers** (not `next build`). See `IMPLEMENTATION.md` for the full interaction spec and Supabase setup.

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

**Content lives in `lib/portfolio.ts`**: `profile`, `assets`, `fallbackProjects`, `Project` type, and `parseProjects`/`safeLink` (sanitize remote rows, http(s)-only URLs). Edit copy/links/assets here, not in components.

**Projects feed: `app/api/projects/route.ts`.** Returns `fallbackProjects` with `source:'local'` unless both `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` are set; then reads `status=published` rows ordered by `sort_order` via Supabase REST (5s timeout, 60s cache), falling back on any failure. Client shows "Saved collection" in the footer when `source==='fallback'`. Schema in `supabase/schema.sql`. This is the only server route — it blocks a pure static export (relevant if hosting on GitHub Pages is ever pursued).

**Styling**: `app/globals.css` (Tailwind v4 + shadcn tokens) and `app/desktop.css` (all XP desktop/window/taskbar/CRT styles, keyed off `data-section`, `data-story-complete`, `data-visible`). `components/ui/*` and `hooks/use-mobile.ts` are vendored shadcn — eslint relaxes rules for them; prefer not to modify.

## Conventions worth knowing

- `page.tsx` and `desktop-window.tsx` are written in dense single-line style; match it when editing rather than reformatting.
- Social links in `profile` are intentionally empty strings -> UI renders "Coming soon" rather than fake URLs. Keep that behaviour until real links exist.
- Pending assets (`bootVideo`, `monitorFrame`) are `null`; code already branches on them — supply a path in `lib/portfolio.ts` to activate.
- `.env` is gitignored; `.env.example` documents the Supabase vars.

## Supabase (projects feed)

- Project ref `nrgwvywbzesljpyyrnfi` ("OhamjDung's Project", org owlzfxmxnzuamdywttpr). Schema in `supabase/schema.sql` already applied; `project-images` public bucket exists.
- `SUPABASE_URL` + `SUPABASE_PUBLISHABLE_KEY` (anon key) set in local `.env` and on Vercel production. `/api/projects` returns `source:'supabase'` when live.
- Add/edit projects in the Supabase dashboard Table Editor; set `status='published'` to show. Image URLs must be absolute (`safeLink` drops relative paths): upload to `project-images` bucket, use the public URL `https://nrgwvywbzesljpyyrnfi.supabase.co/storage/v1/object/public/project-images/<file>`.

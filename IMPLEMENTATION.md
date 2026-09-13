# Tom Pham's Personal Desktop

Built from the Figma storyboard and the supplied Astra brief. The original Figma file is unchanged.

## Content and assets

- `lib/portfolio.ts`: Tom's name, UTD email, draft about copy, social URLs, asset paths, and local project collection.
- `public/assets/`: exact Figma-exported wallpaper, computer photo, and portrait. These are local files, not expiring Figma links.
- `assets.bootVideo`: set to a local MP4 URL after delivery. The current intro uses the real computer photograph, an animated loading indicator, and a zoom transition.
- `assets.monitorFrame`: set to the final transparent screen-border PNG after delivery. No monitor frame has been fabricated in CSS. Final border alignment must be checked with the actual asset.
- Social URLs are intentionally empty. The contact window says Coming soon; it does not navigate to fake profiles.
- Personal Desktop is the sole local project. Add actual projects to the fallback collection or connect Supabase.

## Interaction model

The initial desktop opens all window groups with About Me in front. Scroll down through About Me, Projects, and Contact Me; windows minimize toward the corresponding taskbar button. Inside a long window, scrolling moves the content until its edge, then advances the story. Page Up/Down and background swipe gestures provide equivalent navigation.

Before reaching Contact Me by scrolling, taskbar buttons directly select a group. Once scrolling reaches Contact Me, the taskbar opens/minimizes groups independently. Mobile keeps at most one main group visible. Title bars drag, double-click maximizes, and the standard controls minimize/restore/close. Closing is reversible through taskbar/desktop shortcuts.

Hold a corner to rotate the window. Motion's spring animation returns it on scroll, click outside, or ten seconds of inactivity. Corners also accept left/right arrow keys; Escape resets. Mobile disables corner spinning and dragging. Reduced motion skips the boot zoom, disables ambient graphics, and removes spring transitions.

Start offers navigation, an ambient toggle, desktop reset, and intro replay. No audio plays. Copy email uses the clipboard, with a selectable mailto address if permission is denied.

## Projects and images

`GET /api/projects` uses the local collection unless both `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` exist in the runtime environment. With configuration it reads published rows, ordered by `sort_order`, through the Supabase Data API. A failed or slow request uses the local fallback. A valid empty remote collection remains empty.

1. Create a Supabase project, then apply `supabase/schema.sql` once in its SQL editor.
2. Upload project covers/gallery images to the public `project-images` Storage bucket using the Supabase dashboard.
3. Store each public object URL in `cover_image_url` or `gallery_image_urls`. Public portfolio images do not need expiring signed URLs. For private images, add server-side signed URL generation at request time, never permanently store a short-lived signed URL.
4. Use compressed WebP/AVIF covers around 1200px wide, consistent 16:9 crops, and descriptive titles. Missing images receive a visible fallback.
5. Add the project URL and publishable key to `.env` locally and to the hosted site's runtime configuration. No database is provisioned or connected in this build.
6. Change `status` from `draft` to `published` to expose a project. The page fetches the collection on each load; the remote API response caches for up to 60 seconds. Changes appear after refreshing without redeployment.

The read policy only exposes published projects. The portfolio provides no visitor write policy or upload interface. Reference: [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys) and [serving Storage assets](https://supabase.com/docs/guides/storage/serving/downloads).

## Ambient graphics

`components/effects/AeroShards.jsx` and its CSS were extracted verbatim from the first full source block in the supplied attachment. `components/ambient.tsx` applies the requested parameters, lazily loads the effect, and blends it behind the desktop. It is omitted when WebGPU is unsupported, initialization fails, or reduced motion is enabled. Window rotation is a DOM interaction, so text stays selectable and controls remain real HTML elements.

## Run and verify

Use `npm run dev` for the local preview and `npm run build` for production. `npx tsc --noEmit` checks types. `scripts/verify-desktop.mjs` performs browser interaction checks and captures desktop/mobile images in the ignored `qa` directory. Set `PLAYWRIGHT_MODULE` to a Playwright package path if the bundled desktop runtime is unavailable.

Still awaiting: final boot MP4, transparent monitor-border PNG, final social links, and additional real projects. About copy follows the approved draft and remains editable.

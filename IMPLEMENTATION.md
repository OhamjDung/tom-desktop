# Tom Pham's Personal Desktop

Built from the Figma storyboard and the supplied Astra brief. The original Figma file is unchanged.

## Content and assets

- Pixel typography and desktop icon styling take inspiration from https://os.henryheffernan.com/. Local regular/bold bitmap-style fonts come from 98.css; native 16px/32px icons come from React95. Sources and licenses are in `public/assets/PIXEL-ASSETS.md`. The active wallpaper is the supplied Bliss-style sky and hill image at `public/assets/wallpaper-bliss.webp`; the previous city wallpaper is archived in `archived-assets/wallpapers/city-wallpaper.png`.
- `lib/portfolio.ts`: Tom's name, UTD email, draft about copy, social URLs, asset paths, and local project collection.
- `public/assets/`: exact Figma-exported wallpaper, computer photo, and portrait. These are local files, not expiring Figma links.
- `assets.introShort` points to the single active startup MP4, played with audio enabled. It starts on each page load. Scroll, swipe, keyboard skip, or Open desktop reveals the desktop immediately while the short video's audio continues to its end. The hidden video stays mounted only until playback completes. A failed video opens the desktop as an error fallback. Browsers that block audible autoplay display Play intro; the site never silently mutes the video.
- `assets.monitorFrame`: set to the final transparent screen-border PNG after delivery. No monitor frame has been fabricated in CSS. Final border alignment must be checked with the actual asset.
- Social URLs are intentionally empty. The contact window says Coming soon; it does not navigate to fake profiles.
- Personal Desktop is the sole local project. Add actual projects to the fallback collection or connect Supabase.

## Interaction model

The initial desktop opens all window groups with About Me in front. Scroll over the desktop background through About Me, Projects, and Contact Me; windows minimize toward the corresponding taskbar button. Scrolling inside a window only scrolls its content, and never advances the story at either edge. Window chrome, taskbar controls, and menus also do not advance the story. Page Up/Down outside windows and background swipe gestures provide equivalent navigation.

Before reaching Contact Me by scrolling, taskbar buttons directly select a group. Once scrolling reaches Contact Me, the taskbar opens/minimizes groups independently. Mobile keeps at most one main group visible. Title bars drag, double-click maximizes, and the standard controls minimize/restore/close. Closing is reversible through taskbar/desktop shortcuts.

Title-bar dragging leaves the window where it is released. Hold a corner to rotate the window. Horizontal movement changes yaw, with the opposite edge acting as the page hinge; vertical movement changes pitch. There is no Z-axis roll, so a sideways page turn cannot turn the window upside down. Releasing a corner springs from its actual released pose back to a flat orientation at its dragged position, preserving the hinge until the return completes. Scroll, click outside, or ten seconds of corner inactivity also reset the rotation without losing the dragged position. Section navigation, Reset desktop, and Escape restore the default layout. Corners accept arrow keys. Mobile disables corner spinning and dragging. Reduced motion disables ambient graphics and removes spring transitions; both supplied intro videos follow the requested playback sequence and offer a pause control.

Start offers navigation, desktop reset, and intro replay. Replaying remounts the intro and stops any previous video's audio. Copy email uses the clipboard, with a selectable mailto address if permission is denied.

## Projects and images

`GET /api/projects` uses the local collection unless both `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` exist in the runtime environment. With configuration it reads published rows, ordered by `sort_order`, through the Supabase Data API. A failed or slow request uses the local fallback. A valid empty remote collection remains empty.

1. Create a Supabase project, then apply `supabase/schema.sql` once in its SQL editor.
2. Upload project covers/gallery images to the public `project-images` Storage bucket using the Supabase dashboard.
3. Store each public object URL in `cover_image_url` or `gallery_image_urls`. Public portfolio images do not need expiring signed URLs. For private images, add server-side signed URL generation at request time, never permanently store a short-lived signed URL.
4. Use compressed WebP/AVIF covers around 1200px wide, consistent 16:9 crops, and descriptive titles. Missing images receive a visible fallback.
5. Add the project URL and publishable key to `.env` locally and to the hosted site's runtime configuration. No database is provisioned or connected in this build.
6. Change `status` from `draft` to `published` to expose a project. The page fetches the collection on each load; the remote API response caches for up to 60 seconds. Changes appear after refreshing without redeployment.

The read policy only exposes published projects. The portfolio provides no visitor write policy or upload interface. Reference: [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys) and [serving Storage assets](https://supabase.com/docs/guides/storage/serving/downloads).

## Archived graphics

The green AeroShards source, original preset, and integration styles are preserved in `archived-assets/green-shards/`. Nothing in the active site imports them, and the Start menu no longer exposes an ambient toggle. CRT scanlines, vignette, and CSS brightness/drop-shadow filters have been removed. Window rotation remains a DOM interaction, so text stays selectable and controls remain real HTML elements.

## Run and verify

Use `npm run dev` for the local preview and `npm run build` for production. `npx tsc --noEmit` checks types. `scripts/verify-desktop.mjs` performs browser interaction checks and captures desktop/mobile images in the ignored `qa` directory. Set `PLAYWRIGHT_MODULE` to a Playwright package path if the bundled desktop runtime is unavailable.

Still awaiting: transparent monitor-border PNG, final social links, and additional real projects. About copy follows the approved draft and remains editable. The supplied long intro is 22.1 seconds; the short intro is 5.8 seconds.

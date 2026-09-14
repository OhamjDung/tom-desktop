# Archived Green Shards

Disabled at Tom's request. Nothing in the running site imports this directory.

- `effects/AeroShards.jsx` and `.css`: original supplied effect, preserved unchanged.
- `ambient.tsx`: the previous green/chrome preset, WebGPU fallback, and lazy loading.
- `desktop-integration.css`: previous desktop blending and responsive settings.

To restore later, move the wrapper and effect back into the active components tree, keep its relative CSS imports together, then explicitly reconnect it in the page. The `vgpu` dependency is retained for that purpose. This archive is outside `public`, so it is not served as website assets.

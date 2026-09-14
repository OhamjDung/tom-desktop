# Tom Pham | Personal Desktop

A Figma-based Windows XP portfolio with a photographic CRT intro, draggable and spinnable windows, scroll-driven storytelling, taskbar navigation, project explorer, and email contact.

The active desktop has no visual filters or CRT overlay. The green-shard effect and its preset are preserved in `archived-assets/green-shards/`, disconnected from the running application.

```sh
npm install
npm run dev
```

Open the local address printed by the server. Build with `npm run build`.

Edit identity, asset paths, social links, and local projects in `lib/portfolio.ts`. The supplied startup videos play with sound. The first skip starts the short video; a second skip reveals the desktop while its audio finishes. Title-bar drags stay where released; corner rotations spring back from the released pose. Only background scrolling advances sections. A transparent monitor border can be connected when supplied. Supabase remains optional, with a local project fallback.

See [IMPLEMENTATION.md](./IMPLEMENTATION.md) for interaction rules, image handling, Supabase setup, and verification.

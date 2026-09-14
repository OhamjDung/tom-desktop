# Tom Pham | Personal Desktop

A Figma-based Windows XP portfolio with a photographic CRT intro, draggable and spinnable windows, scroll-driven storytelling, taskbar navigation, project explorer, and email contact.

```sh
npm install
npm run dev
```

Open the local address printed by the server. Build with `npm run build`.

Edit identity, asset paths, social links, and local projects in `lib/portfolio.ts`. The supplied startup videos play with sound. The first skip starts the short video; a second skip reveals the desktop while its audio finishes. Windows return on release, and only background scrolling advances sections. A transparent monitor border can be connected when supplied. Supabase remains optional, with a local project fallback.

See [IMPLEMENTATION.md](./IMPLEMENTATION.md) for interaction rules, image handling, Supabase setup, and verification.

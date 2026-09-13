# Tom Pham | Personal Desktop

A Figma-based Windows XP portfolio with a photographic CRT intro, draggable and spinnable windows, scroll-driven storytelling, taskbar navigation, project explorer, and email contact.

```sh
npm install
npm run dev
```

Open the local address printed by the server. Build with `npm run build`.

Edit identity, asset paths, social links, and local projects in `lib/portfolio.ts`. The photo intro works today; final boot video and transparent monitor border can be connected when supplied. Supabase remains optional, with a local project fallback.

See [IMPLEMENTATION.md](./IMPLEMENTATION.md) for interaction rules, image handling, Supabase setup, and verification.

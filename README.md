# portfolio

The backstage — a one-page portfolio of technical and artistic projects,
set in a field-notes visual language.

## Stack

- [Astro](https://astro.build) 7, fully static output
- [Tailwind CSS](https://tailwindcss.com) 4 via `@tailwindcss/vite`, mapped onto
  a hand-written design-token layer (`src/styles/tokens.css`)
- No client JavaScript except a small IntersectionObserver scrollspy;
  the bottom scroll-ruler is pure CSS (scroll-driven animations)

## Develop

```sh
npm install
export TRAILWALK_ASSET_BASE_URL=https://media.fnpg.me
npm run dev        # dev server
npm run typecheck  # astro sync && tsc --noEmit
npm run build      # static build → dist/
```

`TRAILWALK_ASSET_BASE_URL` is required, not optional. It is the public base URL
the Trailwalk gallery's posters and panoramas are served from. Building or
serving without it fails closed on purpose: the alternative is a gallery that
builds clean and ships cards that all open to a failed viewer.

Note: CSS minification is pinned to esbuild (`astro.config.mjs`) —
lightningcss folds `animation-timeline` into the `animation` shorthand,
which browsers reject.

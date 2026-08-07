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
npm run dev      # dev server
npm run build    # static build → dist/
```

Note: CSS minification is pinned to esbuild (`astro.config.mjs`) —
lightningcss folds `animation-timeline` into the `animation` shorthand,
which browsers reject.

# portfolio

The backstage — a one-page portfolio of technical and artistic projects,
set in a field-notes visual language.

## Stack

- [Astro](https://astro.build) 7, fully static output; client-side JS is
  unrestricted where it earns its keep (no zero-JS constraint)
- [Tailwind CSS](https://tailwindcss.com) 4 via `@tailwindcss/vite`, mapped onto
  a hand-written design-token layer (`src/styles/tokens.css`)
- No client JavaScript except a small IntersectionObserver scrollspy;
  the bottom scroll-ruler is pure CSS (scroll-driven animations)

## Develop

```sh
npm install
npm run dev        # dev server
npm run typecheck  # astro sync && tsc --noEmit
npm run build      # static build → dist/
```

### Branches

`dev` is the integration branch and is what the preview deploy builds from.
`main` is what production promotion builds from. Work merges to `dev`;
`main` moves only on a deliberate promotion, so merging never publishes to
production by itself.

### Deployment values

Hostnames and addresses are injected at build time and are not committed. They
are declared in one place, `src/data/site.ts`; nothing else in the tree should
name a domain.

| variable | required | absent |
| --- | --- | --- |
| `TRAILWALK_ASSET_BASE_URL` | yes | build fails |
| `PORTFOLIO_CONTACT_EMAIL` | no | contact links omitted |
| `PORTFOLIO_UPDATES_URL` | no | updates links omitted |
| `SITE_URL` | no | no canonical origin, no sitemap |

The asset base is the one that fails closed rather than degrading. Without it
the gallery would still build, and every card would open to a 404 — a failure
that only shows up in production, which is the wrong place to find it. The rest
degrade to nothing on purpose, so an uninjected build is provably domain-free.

Note: CSS minification is pinned to esbuild (`astro.config.mjs`) —
lightningcss folds `animation-timeline` into the `animation` shorthand,
which browsers reject.

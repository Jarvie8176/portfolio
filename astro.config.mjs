// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // canonical origin is injected at deploy time; the fallback keeps
  // local builds working without leaking a real domain
  site: process.env.SITE_URL ?? 'https://example.com',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
    build: {
      // lightningcss illegally folds `animation-timeline` into the `animation`
      // shorthand (browsers reject the whole declaration → ruler cursor stuck);
      // esbuild leaves the longhands alone.
      cssMinify: 'esbuild',
    },
  },
});

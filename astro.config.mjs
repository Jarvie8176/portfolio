// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const site = process.env.SITE_URL;

// https://astro.build/config
export default defineConfig({
  ...(site
    ? {
        site,
        integrations: [sitemap()],
      }
    : {
        integrations: [],
      }),
  vite: {
    plugins: [tailwindcss()],
    build: {
      // lightningcss illegally folds `animation-timeline` into the `animation`
      // shorthand, which makes browsers reject scroll-driven animation rules;
      // esbuild leaves the longhands alone.
      cssMinify: 'esbuild',
    },
  },
});

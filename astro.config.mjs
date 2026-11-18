import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { searchable } from './src/data/search.mjs';

// On GitHub Actions the address follows the account that owns the repository.
const owner = process.env.GITHUB_REPOSITORY_OWNER;

export default defineConfig({
  site: owner ? `https://${owner.toLowerCase()}.github.io` : 'http://localhost:4321',
  integrations: searchable ? [sitemap({ filter: (page) => !page.includes('/read') })] : [],
  vite: {
    build: { target: 'es2022' },
    // Prepared at startup so the paper reader works on its first visit in dev.
    optimizeDeps: { include: ['pdfjs-dist'], esbuildOptions: { target: 'es2022' } },
  },
});

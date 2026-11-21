import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { cp, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { escapeHTML } from './lib/content.js';
export default defineConfig({
  base: './',
  publicDir: false,
  plugins: [svelte(), {
    name: 'editable-static-content',
    transformIndexHtml(html, context) {
      if(context.path.includes('admin')) return html;
      const {site} = JSON.parse(readFileSync('data/content.json','utf8'));
      return html.replace(/<title>.*?<\/title>/,`<title>${escapeHTML(site.metaTitle)}</title>`)
        .replace(/(<meta name="description" content=")[^"]*/,`$1${escapeHTML(site.metaDescription)}`)
        .replace(/(<meta property="og:title" content=")[^"]*/,`$1${escapeHTML(site.metaTitle)}`)
        .replace(/(<meta property="og:description" content=")[^"]*/,`$1${escapeHTML(site.metaDescription)}`);
    },
    async closeBundle() {
      for (const name of ['assets', 'data']) await cp(name, `dist/${name}`, { recursive: true });
      await writeFile('dist/.nojekyll', '');
      await cp('dist/index.html', 'dist/404.html');
    }
  }],
  build: { rollupOptions: { input: { site: 'index.html', admin: 'admin.html' } } }
});

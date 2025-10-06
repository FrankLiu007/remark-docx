import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      'remark-docx': '../../src/index.ts'
    }
  },
  server: {
    port: 3000,
    open: true
  }
});

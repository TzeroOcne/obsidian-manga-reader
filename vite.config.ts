import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [
    svelte(),
  ],
  build: {
    emptyOutDir: false,
    outDir: '.',
    rollupOptions: {
      input: {
        main: 'src/main.ts',
      },
      output: {
        entryFileNames: "main.js",
      },
    },
  },
});

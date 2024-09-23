import { defineConfig } from 'vite';

export default defineConfig({
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

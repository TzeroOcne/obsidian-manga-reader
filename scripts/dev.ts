import { build } from 'vite';
import { fileURLToPath } from 'url';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';
import builtins from 'builtin-modules';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = path.resolve(__dirname, '..');

await build({
  configFile: false,
  root,
  plugins: [
    nodePolyfills(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(root, 'src'),
    },
  },
  build: {
    minify: false,
    lib: {
      entry: path.resolve(root, 'src/main.ts'),
      name: 'main',
      fileName: () => 'main.js',
      formats: ['cjs'],
    },
    emptyOutDir: false,
    outDir: root,
    watch: {
      include: ['src/**/*'],
    },
    rollupOptions: {
      input: {
        main: 'src/main.ts',
      },
      output: {
        entryFileNames: 'main.js',
      },
      external: [
        'obsidian',
        ...builtins,
      ],
    },
  },
});

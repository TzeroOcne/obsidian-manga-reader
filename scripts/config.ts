import path from 'path';
import { fileURLToPath } from 'url';
import { BuildOptions, InlineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import builtins from 'builtin-modules';
import { normalizePath } from 'vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = path.resolve(__dirname, '..');

export const baseConfig:InlineConfig = {
  configFile: false,
  root,
  plugins: [
    nodePolyfills(),
    viteStaticCopy({
      targets: [
        {
          src: normalizePath(path.resolve(
            root,
            'node_modules',
            'sql.js',
            'dist',
            'sql-wasm.wasm',
          )),
          dest: path.resolve(root, 'static'),
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(root, 'src'),
    },
  },
};

export const baseBuildConfig:BuildOptions = {
  sourcemap: 'inline',
  lib: {
    entry: path.resolve(root, 'src/main.ts'),
    name: 'main',
    fileName: () => 'main.js',
    formats: ['cjs'],
  },
  emptyOutDir: false,
  outDir: root,
  rollupOptions: {
    input: {
      main: 'src/main.ts',
    },
    output: {
      entryFileNames: 'main.js',
    },
    external: [
      'obsidian',
      'electron',
      ...builtins,
    ],
  },
};

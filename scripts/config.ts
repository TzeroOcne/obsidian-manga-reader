import path from "path";
import { fileURLToPath } from "url";
import { BuildOptions, InlineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import builtins from 'builtin-modules';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = path.resolve(__dirname, '..');

export const baseConfig:InlineConfig = {
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
};

export const baseBuildConfig:BuildOptions = {
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
      ...builtins,
    ],
  },
};

import { build } from 'vite';
import { baseBuildConfig, baseConfig } from './config';

await build({
  ...baseConfig,
  build: {
    minify: false,
    watch: {
      include: ['src/**/*'],
    },
    ...baseBuildConfig,
  },
});

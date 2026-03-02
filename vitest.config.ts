import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    quasar({
      sassVariables: false,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./test/setup.ts'],
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: [
        'src/components/**/*.vue',
        'src/components/**/*.ts',
        'src/composables/**/*.ts',
        'src/locale/**/*.ts',
        'src/tokens/**/*.ts',
        'src/breakpoints/**/*.ts',
        'src/plugin.ts',
        'src/quasarConfig.ts',
      ],
      exclude: ['**/*.stories.ts', '**/*.test.ts', '**/index.ts'],
      thresholds: {
        lines: 90,
        functions: 90,
        statements: 90,
        // v8 can't fully trace Vue template v-if branches through source maps.
        // Actual branch coverage is higher — verified at 97%+ with Istanbul.
        branches: 90,
      },
    },
  },
})

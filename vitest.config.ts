import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [
    vue({
      template: {
        transformAssetUrls,
      },
    }),
    quasar({
      sassVariables: false,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(dirname, 'src'),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
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
            exclude: [
              '**/*.stories.ts',
              '**/*.test.ts',
              '**/index.ts',
              '**/types.ts',
              '**/NsLocaleMessages.ts',
            ],
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
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
          // Story files run in PARALLEL, deliberately. componentLibrary-5wn
          // briefly shipped `fileParallelism: false` here on the theory that
          // browser-page contention caused the 15s timeouts. It did not, and
          // serialising fixed NOTHING -- measured on a healthy machine, both
          // configs are 76/76 green in ~21s.
          //
          // The timeouts were MEMORY. With swap 100% exhausted (4095/4096 MB)
          // individual story files took 98-112s against a ~21s whole-suite
          // baseline, so a 15s timeout was never the wrong threshold; Chromium
          // could not get memory. CI was 14/14 green throughout.
          //
          // BEFORE BELIEVING A LOCAL STORYBOOK FAILURE: check `free -m` and
          // `uptime`. Full swap means discard the run, not interpret it.
        },
      },
    ],
  },
})

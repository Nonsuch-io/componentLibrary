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
          // ONE STORY FILE AT A TIME. Not a flake workaround -- the flake WAS
          // this. Vitest sizes its worker pool from the CPU count, and every
          // worker wants its own page in a single Chromium instance. On a
          // 24-core box that is ~24 pages competing, and a story with no `play`
          // function -- a bare render of NsSpace or NsSeparator -- blows the
          // 15s timeout while WAITING FOR A SLOT rather than while rendering.
          //
          // That is why the failures always looked like nonsense: the victims
          // were the most trivial stories in the suite, and running any one of
          // them alone was instantly green, which is what let this be waved
          // through as "flaky" for weeks (componentLibrary-5wn).
          //
          // MEASURED ON ONE COMMIT, same machine, same build:
          //   parallel   17 failed / 76, all `Test timed out in 15000ms`
          //   serial      0 failed / 76, 50.43s total
          //
          // The counterintuitive proof: an IDLER machine failed MORE (9 -> 17),
          // because more free cores means a bigger pool means more contention.
          // Load average is not the variable; parallelism is.
          //
          // Serial costs nothing worth having -- 50s for the whole suite, and
          // the parallel run was SLOWER because it spent that time timing out.
          // Applies to this project only; the unit project stays parallel.
          fileParallelism: false,
        },
      },
    ],
  },
})

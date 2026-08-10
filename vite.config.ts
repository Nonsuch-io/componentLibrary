import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use '${resolve(__dirname, 'src/tokens/tokens-primitive')}' as *;`,
      },
    },
  },
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
  build: {
    lib: {
      // TWO ENTRIES ON PURPOSE. `quasar-config` is standalone (quasarConfig.ts
      // imports nothing) and must be importable WITHOUT the barrel: a consumer
      // resolving it at Nuxt config time cannot pull in `.` , because that drags
      // in Vue SFCs and throws an SSR globals error. butiq inlined a copy of the
      // palette for exactly that reason, and both Nuxt apps then drifted to
      // Tailwind defaults under a comment claiming they mirrored this file —
      // brand orange never reached them. A copy nobody can diff is the problem;
      // a subpath removes the reason to keep one.
      entry: {
        'nonsuch-components': resolve(__dirname, 'src/index.ts'),
        'quasar-config': resolve(__dirname, 'src/quasarConfig.ts'),
      },
      // PIN THE CSS FILENAME. With a SINGLE lib entry vite derives it from
      // `fileName`; the moment `entry` became an object it fell back to the
      // PACKAGE NAME and emitted `component-library.css`. Nothing errored — but
      // package.json's "./style.css" still pointed at
      // dist/nonsuch-components.css, so every consumer's style import would have
      // resolved to a file that no longer exists.
      //
      // Not `rollupOptions.output.assetFileNames`: vite emits the lib stylesheet
      // through its own path and never calls that hook — verified with a probe
      // inside it that never fired.
      //
      // Caught only because the `styles` size budget points at the same path and
      // reported "can't find files" — a budget written to measure size catching
      // a missing file. package-exports.test.ts now checks this on purpose.
      cssFileName: 'nonsuch-components',
      name: 'NonsuchComponents',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue', 'quasar', /^quasar\//, /^@quasar\//, /^@phosphor-icons\//],
    },
  },
})

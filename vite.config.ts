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
      name: 'NonsuchComponents',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue', 'quasar', /^quasar\//, /^@quasar\//, /^@phosphor-icons\//],
    },
  },
})

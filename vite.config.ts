import { defineConfig } from 'vite'
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
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'NonsuchComponents',
      fileName: 'nonsuch-components',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue', 'quasar', /^quasar\//, /^@quasar\//],
      output: {
        globals: {
          vue: 'Vue',
          quasar: 'Quasar',
        },
      },
    },
  },
})

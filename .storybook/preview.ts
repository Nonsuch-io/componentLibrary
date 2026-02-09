import type { Preview } from '@storybook/vue3-vite'
import { setup } from '@storybook/vue3-vite'
import { Quasar } from 'quasar'

// Quasar CSS
import 'quasar/src/css/index.sass'

// Register Quasar plugin for all stories
setup((app) => {
  app.use(Quasar, {
    plugins: {},
  })
})

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /date$/i,
      },
    },
  },
}

export default preview

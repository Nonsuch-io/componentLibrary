import type { Preview } from '@storybook/vue3-vite'
import { setup } from '@storybook/vue3-vite'
import { Quasar } from 'quasar'

// Quasar CSS + Material Icons
import 'quasar/src/css/index.sass'
import '@quasar/extras/material-icons/material-icons.css'

// Nonsuch fonts (Fixel) — global applies Fixel to body + headings
import '../fonts/global.css'

// Nonsuch design tokens (CSS custom properties)
import '../src/tokens/tokens.css'

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

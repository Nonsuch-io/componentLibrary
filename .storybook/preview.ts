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

// Nonsuch typography utility classes
import '../src/tokens/typography.css'

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

    a11y: {
      // FAILS CI. It ran at 'todo' — violations shown in the UI, reported to
      // nobody — while two real defects shipped that nothing else could see: the
      // collapsed NsNavSidebar with no accessible name on ANY nav link, and a
      // modal that announced as an unnamed "dialog" while trapping focus. Both
      // passed every unit test (componentLibrary-057).
      test: 'error',
      config: {
        rules: [
          {
            // THE ONLY EXCLUSION, and it is a design decision rather than code:
            // ~100 violations across the token palette, tracked as
            // componentLibrary-7jc and needing a designer. Excluding it is what
            // lets the other ~10 rules start failing CI today instead of waiting.
            // DELETE THIS when 7jc lands. Do not add rules here to make a build
            // pass — that is how this gate came to be 'todo' in the first place.
            id: 'color-contrast',
            enabled: false,
          },
        ],
      },
    },
  },
}

export default preview

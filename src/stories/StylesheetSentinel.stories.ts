import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect } from 'storybook/test'
import NsThemeProvider from '../components/NsThemeProvider/NsThemeProvider.vue'

/**
 * REAL-BROWSER PROOF that the `--ns-styles-loaded` sentinel actually
 * resolves, not merely that its source text exists somewhere.
 *
 * happy-dom (the unit-test environment) has no CSS cascade at all, so a
 * jsdom/happy-dom test that stubs `getComputedStyle` can only prove this
 * library's OWN warning logic is correct — it cannot prove the `:root` rule
 * this depends on actually reaches a page, survives minification, or wasn't
 * accidentally tree-shaken or renamed. This story runs in real Chromium via
 * @storybook/addon-vitest, so it can.
 *
 * Mounting `NsThemeProvider` (rather than any arbitrary component) is
 * deliberate: it is the one component whose SFC style block carries the
 * sentinel rule (see NsThemeProvider.vue), so this test fails for exactly
 * one reason if it fails — the rule is missing, renamed, or never reached
 * the page — and not because some unrelated component happened to also be
 * mounted in this browser session.
 *
 * componentLibrary-07u.
 */
const meta: Meta<typeof NsThemeProvider> = {
  title: 'Utilities/Stylesheet Loaded Sentinel',
  component: NsThemeProvider,
  parameters: {
    docs: {
      description: {
        component:
          "Not a visual story. Proves `--ns-styles-loaded` resolves once the library's " +
          'stylesheet is on the page — the sentinel `createNonsuch()` checks for. ' +
          'See useNsStylesheetWarning.ts.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof NsThemeProvider>

export const SentinelResolves: Story = {
  render: () => ({
    components: { NsThemeProvider },
    template: `<NsThemeProvider><p>Stylesheet sentinel check</p></NsThemeProvider>`,
  }),
  play: async () => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue('--ns-styles-loaded')
      .trim()

    expect(
      value,
      '--ns-styles-loaded did not resolve in a real browser. Either the :root rule was ' +
        'removed from NsThemeProvider.vue, renamed, or the library stylesheet never ' +
        'reached the page — any of which means createNonsuch() can no longer detect a ' +
        'missing style.css import.',
    ).toBe('1')
  },
}

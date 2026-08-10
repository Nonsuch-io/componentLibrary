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

/**
 * CALLS THE FUNCTION UNDER TEST, in a real browser, with a real cascade.
 *
 * Review found the gap this closes: the sibling story reads getComputedStyle
 * directly and never imports warnIfNsStylesheetMissing, while every "does not
 * warn" assertion elsewhere is happy-dom with a synthetic INLINE property
 * (`element.style.setProperty`). So the claim that matters most — that a correct
 * setup stays silent — was never exercised against a stylesheet-driven value.
 *
 * Crying wolf is the worse failure here. A warning that fires on correct setups
 * teaches people to ignore it, and this repo has repeatedly found that a muted
 * check is worse than none.
 *
 * WHAT THIS DOES NOT COVER, stated rather than implied: the positive direction
 * in a real browser. Removing a :root rule from a live stylesheet at runtime is
 * not something a play function can do, so "warns when genuinely missing" is
 * covered by the behavioural dist test in happy-dom instead.
 */
export const DoesNotCryWolf: Story = {
  render: () => ({ template: '<div />' }),
  play: async () => {
    const { warnIfNsStylesheetMissing, __resetNsStylesheetWarning } =
      await import('../composables/useNsStylesheetWarning')
    __resetNsStylesheetWarning?.()

    const calls: unknown[][] = []
    const original = console.warn
    console.warn = (...args: unknown[]) => {
      calls.push(args)
      original(...args)
    }
    try {
      warnIfNsStylesheetMissing()
    } finally {
      console.warn = original
    }

    const text = calls.flat().join(' ')
    if (text.includes('style.css')) {
      throw new Error(
        'warnIfNsStylesheetMissing() warned in a real browser WITH the stylesheet ' +
          `loaded — it cries wolf on a correct setup. Warning was: ${text}`,
      )
    }
  },
}

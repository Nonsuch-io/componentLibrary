import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { defineComponent, h, ref } from 'vue'

/**
 * Design Tokens — Visual reference for all Nonsuch CSS custom properties.
 *
 * Import in your app:
 * ```ts
 * import '@nonsuch/component-library/tokens.css'
 * ```
 */

/* --------------------------------------------------------
 * Token definitions (used to render the page)
 * ------------------------------------------------------ */

interface Token {
  name: string
  fallback: string
}

const colours: Token[] = [
  { name: '--ns-color-primary', fallback: '#3b82f6' },
  { name: '--ns-color-primary-hover', fallback: '#2563eb' },
  { name: '--ns-color-secondary', fallback: '#8b5cf6' },
  { name: '--ns-color-secondary-hover', fallback: '#7c3aed' },
  { name: '--ns-color-accent', fallback: '#f59e0b' },
  { name: '--ns-color-accent-hover', fallback: '#d97706' },
  { name: '--ns-color-success', fallback: '#22c55e' },
  { name: '--ns-color-warning', fallback: '#f59e0b' },
  { name: '--ns-color-error', fallback: '#ef4444' },
  { name: '--ns-color-info', fallback: '#3b82f6' },
]

const neutrals: Token[] = [
  { name: '--ns-color-neutral-50', fallback: '#f8fafc' },
  { name: '--ns-color-neutral-100', fallback: '#f1f5f9' },
  { name: '--ns-color-neutral-200', fallback: '#e2e8f0' },
  { name: '--ns-color-neutral-300', fallback: '#cbd5e1' },
  { name: '--ns-color-neutral-400', fallback: '#94a3b8' },
  { name: '--ns-color-neutral-500', fallback: '#64748b' },
  { name: '--ns-color-neutral-600', fallback: '#475569' },
  { name: '--ns-color-neutral-700', fallback: '#334155' },
  { name: '--ns-color-neutral-800', fallback: '#1e293b' },
  { name: '--ns-color-neutral-900', fallback: '#0f172a' },
]

const surfaces: Token[] = [
  { name: '--ns-color-background', fallback: '#ffffff' },
  { name: '--ns-color-surface', fallback: '#ffffff' },
  { name: '--ns-color-surface-variant', fallback: '#f8fafc' },
  { name: '--ns-color-on-primary', fallback: '#ffffff' },
  { name: '--ns-color-on-secondary', fallback: '#ffffff' },
  { name: '--ns-color-on-accent', fallback: '#000000' },
  { name: '--ns-color-on-background', fallback: '#0f172a' },
  { name: '--ns-color-on-surface', fallback: '#0f172a' },
]

const fontSizes: Token[] = [
  { name: '--ns-font-size-xs', fallback: '0.75rem' },
  { name: '--ns-font-size-sm', fallback: '0.875rem' },
  { name: '--ns-font-size-md', fallback: '1rem' },
  { name: '--ns-font-size-lg', fallback: '1.125rem' },
  { name: '--ns-font-size-xl', fallback: '1.25rem' },
  { name: '--ns-font-size-2xl', fallback: '1.5rem' },
  { name: '--ns-font-size-3xl', fallback: '1.875rem' },
]

const fontWeights: Token[] = [
  { name: '--ns-font-weight-regular', fallback: '400' },
  { name: '--ns-font-weight-medium', fallback: '500' },
  { name: '--ns-font-weight-semibold', fallback: '600' },
  { name: '--ns-font-weight-bold', fallback: '700' },
]

const spacings: Token[] = [
  { name: '--ns-space-1', fallback: '0.25rem' },
  { name: '--ns-space-2', fallback: '0.5rem' },
  { name: '--ns-space-3', fallback: '0.75rem' },
  { name: '--ns-space-4', fallback: '1rem' },
  { name: '--ns-space-5', fallback: '1.25rem' },
  { name: '--ns-space-6', fallback: '1.5rem' },
  { name: '--ns-space-8', fallback: '2rem' },
  { name: '--ns-space-10', fallback: '2.5rem' },
  { name: '--ns-space-12', fallback: '3rem' },
  { name: '--ns-space-16', fallback: '4rem' },
]

const radii: Token[] = [
  { name: '--ns-radius-none', fallback: '0' },
  { name: '--ns-radius-sm', fallback: '0.25rem' },
  { name: '--ns-radius-md', fallback: '0.5rem' },
  { name: '--ns-radius-lg', fallback: '0.75rem' },
  { name: '--ns-radius-xl', fallback: '1rem' },
  { name: '--ns-radius-full', fallback: '9999px' },
]

const shadows: Token[] = [
  { name: '--ns-shadow-sm', fallback: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
  { name: '--ns-shadow-md', fallback: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
  { name: '--ns-shadow-lg', fallback: '0 10px 15px -3px rgb(0 0 0 / 0.1)' },
  { name: '--ns-shadow-xl', fallback: '0 20px 25px -5px rgb(0 0 0 / 0.1)' },
]

const motions: Token[] = [
  { name: '--ns-duration-fast', fallback: '100ms' },
  { name: '--ns-duration-normal', fallback: '200ms' },
  { name: '--ns-duration-slow', fallback: '400ms' },
  { name: '--ns-easing-default', fallback: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  { name: '--ns-easing-in', fallback: 'cubic-bezier(0.4, 0, 1, 1)' },
  { name: '--ns-easing-out', fallback: 'cubic-bezier(0, 0, 0.2, 1)' },
  { name: '--ns-easing-in-out', fallback: 'cubic-bezier(0.4, 0, 0.2, 1)' },
]

/* --------------------------------------------------------
 * Render helpers
 * ------------------------------------------------------ */

function sectionTitle(text: string) {
  return h('h2', { style: 'margin: 2rem 0 1rem; font-family: var(--ns-font-family-display)' }, text)
}

function tokenLabel(name: string) {
  return h(
    'code',
    {
      style:
        'font-size: 0.8rem; color: var(--ns-color-neutral-600); user-select: all; display: block; margin-top: 0.25rem',
    },
    name,
  )
}

function colourSwatch(token: Token) {
  return h('div', { style: 'text-align: center; min-width: 90px' }, [
    h('div', {
      style: `width: 64px; height: 64px; border-radius: var(--ns-radius-md); background: var(${token.name}); border: 1px solid var(--ns-color-neutral-200); margin: 0 auto`,
    }),
    tokenLabel(token.name.replace('--ns-color-', '')),
  ])
}

function swatchGrid(tokens: Token[]) {
  return h(
    'div',
    { style: 'display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem' },
    tokens.map(colourSwatch),
  )
}

/* --------------------------------------------------------
 * Main component
 * ------------------------------------------------------ */

const DesignTokensPage = defineComponent({
  name: 'DesignTokensPage',
  setup() {
    const isDark = ref(false)

    function toggleDark() {
      isDark.value = !isDark.value
      document.documentElement.classList.toggle('dark', isDark.value)
      document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
    }

    return () =>
      h(
        'div',
        { style: 'max-width: 960px; padding: 1rem; font-family: var(--ns-font-family-text)' },
        [
          h(
            'h1',
            { style: 'font-family: var(--ns-font-family-display); margin-bottom: 0.5rem' },
            'Design Tokens',
          ),
          h('p', { style: 'color: var(--ns-color-neutral-500); margin-bottom: 1.5rem' }, [
            'All values are ',
            h('strong', 'placeholders'),
            ' — they will be updated when brand designs are finalised. Token ',
            h('em', 'names'),
            ' are stable.',
          ]),

          // Dark mode toggle
          h('div', { style: 'margin-bottom: 2rem' }, [
            h(
              'button',
              {
                onClick: toggleDark,
                style:
                  'padding: 0.5rem 1rem; border-radius: var(--ns-radius-md); border: 1px solid var(--ns-color-neutral-300); background: var(--ns-color-surface); color: var(--ns-color-on-surface); cursor: pointer; font-family: var(--ns-font-family-text)',
              },
              isDark.value ? '☀️  Switch to Light' : '🌙  Switch to Dark',
            ),
          ]),

          // — Colours —
          sectionTitle('Brand Colours'),
          swatchGrid(colours),

          sectionTitle('Neutral Scale'),
          swatchGrid(neutrals),

          sectionTitle('Surface & On-Colours'),
          swatchGrid(surfaces),

          // — Typography —
          sectionTitle('Typography Scale'),
          h(
            'div',
            { style: 'display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem' },
            [
              ...fontSizes.map((t) =>
                h('div', { style: 'display: flex; align-items: baseline; gap: 1rem' }, [
                  h(
                    'span',
                    { style: `font-size: var(${t.name}); font-family: var(--ns-font-family-text)` },
                    'The quick brown fox',
                  ),
                  tokenLabel(t.name.replace('--ns-', '')),
                ]),
              ),
            ],
          ),

          sectionTitle('Font Weights'),
          h(
            'div',
            { style: 'display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem' },
            [
              ...fontWeights.map((t) =>
                h('div', { style: 'display: flex; align-items: baseline; gap: 1rem' }, [
                  h(
                    'span',
                    {
                      style: `font-weight: var(${t.name}); font-size: var(--ns-font-size-lg); font-family: var(--ns-font-family-text)`,
                    },
                    `Weight ${t.fallback}`,
                  ),
                  tokenLabel(t.name.replace('--ns-', '')),
                ]),
              ),
            ],
          ),

          // — Spacing —
          sectionTitle('Spacing Scale'),
          h(
            'div',
            { style: 'display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem' },
            [
              ...spacings.map((t) =>
                h('div', { style: 'display: flex; align-items: center; gap: 1rem' }, [
                  h('div', {
                    style: `width: var(${t.name}); height: 24px; background: var(--ns-color-primary); border-radius: var(--ns-radius-sm)`,
                  }),
                  tokenLabel(`${t.name.replace('--ns-', '')} (${t.fallback})`),
                ]),
              ),
            ],
          ),

          // — Border Radius —
          sectionTitle('Border Radius'),
          h(
            'div',
            { style: 'display: flex; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 1.5rem' },
            [
              ...radii.map((t) =>
                h('div', { style: 'text-align: center' }, [
                  h('div', {
                    style: `width: 64px; height: 64px; border-radius: var(${t.name}); background: var(--ns-color-primary); margin: 0 auto`,
                  }),
                  tokenLabel(t.name.replace('--ns-', '')),
                ]),
              ),
            ],
          ),

          // — Shadows —
          sectionTitle('Shadows / Elevation'),
          h('div', { style: 'display: flex; flex-wrap: wrap; gap: 2rem; margin-bottom: 1.5rem' }, [
            ...shadows.map((t) =>
              h('div', { style: 'text-align: center' }, [
                h('div', {
                  style: `width: 96px; height: 64px; border-radius: var(--ns-radius-md); background: var(--ns-color-surface); box-shadow: var(${t.name}); margin: 0 auto`,
                }),
                tokenLabel(t.name.replace('--ns-', '')),
              ]),
            ),
          ]),

          // — Motion —
          sectionTitle('Motion / Transitions'),
          h(
            'div',
            { style: 'display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem' },
            motions.map((t) =>
              h('div', { style: 'display: flex; align-items: center; gap: 1rem' }, [
                h(
                  'code',
                  { style: 'min-width: 200px; font-size: 0.8rem' },
                  t.name.replace('--ns-', ''),
                ),
                h(
                  'code',
                  { style: 'font-size: 0.8rem; color: var(--ns-color-neutral-500)' },
                  t.fallback,
                ),
              ]),
            ),
          ),
        ],
      )
  },
})

/* --------------------------------------------------------
 * Story
 * ------------------------------------------------------ */

const meta: Meta<typeof DesignTokensPage> = {
  title: 'Design Tokens',
  component: DesignTokensPage,
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    actions: { disable: true },
  },
}

export default meta
type Story = StoryObj<typeof DesignTokensPage>

export const Overview: Story = {}

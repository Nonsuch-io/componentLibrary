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
  { name: '--ns-color-primary', fallback: '#cc3c00' },
  { name: '--ns-color-primary-hover', fallback: '#d56307' },
  { name: '--ns-color-secondary', fallback: '#93dbff' },
  { name: '--ns-color-secondary-hover', fallback: '#a8d8f0' },
  { name: '--ns-color-accent', fallback: '#93dbff' },
  { name: '--ns-color-accent-hover', fallback: '#a8d8f0' },
]

const neutrals: Token[] = [
  { name: '--ns-color-neutral-50', fallback: '#c5c5c5' },
  { name: '--ns-color-neutral-100', fallback: '#e5e7eb' },
  { name: '--ns-color-neutral-200', fallback: '#e0e0e0' },
  { name: '--ns-color-neutral-300', fallback: '#d1d5db' },
  { name: '--ns-color-neutral-400', fallback: '#9ca3af' },
  { name: '--ns-color-neutral-500', fallback: '#909090' },
  { name: '--ns-color-neutral-600', fallback: '#757575' },
  { name: '--ns-color-neutral-700', fallback: '#535353' },
  { name: '--ns-color-neutral-800', fallback: '#3c3c3c' },
  { name: '--ns-color-neutral-900', fallback: '#212121' },
]

const surfaces: Token[] = [
  { name: '--ns-color-background', fallback: '#fefbf5' },
  { name: '--ns-color-surface', fallback: '#ffffff' },
  { name: '--ns-color-surface-variant', fallback: '#fef7ee' },
  { name: '--ns-color-on-primary', fallback: '#ffffff' },
  { name: '--ns-color-on-secondary', fallback: '#ffffff' },
  { name: '--ns-color-on-accent', fallback: '#2d0b00' },
  { name: '--ns-color-on-background', fallback: '#2d0b00' },
  { name: '--ns-color-on-surface', fallback: '#2d0b00' },
]

const textColours: Token[] = [
  { name: '--ns-color-text-secondary', fallback: '#757575' },
  { name: '--ns-color-text-tertiary', fallback: '#9ca3af' },
  { name: '--ns-color-text-brand', fallback: '#d56307' },
  { name: '--ns-color-text-brand-hover', fallback: '#ef7c20' },
  { name: '--ns-color-text-disabled', fallback: '#909090' },
  { name: '--ns-color-text-link', fallback: '#64cbff' },
  { name: '--ns-color-text-link-hover', fallback: '#a8d8f0' },
]

const backgroundColours: Token[] = [
  { name: '--ns-color-bg-brand-subtle', fallback: '#fce5d2' },
  { name: '--ns-color-bg-brand-hover', fallback: '#ef7c20' },
  { name: '--ns-color-bg-header', fallback: '#fdf4e7' },
  { name: '--ns-color-bg-disabled', fallback: '#e0e0e0' },
  { name: '--ns-color-bg-menu-hover', fallback: '#f9cba6' },
  { name: '--ns-color-bg-menu-selected', fallback: '#d56307' },
]

const borderColours: Token[] = [
  { name: '--ns-color-border', fallback: '#e5e7eb' },
  { name: '--ns-color-border-subtle', fallback: '#ffffff' },
  { name: '--ns-color-border-focus', fallback: '#93dbff' },
  { name: '--ns-color-border-strong', fallback: '#93dbff' },
  { name: '--ns-color-border-disabled', fallback: '#d1d5db' },
  { name: '--ns-color-border-brand', fallback: '#d56307' },
  { name: '--ns-color-border-brand-subtle', fallback: '#fce5d2' },
  { name: '--ns-color-border-positive', fallback: '#aaae04' },
  { name: '--ns-color-border-warning', fallback: '#f1b931' },
  { name: '--ns-color-border-negative', fallback: '#cc363c' },
  { name: '--ns-color-border-info', fallback: '#0069b4' },
  { name: '--ns-color-border-accent', fallback: '#15acf8' },
]

const statusColours: Token[] = [
  { name: '--ns-color-success', fallback: '#c4c81d' },
  { name: '--ns-color-success-light', fallback: '#e7e9a5' },
  { name: '--ns-color-success-hover', fallback: '#e2e653' },
  { name: '--ns-color-success-active', fallback: '#919500' },
  { name: '--ns-color-warning', fallback: '#f1b931' },
  { name: '--ns-color-warning-light', fallback: '#fcf1d6' },
  { name: '--ns-color-warning-hover', fallback: '#f8dc98' },
  { name: '--ns-color-warning-active', fallback: '#f1b931' },
  { name: '--ns-color-error', fallback: '#a5282d' },
  { name: '--ns-color-error-light', fallback: '#fce4e5' },
  { name: '--ns-color-error-hover', fallback: '#e05359' },
  { name: '--ns-color-error-active', fallback: '#8e262a' },
  { name: '--ns-color-info', fallback: '#0069b4' },
  { name: '--ns-color-info-light', fallback: '#dceef7' },
  { name: '--ns-color-info-hover', fallback: '#15acf8' },
  { name: '--ns-color-info-active', fallback: '#004a7f' },
  { name: '--ns-color-accent-light', fallback: '#edf6fb' },
  { name: '--ns-color-accent-active', fallback: '#15acf8' },
  { name: '--ns-color-status-neutral', fallback: '#e5e7eb' },
]

const dataColours: Token[] = [
  { name: '--ns-color-data-1', fallback: '#f4adb0' },
  { name: '--ns-color-data-2', fallback: '#dcde77' },
  { name: '--ns-color-data-3', fallback: '#f9cba6' },
  { name: '--ns-color-data-4', fallback: '#a8d8f0' },
  { name: '--ns-color-data-5', fallback: '#e8a9ff' },
  { name: '--ns-color-data-6', fallback: '#cf68f4' },
  { name: '--ns-color-data-7', fallback: '#e05359' },
  { name: '--ns-color-data-8', fallback: '#ef7c20' },
  { name: '--ns-color-data-9', fallback: '#8e23b3' },
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
          h(
            'p',
            { style: 'color: var(--ns-color-neutral-500); margin-bottom: 1.5rem' },
            'All tokens sourced from the Nonsuch Figma design system.',
          ),

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

          sectionTitle('Text Colours'),
          swatchGrid(textColours),

          sectionTitle('Background Colours'),
          swatchGrid(backgroundColours),

          sectionTitle('Border Colours'),
          swatchGrid(borderColours),

          sectionTitle('Status Colours'),
          swatchGrid(statusColours),

          sectionTitle('Data Colours'),
          swatchGrid(dataColours),

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

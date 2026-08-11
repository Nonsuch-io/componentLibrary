import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { defineComponent, h, ref } from 'vue'

/**
 * Design Tokens — Visual reference for all Nonsuch CSS custom properties.
 *
 * Import in your app:
 * ```ts
 * import '@nonsuch/component-library/tokens.css'
 * ```
 *
 * Colour tokens mirror the Figma "Semantics" variable collection 1:1.
 * Section names and order match Figma's groups.
 */

/* --------------------------------------------------------
 * Token definitions
 * ------------------------------------------------------ */

interface Token {
  name: string
  fallback: string
}

const text: Token[] = [
  { name: '--ns-color-text-primary', fallback: '#2d0b00' },
  { name: '--ns-color-text-secondary', fallback: '#757575' },
  { name: '--ns-color-text-tertiary', fallback: '#9ca3af' },
  { name: '--ns-color-text-brand', fallback: '#d56307' },
  { name: '--ns-color-text-disabled', fallback: '#909090' } /* dark mode: #60351d */,
  { name: '--ns-color-text-inverse', fallback: '#fef7ee' },
  { name: '--ns-color-text-link', fallback: '#64cbff' },
  { name: '--ns-color-text-link-hover', fallback: '#b8e4fa' },
  { name: '--ns-color-text-on-primary', fallback: '#ffffff' },
  { name: '--ns-color-text-on-secondary', fallback: '#d56307' },
  { name: '--ns-color-text-on-tertiary', fallback: '#d56307' },
  { name: '--ns-color-text-on-tertiary-hover', fallback: '#f66b00' },
  { name: '--ns-color-text-positive', fallback: '#919500' },
  { name: '--ns-color-text-on-positive', fallback: '#2d0b00' },
  { name: '--ns-color-text-warning', fallback: '#f7bc2b' },
  { name: '--ns-color-text-on-warning', fallback: '#2d0b00' },
  { name: '--ns-color-text-negative', fallback: '#c7151c' },
  { name: '--ns-color-text-on-negative', fallback: '#ffffff' },
  { name: '--ns-color-text-info', fallback: '#0069b4' },
  { name: '--ns-color-text-on-info', fallback: '#ffffff' },
  // Ink for the SUBTLE bg-* fills, as opposed to text-on-* above which is ink
  // for the SOLID status-* surfaces. Two surfaces, two families
  // (componentLibrary-2p1).
  { name: '--ns-color-text-on-bg-positive', fallback: '#2d0b00' },
  { name: '--ns-color-text-on-bg-warning', fallback: '#2d0b00' },
  { name: '--ns-color-text-on-bg-negative', fallback: '#2d0b00' },
  { name: '--ns-color-text-on-bg-info', fallback: '#2d0b00' },
  { name: '--ns-color-text-accent', fallback: '#64cbff' },
  { name: '--ns-color-text-on-accent', fallback: '#2d0b00' },
  { name: '--ns-color-text-on-dark', fallback: '#fef7ee' },
]

const background: Token[] = [
  { name: '--ns-color-bg-canvas', fallback: '#fefbf5' },
  { name: '--ns-color-bg-surface', fallback: '#ffffff' },
  { name: '--ns-color-bg-surface-alt', fallback: '#fdfdf9' },
  { name: '--ns-color-bg-subtle', fallback: '#fef7ee' },
  { name: '--ns-color-bg-app-header', fallback: '#fdf4e7' },
  { name: '--ns-color-bg-primary', fallback: '#d56307' },
  { name: '--ns-color-bg-primary-subtle', fallback: '#fce5d2' },
  { name: '--ns-color-bg-primary-hover', fallback: '#f66b00' },
  { name: '--ns-color-bg-primary-active', fallback: '#c05400' },
  { name: '--ns-color-bg-disabled', fallback: '#e0e0e0' },
  { name: '--ns-color-bg-positive', fallback: '#f3f4d2' },
  { name: '--ns-color-bg-warning', fallback: '#f9e3ad' },
  { name: '--ns-color-bg-negative', fallback: '#fedee0' },
  { name: '--ns-color-bg-info', fallback: '#e0f1fa' },
  { name: '--ns-color-bg-accent', fallback: '#b8e4fa' },
  { name: '--ns-color-bg-dark', fallback: '#2d0b00' },
  { name: '--ns-color-bg-dialog', fallback: '#fef7ee' },
  { name: '--ns-color-bg-sidebar', fallback: '#fef7ee' },
  { name: '--ns-color-bg-input', fallback: '#ffffff' },
  { name: '--ns-color-bg-menu', fallback: '#fef7ee' },
]

const border: Token[] = [
  { name: '--ns-color-border-default', fallback: '#e5e7eb' },
  { name: '--ns-color-border-subtle', fallback: '#f5f7fc' },
  { name: '--ns-color-border-focus', fallback: '#93dbff' },
  { name: '--ns-color-border-disabled', fallback: '#d1d5db' },
  { name: '--ns-color-border-primary', fallback: '#d56307' },
  { name: '--ns-color-border-primary-subtle', fallback: '#fce5d2' },
  { name: '--ns-color-border-positive', fallback: '#919500' },
  { name: '--ns-color-border-warning', fallback: '#f7bc2b' },
  { name: '--ns-color-border-negative', fallback: '#c7151c' },
  { name: '--ns-color-border-info', fallback: '#0069b4' },
  { name: '--ns-color-border-accent', fallback: '#64cbff' },
]

const status: Token[] = [
  { name: '--ns-color-primary', fallback: '#d56307' },
  { name: '--ns-color-secondary', fallback: '#fdf4e7' },
  { name: '--ns-color-dark', fallback: '#2d0b00' },
  { name: '--ns-color-positive', fallback: '#d8dc36' },
  { name: '--ns-color-positive-hover', fallback: '#e2e653' },
  { name: '--ns-color-positive-active', fallback: '#c4c81d' },
  { name: '--ns-color-warning', fallback: '#f7bc2b' },
  { name: '--ns-color-warning-hover', fallback: '#f7c857' },
  { name: '--ns-color-warning-active', fallback: '#ffb400' },
  { name: '--ns-color-negative', fallback: '#c7151c' },
  { name: '--ns-color-negative-hover', fallback: '#e2222a' },
  { name: '--ns-color-negative-active', fallback: '#c7151c' },
  { name: '--ns-color-info', fallback: '#0069b4' },
  { name: '--ns-color-info-hover', fallback: '#15acf8' },
  { name: '--ns-color-info-active', fallback: '#004a7f' },
  { name: '--ns-color-accent', fallback: '#79caf3' },
  { name: '--ns-color-accent-hover', fallback: '#b8e4fa' },
  { name: '--ns-color-accent-active', fallback: '#79caf3' },
  { name: '--ns-color-status-neutral', fallback: '#e5e7eb' },
]

const button: Token[] = [
  { name: '--ns-color-btn-primary-bg', fallback: '#d56307' },
  { name: '--ns-color-btn-primary-bg-hover', fallback: '#f66b00' },
  { name: '--ns-color-btn-primary-bg-active', fallback: '#c05400' },
  { name: '--ns-color-btn-secondary-bg', fallback: '#fdf4e7' },
  { name: '--ns-color-btn-secondary-bg-hover', fallback: '#ffffff' },
  { name: '--ns-color-btn-secondary-bg-active', fallback: '#fdf4e7' },
  { name: '--ns-color-btn-secondary-bg-border', fallback: '#d56307' },
  { name: '--ns-color-btn-tertiary-bg', fallback: 'transparent' },
  { name: '--ns-color-btn-disabled-bg', fallback: '#e0e0e0' },
  { name: '--ns-color-btn-disabled-bg-border', fallback: '#9ca3af' },
]

const data: Token[] = [
  { name: '--ns-color-data-1', fallback: '#f8e4ff' },
  { name: '--ns-color-data-2', fallback: '#f0c6ff' },
  { name: '--ns-color-data-3', fallback: '#e8a9ff' },
  { name: '--ns-color-data-4', fallback: '#db8ef7' },
  { name: '--ns-color-data-5', fallback: '#cf68f4' },
  { name: '--ns-color-data-6', fallback: '#ba22f0' },
  { name: '--ns-color-data-7', fallback: '#a11ed0' },
  { name: '--ns-color-data-8', fallback: '#8e23b3' },
  { name: '--ns-color-data-9', fallback: '#601779' },
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
  {
    name: '--ns-shadow-md',
    fallback: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  },
  {
    name: '--ns-shadow-lg',
    fallback: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
  {
    name: '--ns-shadow-xl',
    fallback: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
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
        'font-size: 0.8rem; color: var(--ns-color-text-secondary); user-select: all; display: block; margin-top: 0.25rem',
    },
    name,
  )
}

function colourSwatch(token: Token) {
  return h('div', { style: 'text-align: center; min-width: 90px' }, [
    h('div', {
      style: `width: 64px; height: 64px; border-radius: var(--ns-radius-md); background: var(${token.name}); border: 1px solid var(--ns-color-border-default); margin: 0 auto`,
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
            { style: 'color: var(--ns-color-text-tertiary); margin-bottom: 1.5rem' },
            'All colour tokens mirror the Figma "Semantics" variable collection 1:1.',
          ),

          // Dark mode toggle
          h('div', { style: 'margin-bottom: 2rem' }, [
            h(
              'button',
              {
                onClick: toggleDark,
                style:
                  'padding: 0.5rem 1rem; border-radius: var(--ns-radius-md); border: 1px solid var(--ns-color-border-default); background: var(--ns-color-bg-surface); color: var(--ns-color-text-primary); cursor: pointer; font-family: var(--ns-font-family-text)',
              },
              isDark.value ? '☀️  Switch to Light' : '🌙  Switch to Dark',
            ),
          ]),

          // — Colour tokens, grouped to match Figma —
          sectionTitle('Text'),
          swatchGrid(text),

          sectionTitle('Background'),
          swatchGrid(background),

          sectionTitle('Border'),
          swatchGrid(border),

          sectionTitle('Status'),
          swatchGrid(status),

          sectionTitle('Button'),
          swatchGrid(button),

          sectionTitle('Data Visualisation'),
          swatchGrid(data),

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
                    style: `width: var(${t.name}); height: 24px; background: var(--ns-color-bg-brand-active); border-radius: var(--ns-radius-sm)`,
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
                    style: `width: 64px; height: 64px; border-radius: var(${t.name}); background: var(--ns-color-bg-brand-active); margin: 0 auto`,
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
                  style: `width: 96px; height: 64px; border-radius: var(--ns-radius-md); background: var(--ns-color-bg-surface); box-shadow: var(${t.name}); margin: 0 auto`,
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
                  { style: 'font-size: 0.8rem; color: var(--ns-color-text-tertiary)' },
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

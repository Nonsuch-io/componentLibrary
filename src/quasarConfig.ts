/**
 * Create a Quasar framework config with Nonsuch brand colours.
 *
 * Bridges the CSS token system with Quasar's runtime brand colours
 * so that Quasar's built-in colour classes (`.bg-primary`, etc.)
 * match the Nonsuch palette.
 *
 * @example
 * ```ts
 * import { Quasar } from 'quasar'
 * import { createQuasarConfig } from '@nonsuch/component-library'
 *
 * app.use(Quasar, createQuasarConfig())
 * ```
 *
 * With overrides:
 *
 * ```ts
 * app.use(Quasar, createQuasarConfig({
 *   brand: { primary: '#custom' },
 *   plugins: { Notify: {} },
 * }))
 * ```
 */

export interface QuasarBrandColors {
  primary?: string
  secondary?: string
  accent?: string
  dark?: string
  'dark-page'?: string
  positive?: string
  negative?: string
  info?: string
  warning?: string
}

export interface QuasarConfigOverrides {
  brand?: QuasarBrandColors
  plugins?: Record<string, unknown>
  [key: string]: unknown
}

/** Nonsuch placeholder brand colours — values match tokens.css (light mode) */
const NS_BRAND: Required<QuasarBrandColors> = {
  primary: '#3b82f6', // PLACEHOLDER — matches --ns-color-primary
  secondary: '#8b5cf6', // PLACEHOLDER — matches --ns-color-secondary
  accent: '#f59e0b', // PLACEHOLDER — matches --ns-color-accent
  dark: '#1e293b', // PLACEHOLDER — matches --ns-color-neutral-800
  'dark-page': '#0f172a', // PLACEHOLDER — matches --ns-color-neutral-900
  positive: '#22c55e', // PLACEHOLDER — matches --ns-color-success
  negative: '#ef4444', // PLACEHOLDER — matches --ns-color-error
  info: '#3b82f6', // PLACEHOLDER — matches --ns-color-info
  warning: '#f59e0b', // PLACEHOLDER — matches --ns-color-warning
}

export function createQuasarConfig(overrides: QuasarConfigOverrides = {}): Record<string, unknown> {
  const { brand = {}, plugins = {}, ...rest } = overrides

  return {
    config: {
      brand: {
        ...NS_BRAND,
        ...brand,
      },
    },
    plugins,
    ...rest,
  }
}

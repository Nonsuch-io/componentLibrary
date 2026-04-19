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

/** Nonsuch brand colours — sourced from butiq Design System (Figma).
 *  Values mirror the light-mode tokens in `tokens.css`. Keep in sync.
 */
const NS_BRAND: Required<QuasarBrandColors> = {
  primary: '#cc3c00', // butiq primary-500
  secondary: '#15acf8', // butiq secondary-700
  accent: '#93dbff', // butiq secondary-500 (color-accent)
  dark: '#3c3c3c', // butiq greys/grey-800
  'dark-page': '#212121', // butiq greys/grey-900
  positive: '#c4c81d', // butiq positive-500
  negative: '#a5282d', // butiq negative-700 (color-status-negative)
  info: '#0069b4', // butiq secondary-800 (color-status-info)
  warning: '#f1b931', // butiq warning-500
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

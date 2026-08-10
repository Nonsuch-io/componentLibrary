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

/** Nonsuch brand colours — sourced from Figma "Semantics" collection.
 *  Values mirror the light-mode tokens in `tokens.css`. Keep in sync.
 *  `dark` and `dark-page` aren't represented in the Figma semantic layer,
 *  so they use the dark-mode bg-canvas / surface values directly.
 */
/**
 * The brand palette Quasar is configured with.
 *
 * Exported so a consumer that only needs the colours does not have to call the
 * factory and pick them back out — and, more importantly, so nobody keeps a
 * hand-copied duplicate. butiq had one in each Nuxt app; both had drifted to
 * Tailwind defaults under a comment claiming they mirrored this object.
 */
export const NS_BRAND: Required<QuasarBrandColors> = {
  primary: '#d56307', // color-bg-brand
  secondary: '#93dbff', // color-status-accent
  accent: '#93dbff', // color-status-accent
  dark: '#27140f', // matches dark-mode color-bg-surface
  'dark-page': '#120903', // matches dark-mode color-bg-canvas
  positive: '#d8dc36', // color-status-positive
  negative: '#c7151c', // color-status-negative
  info: '#0069b4', // color-status-info
  warning: '#f7bc2b', // color-status-warning
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

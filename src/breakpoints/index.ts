/**
 * Nonsuch Breakpoints
 *
 * Adopts Quasar's breakpoint scale as the library default.
 * Values are customizable — update `nsBreakpoints` if Nonsuch
 * needs to diverge from Quasar in the future.
 *
 * @see https://quasar.dev/style/breakpoints
 */

/** Named breakpoint sizes. */
export type NsBreakpointName = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl'

/**
 * Minimum widths (in pixels) for each breakpoint.
 *
 * | Name | Min-width | Range            |
 * |------|-----------|------------------|
 * | xs   | 0         | 0 – 599 px       |
 * | sm   | 600       | 600 – 1023 px    |
 * | md   | 1024      | 1024 – 1439 px   |
 * | lg   | 1440      | 1440 – 1919 px   |
 * | xl   | 1920      | 1920 – 2559 px   |
 * | xxl  | 2560      | 2560 – 3839 px   | (1440p)
 * | xxxl | 3840      | 3840 px +        | (4K)
 *
 * These match Quasar's defaults. To customize, spread and override:
 * ```ts
 * const custom = { ...nsBreakpoints, lg: 1280 }
 * ```
 */
export const nsBreakpoints: Record<NsBreakpointName, number> = {
  xs: 0,
  sm: 600,
  md: 1024,
  lg: 1440,
  xl: 1920,
  xxl: 2560,
  xxxl: 3840,
} as const

/** Ordered list of breakpoint names from smallest to largest. */
export const nsBreakpointNames: readonly NsBreakpointName[] = [
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  'xxl',
  'xxxl',
]

/**
 * Generate a `min-width` media query string for the given breakpoint.
 *
 * @example
 * ```ts
 * nsMediaUp('md') // → '(min-width: 1024px)'
 * ```
 */
export function nsMediaUp(name: NsBreakpointName): string {
  return `(min-width: ${nsBreakpoints[name]}px)`
}

/**
 * Generate a `max-width` media query string for the breakpoint
 * immediately *below* the given one.
 *
 * Useful for targeting everything smaller than a breakpoint.
 *
 * @example
 * ```ts
 * nsMediaDown('md') // → '(max-width: 1023px)' — everything below md
 * ```
 */
export function nsMediaDown(name: Exclude<NsBreakpointName, 'xs'>): string {
  return `(max-width: ${nsBreakpoints[name] - 1}px)`
}

/**
 * Generate a media query string matching exactly one breakpoint range.
 *
 * @example
 * ```ts
 * nsMediaOnly('md') // → '(min-width: 1024px) and (max-width: 1439px)'
 * nsMediaOnly('xl') // → '(min-width: 1920px)'
 * ```
 */
export function nsMediaOnly(name: NsBreakpointName): string {
  const idx = nsBreakpointNames.indexOf(name)
  const min = nsBreakpoints[name]
  const next = nsBreakpointNames[idx + 1]
  if (!next) {
    return `(min-width: ${min}px)`
  }
  const max = nsBreakpoints[next] - 1
  return `(min-width: ${min}px) and (max-width: ${max}px)`
}

/**
 * Generate a media query for a range between two breakpoints (inclusive).
 *
 * @example
 * ```ts
 * nsMediaBetween('sm', 'lg') // → '(min-width: 600px) and (max-width: 1919px)'
 * ```
 */
export function nsMediaBetween(from: NsBreakpointName, to: NsBreakpointName): string {
  const toIdx = nsBreakpointNames.indexOf(to)
  const next = nsBreakpointNames[toIdx + 1]
  const min = nsBreakpoints[from]
  if (!next) {
    return `(min-width: ${min}px)`
  }
  const max = nsBreakpoints[next] - 1
  return `(min-width: ${min}px) and (max-width: ${max}px)`
}

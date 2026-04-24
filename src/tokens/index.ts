/**
 * Nonsuch Design Tokens
 *
 * Re-exports the token stylesheet and provides TypeScript
 * helpers for type-safe token access in JavaScript.
 */

/** All available Nonsuch token names. */
export type NsToken =
  // Brand colours
  | '--ns-color-primary'
  | '--ns-color-primary-hover'
  | '--ns-color-secondary'
  | '--ns-color-secondary-hover'
  | '--ns-color-accent'
  | '--ns-color-accent-hover'
  // Semantic colours
  | '--ns-color-success'
  | '--ns-color-warning'
  | '--ns-color-error'
  | '--ns-color-info'
  // Surface / background
  | '--ns-color-background'
  | '--ns-color-surface'
  | '--ns-color-surface-variant'
  // On-colours
  | '--ns-color-on-primary'
  | '--ns-color-on-secondary'
  | '--ns-color-on-accent'
  | '--ns-color-on-background'
  | '--ns-color-on-surface'
  // Neutral scale
  | '--ns-color-neutral-50'
  | '--ns-color-neutral-100'
  | '--ns-color-neutral-200'
  | '--ns-color-neutral-300'
  | '--ns-color-neutral-400'
  | '--ns-color-neutral-500'
  | '--ns-color-neutral-600'
  | '--ns-color-neutral-700'
  | '--ns-color-neutral-800'
  | '--ns-color-neutral-900'
  // Text colours
  | '--ns-color-text-secondary'
  | '--ns-color-text-tertiary'
  | '--ns-color-text-brand'
  | '--ns-color-text-brand-hover'
  | '--ns-color-text-disabled'
  | '--ns-color-text-link'
  | '--ns-color-text-link-hover'
  // Extended background colours
  | '--ns-color-bg-brand-subtle'
  | '--ns-color-bg-brand-hover'
  | '--ns-color-bg-header'
  | '--ns-color-bg-disabled'
  | '--ns-color-bg-menu-hover'
  | '--ns-color-bg-menu-selected'
  // Border colours
  | '--ns-color-border'
  | '--ns-color-border-subtle'
  | '--ns-color-border-focus'
  | '--ns-color-border-strong'
  | '--ns-color-border-disabled'
  | '--ns-color-border-brand'
  | '--ns-color-border-brand-subtle'
  | '--ns-color-border-positive'
  | '--ns-color-border-warning'
  | '--ns-color-border-negative'
  | '--ns-color-border-info'
  | '--ns-color-border-accent'
  // Extended status colours
  | '--ns-color-success-light'
  | '--ns-color-success-hover'
  | '--ns-color-success-active'
  | '--ns-color-warning-light'
  | '--ns-color-warning-hover'
  | '--ns-color-warning-active'
  | '--ns-color-error-light'
  | '--ns-color-error-hover'
  | '--ns-color-error-active'
  | '--ns-color-info-light'
  | '--ns-color-info-hover'
  | '--ns-color-info-active'
  | '--ns-color-accent-light'
  | '--ns-color-accent-active'
  | '--ns-color-status-neutral'
  // Data visualisation colours
  | '--ns-color-data-1'
  | '--ns-color-data-2'
  | '--ns-color-data-3'
  | '--ns-color-data-4'
  | '--ns-color-data-5'
  | '--ns-color-data-6'
  | '--ns-color-data-7'
  | '--ns-color-data-8'
  | '--ns-color-data-9'
  // Typography
  | '--ns-font-family-text'
  | '--ns-font-family-display'
  | '--ns-font-size-xs'
  | '--ns-font-size-sm'
  | '--ns-font-size-md'
  | '--ns-font-size-lg'
  | '--ns-font-size-xl'
  | '--ns-font-size-2xl'
  | '--ns-font-size-3xl'
  | '--ns-font-weight-regular'
  | '--ns-font-weight-medium'
  | '--ns-font-weight-semibold'
  | '--ns-font-weight-bold'
  | '--ns-line-height-tight'
  | '--ns-line-height-normal'
  | '--ns-line-height-relaxed'
  | '--ns-letter-spacing-tight'
  | '--ns-letter-spacing-normal'
  | '--ns-letter-spacing-wide'
  // Spacing
  | '--ns-space-1'
  | '--ns-space-2'
  | '--ns-space-3'
  | '--ns-space-4'
  | '--ns-space-5'
  | '--ns-space-6'
  | '--ns-space-8'
  | '--ns-space-10'
  | '--ns-space-12'
  | '--ns-space-16'
  // Interaction
  | '--ns-touch-target'
  // Border radius
  | '--ns-radius-none'
  | '--ns-radius-sm'
  | '--ns-radius-md'
  | '--ns-radius-lg'
  | '--ns-radius-xl'
  | '--ns-radius-full'
  // Shadows
  | '--ns-shadow-sm'
  | '--ns-shadow-md'
  | '--ns-shadow-lg'
  | '--ns-shadow-xl'
  // Motion
  | '--ns-duration-fast'
  | '--ns-duration-normal'
  | '--ns-duration-slow'
  | '--ns-easing-default'
  | '--ns-easing-in'
  | '--ns-easing-out'
  | '--ns-easing-in-out'

/**
 * Read a design token value from the computed styles of an element.
 *
 * @example
 * ```ts
 * import { getToken } from '@nonsuch/component-library'
 *
 * const primary = getToken('--ns-color-primary')
 * // → '#3b82f6'
 * ```
 */
export function getToken(name: NsToken, el: Element = document.documentElement): string {
  return getComputedStyle(el).getPropertyValue(name).trim()
}

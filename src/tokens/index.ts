/**
 * Nonsuch Design Tokens
 *
 * Re-exports the token stylesheet and provides TypeScript
 * helpers for type-safe token access in JavaScript.
 *
 * Colour token names mirror the Figma "Semantics" variable
 * collection 1:1.
 */

/** All available Nonsuch token names. */
export type NsToken =
  // Text
  | '--ns-color-text-primary'
  | '--ns-color-text-secondary'
  | '--ns-color-text-tertiary'
  | '--ns-color-text-brand'
  | '--ns-color-text-disabled'
  | '--ns-color-text-inverse'
  | '--ns-color-text-link'
  | '--ns-color-text-link-hover'
  | '--ns-color-text-on-brand'
  | '--ns-color-text-on-primary'
  | '--ns-color-text-on-secondary'
  | '--ns-color-text-on-tertiary'
  | '--ns-color-text-on-tertiary-hover'
  | '--ns-color-text-positive'
  | '--ns-color-text-on-positive'
  | '--ns-color-text-warning'
  | '--ns-color-text-on-warning'
  | '--ns-color-text-negative'
  | '--ns-color-text-on-negative'
  | '--ns-color-text-info'
  | '--ns-color-text-on-info'
  | '--ns-color-text-accent'
  | '--ns-color-text-on-accent'
  // Background
  | '--ns-color-bg-canvas'
  | '--ns-color-bg-surface'
  | '--ns-color-bg-alt-surface'
  | '--ns-color-bg-subtle'
  | '--ns-color-bg-header'
  | '--ns-color-bg-brand'
  | '--ns-color-bg-brand-subtle'
  | '--ns-color-bg-brand-hover'
  | '--ns-color-bg-brand-active'
  | '--ns-color-bg-disabled'
  | '--ns-color-bg-positive'
  | '--ns-color-bg-warning'
  | '--ns-color-bg-negative'
  | '--ns-color-bg-info'
  | '--ns-color-bg-accent'
  // Border
  | '--ns-color-border-default'
  | '--ns-color-border-subtle'
  | '--ns-color-border-focus'
  | '--ns-color-border-disabled'
  | '--ns-color-border-brand'
  | '--ns-color-border-brand-subtle'
  | '--ns-color-border-positive'
  | '--ns-color-border-warning'
  | '--ns-color-border-negative'
  | '--ns-color-border-info'
  | '--ns-color-border-accent'
  // Status
  | '--ns-color-status-positive'
  | '--ns-color-status-positive-hover'
  | '--ns-color-status-positive-active'
  | '--ns-color-status-warning'
  | '--ns-color-status-warning-hover'
  | '--ns-color-status-warning-active'
  | '--ns-color-status-negative'
  | '--ns-color-status-negative-hover'
  | '--ns-color-status-negative-active'
  | '--ns-color-status-info'
  | '--ns-color-status-info-hover'
  | '--ns-color-status-info-active'
  | '--ns-color-status-accent'
  | '--ns-color-accent-hover'
  | '--ns-color-accent-active'
  | '--ns-color-status-neutral'
  // Button
  | '--ns-color-btn-primary-bg'
  | '--ns-color-btn-primary-bg-hover'
  | '--ns-color-btn-primary-bg-active'
  | '--ns-color-btn-secondary-bg'
  | '--ns-color-btn-secondary-bg-hover'
  | '--ns-color-btn-secondary-bg-active'
  | '--ns-color-btn-secondary-bg-border'
  | '--ns-color-btn-tertiary-bg'
  | '--ns-color-btn-disabled-bg'
  | '--ns-color-btn-disabled-bg-border'
  // Data visualisation
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
  | '--ns-space-0'
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
 * const brand = getToken('--ns-color-bg-brand')
 * // → '#d56307'
 * ```
 */
export function getToken(name: NsToken, el: Element = document.documentElement): string {
  return getComputedStyle(el).getPropertyValue(name).trim()
}

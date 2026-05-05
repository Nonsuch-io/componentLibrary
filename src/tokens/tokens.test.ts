import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const css = readFileSync(resolve(__dirname, 'tokens.css'), 'utf-8')

/**
 * Extract all `--ns-*` custom property declarations from a CSS string.
 * Returns an array of property names (e.g. '--ns-color-text-primary').
 */
function extractTokenNames(source: string): string[] {
  const matches = source.matchAll(/(--ns-[\w-]+)\s*:/g)
  return [...new Set([...matches].map((m) => m[1]))]
}

const allTokens = extractTokenNames(css)

describe('tokens.css', () => {
  it('is non-empty and contains CSS custom properties', () => {
    expect(css.length).toBeGreaterThan(0)
    expect(allTokens.length).toBeGreaterThan(0)
  })

  it('all tokens use the --ns- prefix', () => {
    for (const name of allTokens) {
      expect(name).toMatch(/^--ns-/)
    }
  })

  /* -- Colour tokens (mirrored 1:1 from Figma "Semantics") -- */

  // text
  const textTokens = [
    '--ns-color-text-primary',
    '--ns-color-text-secondary',
    '--ns-color-text-tertiary',
    '--ns-color-text-brand',
    '--ns-color-text-disabled',
    '--ns-color-text-inverse',
    '--ns-color-text-link',
    '--ns-color-text-link-hover',
    '--ns-color-text-on-brand',
    '--ns-color-text-on-primary',
    '--ns-color-text-on-secondary',
    '--ns-color-text-on-tertiary',
    '--ns-color-text-on-tertiary-hover',
    '--ns-color-text-positive',
    '--ns-color-text-on-positive',
    '--ns-color-text-warning',
    '--ns-color-text-on-warning',
    '--ns-color-text-negative',
    '--ns-color-text-on-negative',
    '--ns-color-text-info',
    '--ns-color-text-on-info',
    '--ns-color-text-accent',
    '--ns-color-text-on-accent',
  ]
  it.each(textTokens)('defines text token %s', (name) => {
    expect(allTokens).toContain(name)
  })

  // background
  const backgroundTokens = [
    '--ns-color-bg-canvas',
    '--ns-color-bg-surface',
    '--ns-color-bg-alt-surface',
    '--ns-color-bg-subtle',
    '--ns-color-bg-header',
    '--ns-color-bg-brand',
    '--ns-color-bg-brand-subtle',
    '--ns-color-bg-brand-hover',
    '--ns-color-bg-brand-active',
    '--ns-color-bg-disabled',
    '--ns-color-bg-positive',
    '--ns-color-bg-warning',
    '--ns-color-bg-negative',
    '--ns-color-bg-info',
    '--ns-color-bg-accent',
  ]
  it.each(backgroundTokens)('defines background token %s', (name) => {
    expect(allTokens).toContain(name)
  })

  // border
  const borderTokens = [
    '--ns-color-border-default',
    '--ns-color-border-subtle',
    '--ns-color-border-focus',
    '--ns-color-border-disabled',
    '--ns-color-border-brand',
    '--ns-color-border-brand-subtle',
    '--ns-color-border-positive',
    '--ns-color-border-warning',
    '--ns-color-border-negative',
    '--ns-color-border-info',
    '--ns-color-border-accent',
  ]
  it.each(borderTokens)('defines border token %s', (name) => {
    expect(allTokens).toContain(name)
  })

  // status
  const statusTokens = [
    '--ns-color-status-positive',
    '--ns-color-status-positive-hover',
    '--ns-color-status-positive-active',
    '--ns-color-status-warning',
    '--ns-color-status-warning-hover',
    '--ns-color-status-warning-active',
    '--ns-color-status-negative',
    '--ns-color-status-negative-hover',
    '--ns-color-status-negative-active',
    '--ns-color-status-info',
    '--ns-color-status-info-hover',
    '--ns-color-status-info-active',
    '--ns-color-status-accent',
    '--ns-color-accent-hover',
    '--ns-color-accent-active',
    '--ns-color-status-neutral',
  ]
  it.each(statusTokens)('defines status token %s', (name) => {
    expect(allTokens).toContain(name)
  })

  // button
  const buttonTokens = [
    '--ns-color-btn-primary-bg',
    '--ns-color-btn-primary-bg-hover',
    '--ns-color-btn-primary-bg-active',
    '--ns-color-btn-secondary-bg',
    '--ns-color-btn-secondary-bg-hover',
    '--ns-color-btn-secondary-bg-active',
    '--ns-color-btn-secondary-bg-border',
    '--ns-color-btn-tertiary-bg',
    '--ns-color-btn-disabled-bg',
    '--ns-color-btn-disabled-bg-border',
  ]
  it.each(buttonTokens)('defines button token %s', (name) => {
    expect(allTokens).toContain(name)
  })

  // data
  it('defines the full data visualisation scale (1–9)', () => {
    for (const i of ['1', '2', '3', '4', '5', '6', '7', '8', '9']) {
      expect(allTokens).toContain(`--ns-color-data-${i}`)
    }
  })

  /* -- Typography tokens -- */

  it('defines font family tokens', () => {
    expect(allTokens).toContain('--ns-font-family-text')
    expect(allTokens).toContain('--ns-font-family-display')
  })

  it('defines font size scale (xs–3xl)', () => {
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']) {
      expect(allTokens).toContain(`--ns-font-size-${size}`)
    }
  })

  it('defines font weight tokens', () => {
    for (const weight of ['regular', 'medium', 'semibold', 'bold']) {
      expect(allTokens).toContain(`--ns-font-weight-${weight}`)
    }
  })

  it('defines line height tokens', () => {
    for (const lh of ['tight', 'normal', 'relaxed']) {
      expect(allTokens).toContain(`--ns-line-height-${lh}`)
    }
  })

  it('defines letter spacing tokens', () => {
    for (const ls of ['tight', 'normal', 'wide']) {
      expect(allTokens).toContain(`--ns-letter-spacing-${ls}`)
    }
  })

  /* -- Spacing tokens -- */

  it('defines spacing scale', () => {
    for (const step of ['1', '2', '3', '4', '5', '6', '8', '10', '12', '16']) {
      expect(allTokens).toContain(`--ns-space-${step}`)
    }
  })

  /* -- Interaction tokens -- */

  it('defines touch target token', () => {
    expect(allTokens).toContain('--ns-touch-target')
  })

  /* -- Border radius tokens -- */

  it('defines border radius tokens', () => {
    for (const r of ['none', 'sm', 'md', 'lg', 'xl', 'full']) {
      expect(allTokens).toContain(`--ns-radius-${r}`)
    }
  })

  /* -- Shadow tokens -- */

  it('defines shadow tokens', () => {
    for (const s of ['sm', 'md', 'lg', 'xl']) {
      expect(allTokens).toContain(`--ns-shadow-${s}`)
    }
  })

  /* -- Motion tokens -- */

  it('defines duration tokens', () => {
    for (const d of ['fast', 'normal', 'slow']) {
      expect(allTokens).toContain(`--ns-duration-${d}`)
    }
  })

  it('defines easing tokens', () => {
    for (const e of ['default', 'in', 'out', 'in-out']) {
      expect(allTokens).toContain(`--ns-easing-${e}`)
    }
  })

  /* -- Dark mode -- */

  it('contains dark mode selectors', () => {
    expect(css).toContain(':root.dark')
    expect(css).toContain("[data-theme='dark']")
    expect(css).toContain('.q-dark')
    expect(css).toContain('prefers-color-scheme: dark')
  })

  it('overrides colour tokens in dark mode', () => {
    // The dark block should redefine at least the canvas + brand colours
    const darkBlock = css.slice(css.indexOf(':root.dark'))
    const darkTokens = extractTokenNames(darkBlock)
    expect(darkTokens).toContain('--ns-color-bg-canvas')
    expect(darkTokens).toContain('--ns-color-bg-surface')
    expect(darkTokens).toContain('--ns-color-text-primary')
    expect(darkTokens).toContain('--ns-color-bg-brand')
  })
})

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const css = readFileSync(resolve(__dirname, 'tokens.css'), 'utf-8')

/**
 * Extract all `--ns-*` custom property declarations from a CSS string.
 * Returns an array of property names (e.g. '--ns-color-primary').
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

  /* -- Colour tokens -- */

  const expectedColours = [
    '--ns-color-primary',
    '--ns-color-primary-hover',
    '--ns-color-secondary',
    '--ns-color-secondary-hover',
    '--ns-color-accent',
    '--ns-color-accent-hover',
    '--ns-color-success',
    '--ns-color-warning',
    '--ns-color-error',
    '--ns-color-info',
    '--ns-color-background',
    '--ns-color-surface',
    '--ns-color-surface-variant',
    '--ns-color-on-primary',
    '--ns-color-on-secondary',
    '--ns-color-on-accent',
    '--ns-color-on-background',
    '--ns-color-on-surface',
  ]

  it.each(expectedColours)('defines colour token %s', (name) => {
    expect(allTokens).toContain(name)
  })

  it('defines the full neutral scale (50–900)', () => {
    const neutralSteps = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900']
    for (const step of neutralSteps) {
      expect(allTokens).toContain(`--ns-color-neutral-${step}`)
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
    // The dark block should redefine at least the brand colours
    const darkBlock = css.slice(css.indexOf(':root.dark'))
    const darkTokens = extractTokenNames(darkBlock)
    expect(darkTokens).toContain('--ns-color-primary')
    expect(darkTokens).toContain('--ns-color-background')
    expect(darkTokens).toContain('--ns-color-surface')
    expect(darkTokens).toContain('--ns-color-on-surface')
  })
})

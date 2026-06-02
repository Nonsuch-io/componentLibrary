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

/**
 * Extract tokens defined in just the light-mode :root block (everything
 * before the first dark-mode selector).
 */
function extractLightTokenNames(source: string): string[] {
  const end = source.indexOf(':root.dark')
  return extractTokenNames(end > -1 ? source.slice(0, end) : source)
}

/**
 * Extract tokens defined in the first dark-mode block (:root.dark … }).
 */
function extractDarkTokenNames(source: string): string[] {
  const start = source.indexOf(':root.dark')
  if (start === -1) return []
  // Find the closing brace of this block
  const end = source.indexOf('\n}\n', start)
  return extractTokenNames(source.slice(start, end > -1 ? end : undefined))
}

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
    '--ns-color-text-on-dark',
  ]
  it.each(textTokens)('defines text token %s', (name) => {
    expect(allTokens).toContain(name)
  })

  // background — Figma canonical names
  const backgroundTokens = [
    '--ns-color-bg-canvas',
    '--ns-color-bg-surface',
    '--ns-color-bg-surface-alt',
    '--ns-color-bg-subtle',
    '--ns-color-bg-app-header',
    '--ns-color-bg-primary',
    '--ns-color-bg-primary-subtle',
    '--ns-color-bg-primary-hover',
    '--ns-color-bg-primary-active',
    '--ns-color-bg-disabled',
    '--ns-color-bg-positive',
    '--ns-color-bg-warning',
    '--ns-color-bg-negative',
    '--ns-color-bg-info',
    '--ns-color-bg-accent',
    '--ns-color-bg-dark',
    '--ns-color-bg-dialog',
    '--ns-color-bg-sidebar',
    '--ns-color-bg-input',
    '--ns-color-bg-menu',
  ]
  it.each(backgroundTokens)('defines background token %s', (name) => {
    expect(allTokens).toContain(name)
  })

  // background — legacy aliases still present for backwards compat
  const backgroundAliases = [
    '--ns-color-bg-brand',
    '--ns-color-bg-brand-subtle',
    '--ns-color-bg-brand-hover',
    '--ns-color-bg-brand-active',
    '--ns-color-bg-alt-surface',
    '--ns-color-bg-header',
  ]
  it.each(backgroundAliases)('retains legacy background alias %s', (name) => {
    expect(allTokens).toContain(name)
  })

  // border — Figma canonical names
  const borderTokens = [
    '--ns-color-border-default',
    '--ns-color-border-subtle',
    '--ns-color-border-focus',
    '--ns-color-border-disabled',
    '--ns-color-border-primary',
    '--ns-color-border-primary-subtle',
    '--ns-color-border-positive',
    '--ns-color-border-warning',
    '--ns-color-border-negative',
    '--ns-color-border-info',
    '--ns-color-border-accent',
  ]
  it.each(borderTokens)('defines border token %s', (name) => {
    expect(allTokens).toContain(name)
  })

  // core semantic / interactive (Quasar-aligned, formerly status-*)
  const semanticTokens = [
    '--ns-color-primary',
    '--ns-color-secondary',
    '--ns-color-dark',
    '--ns-color-positive',
    '--ns-color-positive-hover',
    '--ns-color-positive-active',
    '--ns-color-warning',
    '--ns-color-warning-hover',
    '--ns-color-warning-active',
    '--ns-color-negative',
    '--ns-color-negative-hover',
    '--ns-color-negative-active',
    '--ns-color-info',
    '--ns-color-info-hover',
    '--ns-color-info-active',
    '--ns-color-accent',
    '--ns-color-accent-hover',
    '--ns-color-accent-active',
    '--ns-color-status-neutral',
  ]
  it.each(semanticTokens)('defines semantic token %s', (name) => {
    expect(allTokens).toContain(name)
  })

  // status-* aliases still present for backwards compat
  const statusAliases = [
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
    '--ns-color-status-accent-hover',
    '--ns-color-status-accent-active',
  ]
  it.each(statusAliases)('retains legacy status alias %s', (name) => {
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

  it('every light-mode colour token has a dark-mode counterpart', () => {
    const lightColorTokens = extractLightTokenNames(css).filter((t) => t.startsWith('--ns-color-'))
    const darkColorTokens = extractDarkTokenNames(css)

    for (const token of lightColorTokens) {
      expect(darkColorTokens, `dark mode is missing an override for ${token}`).toContain(token)
    }
  })

  /**
   * Extract token → value declarations from a CSS block.
   * Values are trimmed; trailing comments and whitespace are stripped.
   */
  function extractTokenDeclarations(source: string): Map<string, string> {
    const map = new Map<string, string>()
    const matches = source.matchAll(/(--ns-[\w-]+)\s*:\s*([^;]+);/g)
    for (const m of matches) {
      map.set(m[1], m[2].replace(/\s*\/\*.*$/, '').trim())
    }
    return map
  }

  /** The `@media (prefers-color-scheme: dark)` block — body only. */
  function extractMediaDarkBlock(source: string): string {
    const start = source.indexOf('@media (prefers-color-scheme: dark)')
    if (start === -1) return ''
    // Walk braces to find the matching closing }
    let depth = 0
    let i = start
    while (i < source.length) {
      const ch = source[i]
      if (ch === '{') depth++
      else if (ch === '}') {
        depth--
        if (depth === 0) return source.slice(start, i + 1)
      }
      i++
    }
    return source.slice(start)
  }

  /** The `:root.dark, [data-theme='dark'], .q-dark` block — body only. */
  function extractRootDarkBlock(source: string): string {
    const start = source.indexOf(':root.dark')
    if (start === -1) return ''
    const end = source.indexOf('\n}\n', start)
    return source.slice(start, end > -1 ? end : undefined)
  }

  it('every light-mode colour token also has a prefers-color-scheme: dark override', () => {
    const lightColorTokens = extractLightTokenNames(css).filter((t) => t.startsWith('--ns-color-'))
    const mediaDarkBlock = extractMediaDarkBlock(css)
    const mediaTokens = extractTokenNames(mediaDarkBlock)

    for (const token of lightColorTokens) {
      expect(
        mediaTokens,
        `@media (prefers-color-scheme: dark) is missing an override for ${token}`,
      ).toContain(token)
    }
  })

  it(':root.dark and @media (prefers-color-scheme: dark) define identical values', () => {
    const rootDarkDecls = extractTokenDeclarations(extractRootDarkBlock(css))
    const mediaDarkDecls = extractTokenDeclarations(extractMediaDarkBlock(css))

    // Catches the kind of drift where someone updates one dark block but not
    // the other (e.g. --ns-color-text-disabled has #60351d in :root.dark but
    // #d1d5db in the @media block). The two MUST stay in sync.
    for (const [token, rootValue] of rootDarkDecls) {
      const mediaValue = mediaDarkDecls.get(token)
      expect(
        mediaValue,
        `token ${token} is in :root.dark but missing from @media (prefers-color-scheme: dark)`,
      ).toBeDefined()
      expect(
        mediaValue,
        `token ${token} has different values in :root.dark vs @media (prefers-color-scheme: dark)`,
      ).toBe(rootValue)
    }
  })
})

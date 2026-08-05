import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * componentLibrary-nk3 contrast audit: `.ns-btn--marketing` set
 * `background: var(--ns-color-text-primary)`. That token is a TEXT token
 * and therefore FLIPS with the theme (#2d0b00 light, #fef7ee dark), while
 * the button's `color: white` is hardcoded and cannot flip. The two
 * happened to produce readable white-on-near-black in light mode by
 * coincidence, and unreadable near-white-on-near-white in dark mode
 * (measured 1.06:1, WCAG AA requires 4.5:1 for normal text / 3:1 for
 * large text).
 *
 * This test reads the actual source files (not a hardcoded expectation) so
 * it fails if `.ns-btn--marketing`'s background token is ever changed back
 * to one that flips with the theme.
 */

const rawButtonSource = readFileSync(resolve(__dirname, 'NsButton.vue'), 'utf-8')
const tokensCss = readFileSync(resolve(__dirname, '../../tokens/tokens.css'), 'utf-8')

// Strip `//` line comments so comment prose (which may itself contain the
// literal substrings "color:" or "background:") can't be mistaken for a
// real CSS declaration by the naive regexes below.
const buttonSource = rawButtonSource
  .split('\n')
  .map((line) => line.replace(/\/\/.*/, ''))
  .join('\n')

function extractMarketingBackgroundToken(source: string): string {
  const marketingBlockMatch = source.match(/\.ns-btn--marketing\s*\{([^}]*)\}/)
  if (!marketingBlockMatch) throw new Error('.ns-btn--marketing block not found in NsButton.vue')
  const backgroundMatch = marketingBlockMatch[1].match(/background:\s*var\((--ns-[\w-]+)\)/)
  if (!backgroundMatch) {
    throw new Error('.ns-btn--marketing background does not use a var(--ns-*) token')
  }
  return backgroundMatch[1]
}

function extractMarketingTextColor(source: string): string {
  const marketingBlockMatch = source.match(/\.ns-btn--marketing\s*\{([^}]*)\}/)
  if (!marketingBlockMatch) throw new Error('.ns-btn--marketing block not found in NsButton.vue')
  const colorMatch = marketingBlockMatch[1].match(/(?<!background-)color:\s*([^;]+);/)
  if (!colorMatch) throw new Error('.ns-btn--marketing color declaration not found')
  return colorMatch[1].trim()
}

/** Resolve a `--ns-*` token's hex value from a specific block of tokens.css. */
function resolveTokenValue(
  css: string,
  blockStart: number,
  blockEnd: number,
  token: string,
): string {
  const block = css.slice(blockStart, blockEnd)
  const match = block.match(new RegExp(`${token}\\s*:\\s*(#[0-9a-fA-F]{6})`))
  if (!match) throw new Error(`Could not resolve ${token} in the given tokens.css block`)
  return match[1]
}

function lin(c: number): number {
  const cs = c / 255
  return cs <= 0.04045 ? cs / 12.92 : ((cs + 0.055) / 1.055) ** 2.4
}

function luminance(hex: string): number {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function contrastRatio(hexA: string, hexB: string): number {
  const l1 = luminance(hexA)
  const l2 = luminance(hexB)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

const WCAG_AA_LARGE_TEXT = 3
const WCAG_AA_NORMAL_TEXT = 4.5

describe('.ns-btn--marketing contrast (componentLibrary-nk3)', () => {
  const backgroundToken = extractMarketingBackgroundToken(buttonSource)
  const textColor = extractMarketingTextColor(buttonSource)

  it('uses a text colour of white, as designed', () => {
    expect(textColor).toBe('white')
  })

  it('does not source its background from a token that flips between light and dark mode text tokens', () => {
    // --ns-color-text-* tokens are TEXT tokens and flip with the theme.
    // A background must not be sourced from one of them, or a hardcoded
    // (non-flipping) foreground colour will lose contrast in one theme.
    expect(backgroundToken).not.toMatch(/^--ns-color-text-/)
  })

  it('meets WCAG AA contrast (white text) in light mode', () => {
    const lightEnd = tokensCss.indexOf(':root.dark')
    const bg = resolveTokenValue(tokensCss, 0, lightEnd, backgroundToken)
    const ratio = contrastRatio('#ffffff', bg)
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_LARGE_TEXT)
  })

  it('meets WCAG AA contrast (white text) in dark mode — regression for the 1.06:1 invisible-text bug', () => {
    const darkStart = tokensCss.indexOf(':root.dark')
    const darkEnd = tokensCss.indexOf('\n}\n', darkStart)
    const bg = resolveTokenValue(tokensCss, darkStart, darkEnd, backgroundToken)
    const ratio = contrastRatio('#ffffff', bg)
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT)
  })
})

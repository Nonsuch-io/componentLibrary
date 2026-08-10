import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync, readdirSync } from 'fs'
import { resolve, join, relative } from 'path'
import * as sass from 'sass-embedded'

/**
 * componentLibrary-gbb — automated WCAG contrast check over design tokens.
 *
 * FIVE separate AA failures were found in a Figma audit this sweep, every one
 * of them BY HAND: someone resolved tokens through tokens.css's three theme
 * blocks and computed ratios in a throwaway script (componentLibrary-7jc,
 * componentLibrary-34n, componentLibrary-3ul, plus two already fixed). There
 * was no automated check anywhere in the repo. This file is that check.
 *
 * WHY PAIRS ARE EXTRACTED FROM COMPONENTS, NOT FROM TOKEN NAMES:
 * The hard part isn't the maths, it's knowing which foreground/background
 * PAIRS are actually intended. `text-positive` on `bg-positive` is intended;
 * `text-positive` on `bg-brand` is not. A cartesian product over ~118
 * semantic colour tokens would produce a wall of false positives, and a
 * muted check is worse than no check — it is a check that cannot fail
 * wearing a green tick.
 *
 * So this test compiles the actual `<style>` block of every component
 * (`sass-embedded`, real Dart Sass — handles both `lang="scss"` and
 * `lang="sass"`, resolves nesting, `&`-selectors, and local SCSS variables
 * exactly as the build does) down to flat CSS rules, and only pairs a
 * `color` with a `background`/`background-color` when BOTH are declared as
 * OWN properties of the exact same compiled rule. A rule that only overrides
 * `color` in a `:hover` block while inheriting `background` from its parent
 * selector is a real pair too, but working out what it inherits requires
 * guessing at cascade order across the whole stylesheet — which is exactly
 * the kind of guess this file avoids. That is a deliberate under-report: it
 * means some real pairs (notably the `:hover`-only background overrides
 * behind some of componentLibrary-7jc's "~25 combinations") are not counted
 * here. See "KNOWN GAPS" below.
 *
 * THREE THEME BLOCKS, ASSERTED INDEPENDENTLY:
 * tokens.css's own header comment says "update both blocks" when there are
 * THREE (`:root`, `:root.dark, [data-theme='dark']`, and
 * `@media (prefers-color-scheme: dark)`). A pair fixed in two of three
 * blocks looks fixed. Every pair below is resolved and asserted separately
 * against all three, so a value corrected only in `:root` fails loudly for
 * the media-query block instead of passing by accident.
 */

/**
 * KNOWN GAPS
 *
 * Two gaps live in `resolveToRgb` rather than in extraction: the PAIR is
 * found correctly, but its VALUES cannot be turned into an RGB triple, so the
 * evaluation resolves to `ratio: null` and is silently skipped by the AA
 * assertions below. As of this writing that is 18 of 84 evaluations (21%):
 *
 *   1. `--ns-color-text-primary` on a `linear-gradient(...)` background — 12
 *      evaluations (4 occurrences x 3 theme blocks): NsBottomNav's
 *      `.ns-bottom-nav__pill` / `.ns-bottom-nav__sub-pill` and NsNavSidebar's
 *      active-pill equivalents. A multi-layer gradient has no single "the
 *      background colour" to sample without picking an arbitrary point on
 *      it, which this file declines to guess at.
 *
 *   2. `--ns-color-text-brand` on `background: transparent` — 6 evaluations
 *      (2 occurrences x 3 theme blocks): `.ns-btn--tertiary` and
 *      NsNavSidebar's `.ns-nav-sidebar__toggle-btn`. `transparent` has no RGB
 *      value of its own; the real backdrop is whatever renders behind the
 *      element, which is exactly the cascade-order guess the OWN-properties
 *      restriction above exists to avoid.
 *
 * CONSEQUENCE: both of the above are entire pairs, not just some of their
 * blocks — they resolve to null in EVERY theme block. So 2 of this file's 19
 * "unique pairs" produce NO real AA assertion anywhere, which quietly
 * inflates what "19 unique pairs" / "84 evaluations" imply as coverage:
 * effectively only 17 of 19 pairs are ever checked against AA.
 *
 * SHARP INSTANCE: `--ns-color-text-brand` on `transparent` (gap 2) shares its
 * FOREGROUND token with an ALREADY-DOCUMENTED failing pair —
 * `--ns-color-text-brand` on `--ns-color-bg-canvas`, 3.62:1 in light,
 * componentLibrary-7jc (see KNOWN_EXCEPTIONS below). In practice a
 * `transparent` background composites with whatever renders behind it, and
 * for `.ns-btn--tertiary` / `.ns-nav-sidebar__toggle-btn` that backdrop is
 * very often `--ns-color-bg-canvas` — the same already-failing 3.62:1 colour
 * likely renders in both places, but this file structurally cannot see that:
 * it only pairs declarations that are both own properties of the same
 * compiled rule, never a composited/inherited backdrop. Those two selectors
 * should be checked by hand against their real rendered backdrop.
 *
 * The extraction-sanity floor and the unresolved-fraction ceiling below
 * (search "resolve to a measurable ratio" / "bounded to the documented KNOWN
 * GAPS") exist so a FUTURE silent expansion of this skipped set — a third
 * unresolvable pattern, or either of these two gaps spreading to more
 * components — fails loudly instead of being absorbed quietly into "some
 * evaluations don't resolve, as expected."
 */

const ROOT = resolve(__dirname, '../..')
const COMPONENTS_DIR = resolve(ROOT, 'src/components')
const TOKENS_CSS_PATH = resolve(ROOT, 'src/tokens/tokens.css')

const WCAG_AA_NORMAL_TEXT = 4.5
const WCAG_AA_LARGE_TEXT = 3

// ---------------------------------------------------------------------------
// Colour maths (WCAG relative luminance / contrast ratio)
// ---------------------------------------------------------------------------

type Rgb = [number, number, number]

function linearise(channel: number): number {
  const cs = channel / 255
  return cs <= 0.04045 ? cs / 12.92 : ((cs + 0.055) / 1.055) ** 2.4
}

function relativeLuminance([r, g, b]: Rgb): number {
  return 0.2126 * linearise(r) + 0.7152 * linearise(g) + 0.0722 * linearise(b)
}

function contrastRatio(a: Rgb, b: Rgb): number {
  const l1 = relativeLuminance(a)
  const l2 = relativeLuminance(b)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

function hexToRgb(hex: string): Rgb {
  let clean = hex.replace('#', '')
  if (clean.length === 3 || clean.length === 4) {
    clean = clean
      .slice(0, 3)
      .split('')
      .map((c) => c + c)
      .join('')
  } else if (clean.length === 8) {
    clean = clean.slice(0, 6)
  }
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ]
}

/** Parses `rgb()`/`rgba()`. Returns null for anything with alpha < 1 — compositing
 * against a real backdrop is out of scope, so translucent colours are left
 * unresolved rather than guessed at (see "prefer under-reporting" above). */
function rgbFunctionToRgb(value: string): Rgb | null {
  const match = value.match(
    /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)$/i,
  )
  if (!match) return null
  const alpha = match[4] !== undefined ? parseFloat(match[4]) : 1
  if (alpha < 0.999) return null
  return [parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3])]
}

/** CSS named colours actually observed in component styles. Anything not in
 * this table is treated as unresolvable rather than guessed. */
const NAMED_COLORS: Record<string, string> = {
  white: '#ffffff',
  black: '#000000',
}

const UNRESOLVABLE_KEYWORDS = new Set([
  'transparent',
  'currentcolor',
  'inherit',
  'initial',
  'unset',
])

interface ResolveResult {
  rgb: Rgb | null
  reason?: string
}

interface ClassifiedValue {
  kind: 'var' | 'hex' | 'rgb' | 'named' | 'unresolvable'
  token?: string
  fallback?: string
  value?: string
}

function classifyValue(raw: string): ClassifiedValue {
  const value = raw.trim()
  const varMatch = value.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*([\s\S]+))?\)$/)
  if (varMatch) {
    return { kind: 'var', token: varMatch[1], fallback: varMatch[2]?.trim() }
  }
  if (/^#[0-9a-fA-F]{3,8}$/.test(value)) return { kind: 'hex', value }
  if (/^rgba?\(/i.test(value)) return { kind: 'rgb', value }
  if (/^[a-zA-Z]+$/.test(value)) {
    if (UNRESOLVABLE_KEYWORDS.has(value.toLowerCase())) return { kind: 'unresolvable', value }
    return { kind: 'named', value: value.toLowerCase() }
  }
  return { kind: 'unresolvable', value }
}

/** Resolves a declaration value (literal or `var(--token[, fallback])`) to an
 * RGB triple, chasing `var()` alias chains through a single tokens.css block. */
function resolveToRgb(
  raw: string,
  tokenMap: ReadonlyMap<string, string>,
  depth = 0,
): ResolveResult {
  if (depth > 10) return { rgb: null, reason: 'alias chain too deep (possible cycle)' }
  const classified = classifyValue(raw)
  switch (classified.kind) {
    case 'hex':
      return { rgb: hexToRgb(classified.value as string) }
    case 'rgb': {
      const rgb = rgbFunctionToRgb(classified.value as string)
      return rgb
        ? { rgb }
        : { rgb: null, reason: `unresolvable rgb()/rgba() form: ${classified.value}` }
    }
    case 'named': {
      const hex = NAMED_COLORS[classified.value as string]
      return hex
        ? { rgb: hexToRgb(hex) }
        : { rgb: null, reason: `unknown named colour: ${classified.value}` }
    }
    case 'unresolvable':
      return { rgb: null, reason: `unresolvable value: ${classified.value}` }
    case 'var': {
      const token = classified.token as string
      const tokenValue = tokenMap.get(token)
      if (tokenValue === undefined) {
        if (classified.fallback !== undefined) {
          return resolveToRgb(classified.fallback, tokenMap, depth + 1)
        }
        return {
          rgb: null,
          reason: `token ${token} not found in this block and no CSS fallback given`,
        }
      }
      return resolveToRgb(tokenValue, tokenMap, depth + 1)
    }
  }
}

/** Normalises a declaration value to a stable identity for grouping/exceptions:
 * a `var(--token, fallback)` becomes just `--token` (the fallback doesn't
 * change what pair is intended), a literal stays as-is. */
function normalizeIdentity(raw: string): string {
  const value = raw.trim()
  const varMatch = value.match(/^var\(\s*(--[\w-]+)\s*(?:,.*)?\)$/)
  return varMatch ? varMatch[1] : value
}

// ---------------------------------------------------------------------------
// tokens.css parsing — light / :root.dark / @media(prefers-color-scheme:dark)
// ---------------------------------------------------------------------------

type ThemeBlockName = 'light' | 'darkRoot' | 'darkMedia'
const THEME_BLOCK_NAMES: ThemeBlockName[] = ['light', 'darkRoot', 'darkMedia']

function extractTokenDeclarations(source: string): Map<string, string> {
  const map = new Map<string, string>()
  for (const m of source.matchAll(/(--ns-[\w-]+)\s*:\s*([^;]+);/g)) {
    map.set(m[1], m[2].replace(/\s*\/\*.*$/, '').trim())
  }
  return map
}

function extractLightBlockSource(css: string): string {
  const start = css.indexOf(':root {')
  const end = css.indexOf(':root.dark')
  return css.slice(start, end > -1 ? end : undefined)
}

/**
 * Finds `marker` in `css` and walks brace depth to the matching top-level
 * close, rather than assuming any particular textual sequence closes the
 * block. A naive `css.indexOf('\n}\n', start)` (as this file used to do for
 * the `:root.dark` block) breaks silently the moment the closing-brace line
 * isn't exactly that three-byte sequence — a trailing space, a comment on
 * the closing line, or a nested rule all defeat it, and `end` becoming -1
 * makes the slice run to end of file, pulling the textually-later
 * `@media (prefers-color-scheme: dark)` block's declarations INTO this map.
 * Since `extractTokenDeclarations` uses `Map.set` (last-write-wins), a token
 * declared in both blocks would then silently take the MEDIA block's value
 * inside the `:root.dark` map — masking exactly the "fixed in one block but
 * not another" bug class this file exists to catch loudly. Both dark-block
 * extractors below share this walk so neither can regress to that.
 */
function extractBlockByBraceDepth(css: string, marker: string): string {
  const start = css.indexOf(marker)
  if (start === -1) return ''
  let depth = 0
  let i = start
  while (i < css.length) {
    if (css[i] === '{') depth++
    else if (css[i] === '}') {
      depth--
      if (depth === 0) return css.slice(start, i + 1)
    }
    i++
  }
  return css.slice(start)
}

function extractRootDarkBlockSource(css: string): string {
  return extractBlockByBraceDepth(css, ':root.dark')
}

/** Finds the matching close of `@media (prefers-color-scheme: dark) { ... }`. */
function extractMediaDarkBlockSource(css: string): string {
  return extractBlockByBraceDepth(css, '@media (prefers-color-scheme: dark)')
}

function buildThemeBlocks(tokensCss: string): Record<ThemeBlockName, Map<string, string>> {
  return {
    light: extractTokenDeclarations(extractLightBlockSource(tokensCss)),
    darkRoot: extractTokenDeclarations(extractRootDarkBlockSource(tokensCss)),
    darkMedia: extractTokenDeclarations(extractMediaDarkBlockSource(tokensCss)),
  }
}

// ---------------------------------------------------------------------------
// Component `<style>` extraction — compiled with the real Sass compiler so
// nesting, `&`-selectors, local SCSS variables and both `lang="scss"` and
// `lang="sass"` (indented) syntaxes resolve exactly as the production build
// resolves them.
// ---------------------------------------------------------------------------

interface StyleBlock {
  lang: string
  content: string
}

function extractStyleBlocks(vueSource: string): StyleBlock[] {
  const blocks: StyleBlock[] = []
  const re = /<style([^>]*)>([\s\S]*?)<\/style>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(vueSource))) {
    const langMatch = m[1].match(/lang=["']([\w-]+)["']/)
    blocks.push({ lang: langMatch ? langMatch[1] : 'css', content: m[2] })
  }
  return blocks
}

function compileStyleBlock(block: StyleBlock, filePath: string): string {
  const syntax = block.lang === 'sass' ? 'indented' : 'scss'
  try {
    return sass.compileString(block.content, { syntax }).css
  } catch (error) {
    throw new Error(
      `Failed to compile <style lang="${block.lang}"> in ${filePath}: ${(error as Error).message}`,
      { cause: error },
    )
  }
}

interface CssRule {
  selector: string
  declarations: Map<string, string>
}

/** Parses flat compiled CSS into rule blocks, recursing into at-rules
 * (`@media`, `@supports`, …) so their nested selector rules are still found.
 * Regular selectors do not nest in compiled CSS output, so declarations
 * collected here are the rule's OWN declarations — never a parent's. */
function parseCssRules(css: string): CssRule[] {
  const rules: CssRule[] = []
  let i = 0
  while (i < css.length) {
    const openBrace = css.indexOf('{', i)
    if (openBrace === -1) break
    const selector = css.slice(i, openBrace).trim()
    let depth = 1
    let j = openBrace + 1
    while (j < css.length && depth > 0) {
      if (css[j] === '{') depth++
      else if (css[j] === '}') depth--
      j++
    }
    const body = css.slice(openBrace + 1, j - 1)
    if (selector.startsWith('@')) {
      rules.push(...parseCssRules(body))
    } else if (selector) {
      const declarations = new Map<string, string>()
      for (const d of body.matchAll(/([\w-]+)\s*:\s*([^;]+);/g)) {
        declarations.set(d[1].trim(), d[2].trim())
      }
      rules.push({ selector, declarations })
    }
    i = j
  }
  return rules
}

function findComponentVueFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...findComponentVueFiles(full))
    else if (entry.isFile() && entry.name.endsWith('.vue')) out.push(full)
  }
  return out
}

/** A `.disabled` state is conventionally exempt from AA (componentLibrary-7jc:
 * "Disabled text is conventionally EXEMPT from AA"). Strips `:not(.disabled)`
 * qualifiers before checking, so `.ns-btn--accent:active:not(.disabled)` is
 * NOT mistaken for a disabled-state rule — only a genuine `.disabled` class
 * on the selector itself is skipped. */
function isDisabledStateSelector(selector: string): boolean {
  return selector.replace(/:not\([^)]*\)/g, '').includes('.disabled')
}

interface ColorBackgroundOccurrence {
  file: string
  selector: string
  colorRaw: string
  backgroundRaw: string
}

function extractColorBackgroundOccurrences(componentsDir: string): ColorBackgroundOccurrence[] {
  const occurrences: ColorBackgroundOccurrence[] = []
  for (const file of findComponentVueFiles(componentsDir)) {
    const relPath = relative(ROOT, file)
    const source = readFileSync(file, 'utf-8')
    for (const block of extractStyleBlocks(source)) {
      const css = compileStyleBlock(block, relPath)
      for (const rule of parseCssRules(css)) {
        if (isDisabledStateSelector(rule.selector)) continue
        const colorRaw = rule.declarations.get('color')
        const backgroundRaw =
          rule.declarations.get('background-color') ?? rule.declarations.get('background')
        if (colorRaw && backgroundRaw) {
          occurrences.push({ file: relPath, selector: rule.selector, colorRaw, backgroundRaw })
        }
      }
    }
  }
  return occurrences
}

// ---------------------------------------------------------------------------
// Known, documented AA failures.
//
// Each entry names a foreground/background PAIR (by token or literal
// identity — see normalizeIdentity) and the specific theme block(s) where it
// is currently known to fail. Matching is per-block on purpose: a pair that
// only fails in one block stays strictly asserted in the other two, so a fix
// landed in only one of the three blocks in tokens.css cannot silently mask
// a regression in the remaining blocks.
//
// This list may only SHRINK. If a pair here starts passing in a block, that
// block's assertion simply starts passing too (nothing to update). If a NEW
// pair drops below threshold that isn't listed here, the test FAILS — that
// is the whole point of this file.
// ---------------------------------------------------------------------------

interface KnownException {
  /** Foreground identity — a `--ns-*` token name or a literal like `white`. */
  fg: string
  /** Background identity — a `--ns-*` token name or a literal. */
  bg: string
  /** Theme blocks in which this pair is currently known to fail AA (4.5:1). */
  blocks: ThemeBlockName[]
  /** True if it also fails AA Large (3:1) in those blocks. */
  belowLarge: boolean
  /**
   * The ratio this pair MEASURES TODAY, per block, pinned to 2dp.
   *
   * Without this an exception is an unbounded wildcard: it exempts the pair no
   * matter how bad the ratio gets, so a token edit that drove an excepted pair
   * to 1.00:1 would still pass. That was demonstrated on this very file — an
   * accent-active token changed to #ffffff produced a white-on-white pressed
   * state and all 129 token tests passed.
   *
   * Pinning makes the exception fail in BOTH directions: a regression (ratio
   * drops) and a FIX (ratio rises) both go red. The fix case is the point —
   * it forces the exception to be deleted when the bead is closed, which is
   * what mechanically enforces "this list may only shrink" instead of merely
   * asserting it in a comment.
   */
  ratios: Partial<Record<ThemeBlockName, number>>
  bead: string
  note: string
}

const KNOWN_EXCEPTIONS: KnownException[] = [
  // --- componentLibrary-7jc: ~25 button combinations below AA ---
  {
    fg: '--ns-color-text-on-brand',
    bg: '--ns-color-bg-brand',
    blocks: ['light', 'darkRoot', 'darkMedia'],
    belowLarge: false,
    ratios: { light: 3.7386, darkRoot: 3.7386, darkMedia: 3.7386 },
    bead: 'componentLibrary-7jc',
    note:
      '.ns-btn--primary (and the same token pair reused in NsBottomNav/NsNavSidebar active pills) — ' +
      'white on #d56307, 3.74:1 in both themes. THE DEFAULT variant on every button. Passes AA Large ' +
      '(3:1), which is almost certainly why nobody noticed.',
  },
  {
    fg: '--ns-color-text-on-brand',
    bg: '--ns-color-status-accent-active',
    blocks: ['light'],
    belowLarge: true,
    ratios: { light: 1.8173 },
    bead: 'componentLibrary-7jc',
    note: '.ns-btn--accent:active — white on #79caf3, 1.82:1. Effectively unreadable; the pressed state of a button people actually press.',
  },
  {
    fg: '--ns-color-bg-brand-hover',
    bg: '--ns-color-bg-surface',
    blocks: ['light', 'darkRoot', 'darkMedia'],
    belowLarge: true,
    ratios: { light: 2.9908, darkRoot: 3.7792, darkMedia: 3.7792 },
    bead: 'componentLibrary-7jc',
    note:
      '.ns-btn--secondary:hover — #f66b00 on #ffffff, 2.99:1 in light (fails AA Large too). ' +
      'Dark is 3.78:1 — passes AA Large, still fails AA normal.',
  },
  {
    fg: '--ns-color-text-brand',
    bg: '--ns-color-bg-canvas',
    blocks: ['light'],
    belowLarge: false,
    ratios: { light: 3.6196 },
    bead: 'componentLibrary-7jc',
    note: '.ns-btn--secondary base — #d56307 on #fefbf5, 3.62:1.',
  },
  {
    fg: '--ns-color-text-on-brand',
    bg: '--ns-color-status-negative',
    blocks: ['darkRoot', 'darkMedia'],
    belowLarge: true,
    ratios: { darkRoot: 2.759, darkMedia: 2.759 },
    bead: 'componentLibrary-7jc',
    note: '.ns-btn--negative (dark) — white on #fd6d73, 2.76:1.',
  },
  {
    fg: '--ns-color-text-on-accent',
    bg: '--ns-color-status-accent',
    blocks: ['darkRoot', 'darkMedia'],
    belowLarge: false,
    ratios: { darkRoot: 3.1737, darkMedia: 3.1737 },
    bead: 'componentLibrary-7jc',
    note: '.ns-btn--accent base (dark) — 3.17:1. Not individually named in the bead\'s worked examples but part of the same "~25 combinations below AA" sweep.',
  },
  {
    fg: '--ns-color-bg-brand-active',
    bg: '--ns-color-bg-header',
    blocks: ['light'],
    belowLarge: false,
    ratios: { light: 4.2734 },
    bead: 'componentLibrary-7jc',
    note: '.ns-btn--secondary:active — 4.27:1, just under the 4.5:1 AA-normal line.',
  },

  // --- componentLibrary-3ul: positive status tokens fail AA and swap roles ---
  {
    fg: '--ns-color-text-positive',
    bg: '--ns-color-bg-positive',
    blocks: ['light', 'darkRoot', 'darkMedia'],
    belowLarge: true,
    ratios: { light: 2.8728, darkRoot: 2.1852, darkMedia: 2.1852 },
    bead: 'componentLibrary-3ul',
    note: '.ns-banner--success (NsBanner type="success") — #919500 on #f3f4d2, 2.87:1 in light (matches the bead exactly); dark is worse at 2.19:1.',
  },

  // --- NOT covered above: componentLibrary-34n ---
  // .ns-btn--positive/.ns-btn--warning/.ns-btn--negative pair a background
  // with the WRONG on-colour token (e.g. text-on-accent instead of
  // text-on-positive). This is a token-IDENTITY bug, not a contrast one:
  // text-on-accent and text-on-positive currently resolve to the same hex
  // (#2d0b00), and text-on-brand/text-on-negative both resolve to #ffffff,
  // so the wrong token renders an identical, currently-AA-fine colour. A
  // numeric contrast check has nothing to catch here by definition — the
  // day someone changes one on-colour token and not the other, three button
  // variants will go bad with no ratio-based test able to see it coming.
  // Tracked here for the audit trail; the actual fix (assert each variant's
  // color resolves to the on-token matching its own background token) is
  // componentLibrary-34n's job, not this file's.
]

// ---------------------------------------------------------------------------
// NEW findings — discovered BY THIS TEST, not previously filed as beads.
// Per Kale (2026-08-04): ratios are the designer's call, this file's job is
// to make failures visible, not fix them. These are listed as exceptions
// (with the SAME per-block discipline as the filed ones above) so the test
// can land today, but they are flagged prominently for the parent/reviewer
// to file as beads — see the Worker Report for this task.
// ---------------------------------------------------------------------------

const NEWLY_DISCOVERED_EXCEPTIONS: KnownException[] = [
  {
    fg: '--ns-color-text-warning',
    bg: '--ns-color-bg-warning',
    blocks: ['light', 'darkRoot', 'darkMedia'],
    belowLarge: true,
    ratios: { light: 1.3641, darkRoot: 1.0, darkMedia: 1.0 },
    bead: 'componentLibrary-2p1',
    note:
      '.ns-banner--warning (NsBanner type="warning") — #f7bc2b on #f9e3ad, 1.36:1 in light. In DARK ' +
      'MODE, --ns-color-text-warning and --ns-color-bg-warning are the SAME hex (#eaa500 on #eaa500) ' +
      '— literally invisible text, 1.00:1. Same shape as PR #211 (a token reused across two roles that ' +
      'happen to collide). Ships today in NsBanner.',
  },
  {
    fg: '--ns-color-text-negative',
    bg: '--ns-color-bg-negative',
    blocks: ['darkRoot', 'darkMedia'],
    belowLarge: true,
    ratios: { darkRoot: 1.0, darkMedia: 1.0 },
    bead: 'componentLibrary-2p1',
    note:
      '.ns-banner--error (NsBanner type="error"), dark mode only — --ns-color-text-negative and ' +
      '--ns-color-bg-negative are BOTH #fd6d73 in dark. Identical colour, 1.00:1, invisible text. ' +
      'Light mode is fine (4.71:1).',
  },
  {
    fg: '--ns-color-text-info',
    bg: '--ns-color-bg-info',
    blocks: ['darkRoot', 'darkMedia'],
    belowLarge: false,
    ratios: { darkRoot: 3.6257, darkMedia: 3.6257 },
    bead: 'componentLibrary-2p1',
    note: '.ns-banner--info (NsBanner type="info"), dark mode — 3.63:1. Passes AA Large, fails AA normal.',
  },
  {
    fg: '--ns-color-text-primary',
    bg: '--ns-color-bg-highlight',
    blocks: ['darkRoot', 'darkMedia'],
    belowLarge: true,
    ratios: { darkRoot: 2.2535, darkMedia: 2.2535 },
    bead: 'componentLibrary-2p1',
    note: '.ns-eyebrow-tag (NsEyebrowTag), dark mode — 2.25:1.',
  },
]

NEWLY_DISCOVERED_EXCEPTIONS.push({
  fg: '--ns-color-text-primary',
  bg: '--ns-color-status-neutral',
  blocks: ['darkRoot', 'darkMedia'],
  belowLarge: true,
  ratios: { darkRoot: 1.1552, darkMedia: 1.1552 },
  bead: 'componentLibrary-2p1',
  note:
    '.ns-badge--neutral (NsBadge color="neutral") — 14.63:1 in LIGHT and 1.16:1 in DARK. Same root ' +
    'cause as the banner entries above: --ns-color-status-neutral does NOT flip between themes ' +
    '(#e5e7eb in all three blocks) while --ns-color-text-primary does (#2d0b00 -> #fef7ee), so ' +
    'near-black on light grey becomes near-white on light grey. Figma specifies exactly this pair ' +
    '(Badges page, Color=Neutral), so the design is light-mode-only here rather than the component ' +
    'being wrong. Caught by this check on the commit that ADDED the variant — it would otherwise ' +
    'have shipped. Kale has scoped dark mode as WIP and consumers force light, so it ships ' +
    'documented rather than blocked.',
})

const ALL_EXCEPTIONS = [...KNOWN_EXCEPTIONS, ...NEWLY_DISCOVERED_EXCEPTIONS]

function findException(
  fgIdentity: string,
  bgIdentity: string,
  block: ThemeBlockName,
): KnownException | undefined {
  return ALL_EXCEPTIONS.find(
    (e) => e.fg === fgIdentity && e.bg === bgIdentity && e.blocks.includes(block),
  )
}

// ---------------------------------------------------------------------------
// Build the full set of (occurrence × theme block) evaluations once.
// ---------------------------------------------------------------------------

interface Evaluation {
  file: string
  selector: string
  fgIdentity: string
  bgIdentity: string
  block: ThemeBlockName
  ratio: number | null
  unresolvedReason?: string
}

let evaluations: Evaluation[] = []
let occurrenceCount = 0
let uniquePairCount = 0

beforeAll(() => {
  const tokensCss = readFileSync(TOKENS_CSS_PATH, 'utf-8')
  const themeBlocks = buildThemeBlocks(tokensCss)
  const occurrences = extractColorBackgroundOccurrences(COMPONENTS_DIR)
  occurrenceCount = occurrences.length

  const pairKeys = new Set<string>()
  const results: Evaluation[] = []
  for (const occ of occurrences) {
    const fgIdentity = normalizeIdentity(occ.colorRaw)
    const bgIdentity = normalizeIdentity(occ.backgroundRaw)
    pairKeys.add(`${fgIdentity} on ${bgIdentity}`)
    for (const block of THEME_BLOCK_NAMES) {
      const fg = resolveToRgb(occ.colorRaw, themeBlocks[block])
      const bg = resolveToRgb(occ.backgroundRaw, themeBlocks[block])
      if (!fg.rgb || !bg.rgb) {
        results.push({
          file: occ.file,
          selector: occ.selector,
          fgIdentity,
          bgIdentity,
          block,
          ratio: null,
          unresolvedReason: fg.reason ?? bg.reason,
        })
        continue
      }
      results.push({
        file: occ.file,
        selector: occ.selector,
        fgIdentity,
        bgIdentity,
        block,
        ratio: contrastRatio(fg.rgb, bg.rgb),
      })
    }
  }
  uniquePairCount = pairKeys.size
  evaluations = results
}, 30_000)

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('token contrast (componentLibrary-gbb)', () => {
  it('finds a non-trivial number of foreground/background pairs actually used by components', () => {
    // Guards against the exact failure mode this bead exists to prevent: a
    // contrast check that passes because it silently found nothing to check.
    // ~118 semantic colour tokens exist; a component-driven extraction
    // should land well below that (it is not a cartesian product) but well
    // above zero.
    expect(occurrenceCount).toBeGreaterThan(15)
    expect(uniquePairCount).toBeGreaterThan(10)
  })

  it('at least 75% of theme-block evaluations resolve to a measurable ratio (extraction sanity floor)', () => {
    // NOT "every pair" — KNOWN GAPS above documents 18/84 evaluations
    // (gradient and `transparent` backgrounds) that this extractor cannot
    // turn into an RGB triple, by design, not by bug. A per-pair "every pair
    // resolves somewhere" assertion, as an earlier version of this test's
    // NAME promised, is actually false today: those two pairs resolve in NO
    // block, so that phrasing would fail immediately for a documented,
    // acceptable reason — dishonest to keep as a name and pointless as a
    // check.
    //
    // 75% is chosen as a floor comfortably below today's actual (66/84 =
    // 78.6%), leaving room for the two documented gaps above to grow a
    // little without failing every unrelated PR, while still being high
    // enough to catch a REAL regression — e.g. a change that broke var()
    // alias resolution for a whole theme block, which would look nothing
    // like these two narrow, already-documented gaps and would drag the
    // resolved fraction down much further than that.
    const resolvedCount = evaluations.filter((e) => e.ratio !== null).length
    const total = evaluations.length
    const floor = Math.ceil(total * 0.75)
    expect(
      resolvedCount,
      `Only ${resolvedCount}/${total} evaluations resolved to a ratio (need >= ${floor}, i.e. >= 75%). ` +
        'If this dropped for a reason other than the two documented KNOWN GAPS above, treat it as an ' +
        'extraction bug: the AA assertions below are silently checking fewer real pairs than they claim.',
    ).toBeGreaterThanOrEqual(floor)
  })

  it('unresolved evaluations are bounded to the documented KNOWN GAPS, not a silently growing set', () => {
    // Complements the floor above from the other direction: that test bounds
    // the RESOLVED fraction generically; this one bounds the UNRESOLVED
    // fraction specifically, by checking every unresolved evaluation against
    // the two named categories in KNOWN GAPS. A new unresolvable pattern
    // (a third CSS function this file can't parse, say) fails here even if
    // it's small enough not to trip the 75% floor above.
    const unresolved = evaluations.filter((e) => e.ratio === null)
    const isDocumentedGap = (e: Evaluation) =>
      e.bgIdentity.startsWith('linear-gradient(') ||
      e.bgIdentity === 'transparent' ||
      // A TOKEN whose resolved value is transparent is the SAME documented gap,
      // and the identity check alone missed it: NsBadge's ghost variant uses
      // --ns-color-btn-tertiary-bg, which IS `transparent`, so it was reported
      // as a new undocumented gap rather than the known one. Match the reason
      // rather than an exact identity, since the reason is built from whatever
      // the resolver classified the value as.
      /\btransparent\b/.test(e.unresolvedReason ?? '')
    const undocumented = unresolved.filter((e) => !isDocumentedGap(e))
    expect(
      undocumented,
      `${undocumented.length} evaluation(s) are unresolved for a reason NOT covered by KNOWN GAPS ` +
        '(gradient backgrounds, `transparent` backgrounds). Either document the new gap above (if it is ' +
        `a deliberate under-report) or treat it as an extraction bug:\n` +
        undocumented
          .map(
            (e) =>
              `${e.file} ${e.selector} [${e.block}] ${e.fgIdentity} on ${e.bgIdentity}: ${e.unresolvedReason}`,
          )
          .join('\n'),
    ).toEqual([])

    // Bounds how far the DOCUMENTED gap itself may silently grow. Today it is
    // 18/84 (21.4%). The ceiling gives room for a handful of new occurrences
    // of the SAME two categories without failing on every unrelated PR, while
    // still catching a gap that balloons unnoticed — if this trips, KNOWN
    // GAPS above needs updating (and re-justifying), not just a bigger number.
    const ceiling = Math.ceil(evaluations.length * 0.3)
    expect(
      unresolved.length,
      `${unresolved.length}/${evaluations.length} evaluations are unresolved (ceiling ${ceiling}, ~30%). ` +
        'The documented gradient/transparent gap has grown past its expected size — investigate before ' +
        'raising this ceiling.',
    ).toBeLessThanOrEqual(ceiling)
  })

  describe('AA Large text (3:1 minimum)', () => {
    it('every resolvable pair meets AA Large, or is a documented exception', () => {
      const failures: string[] = []
      for (const evalResult of evaluations) {
        if (evalResult.ratio === null) continue
        if (evalResult.ratio >= WCAG_AA_LARGE_TEXT) continue
        const exception = findException(
          evalResult.fgIdentity,
          evalResult.bgIdentity,
          evalResult.block,
        )
        if (exception?.belowLarge) continue
        failures.push(
          `${evalResult.file} ${evalResult.selector} [${evalResult.block}] ` +
            `${evalResult.fgIdentity} on ${evalResult.bgIdentity} = ${evalResult.ratio.toFixed(2)}:1 ` +
            `(needs ${WCAG_AA_LARGE_TEXT}:1)`,
        )
      }
      expect(failures, `Undocumented AA-Large contrast failures:\n${failures.join('\n')}`).toEqual(
        [],
      )
    })
  })

  describe('AA normal text (4.5:1 minimum)', () => {
    it('every resolvable pair meets AA normal, or is a documented exception', () => {
      const failures: string[] = []
      for (const evalResult of evaluations) {
        if (evalResult.ratio === null) continue
        if (evalResult.ratio >= WCAG_AA_NORMAL_TEXT) continue
        const exception = findException(
          evalResult.fgIdentity,
          evalResult.bgIdentity,
          evalResult.block,
        )
        if (exception) continue
        failures.push(
          `${evalResult.file} ${evalResult.selector} [${evalResult.block}] ` +
            `${evalResult.fgIdentity} on ${evalResult.bgIdentity} = ${evalResult.ratio.toFixed(2)}:1 ` +
            `(needs ${WCAG_AA_NORMAL_TEXT}:1)`,
        )
      }
      expect(failures, `Undocumented AA-normal contrast failures:\n${failures.join('\n')}`).toEqual(
        [],
      )
    })
  })

  it('every documented exception still measures the ratio it claims', () => {
    // THE ASSERTION THAT MAKES AN EXCEPTION BOUNDED. Without it, `continue`-ing
    // past an excepted pair exempts it at ANY ratio — including 1.00:1 invisible
    // text — so the known-bad pairs, which are exactly the tokens a designer is
    // about to edit, become the one region this file cannot see.
    //
    // Verified to fail in both directions before being trusted:
    //   worsening — accent-active -> #ffffff drove 1.82 to 1.00 and went red
    //   fixing    — a corrected pair rises above its pin and also goes red,
    //               which is what forces the exception to be DELETED and the
    //               list to shrink. That is the half a floor-only check misses.
    const drifted: string[] = []
    for (const exception of ALL_EXCEPTIONS) {
      for (const block of exception.blocks) {
        const documented = exception.ratios[block]
        const actual = evaluations.find(
          (e) =>
            e.fgIdentity === exception.fg && e.bgIdentity === exception.bg && e.block === block,
        )?.ratio
        const where = `${exception.bead}: ${exception.fg} on ${exception.bg} [${block}]`
        if (documented === undefined) {
          drifted.push(`${where} — no pinned ratio; every exception must pin one`)
        } else if (actual == null) {
          drifted.push(`${where} — pinned at ${documented}:1 but no longer resolves`)
        } else if (Math.abs(actual - documented) > 0.01) {
          drifted.push(
            `${where} — pinned ${documented}:1, now ${actual.toFixed(2)}:1. ` +
              (actual > documented
                ? 'IMPROVED: if the bead is fixed, DELETE this exception.'
                : 'WORSENED: this is a regression, not a documented failure.'),
          )
        }
      }
    }
    expect(
      drifted,
      `Documented exceptions no longer match reality:\n${drifted.join('\n')}`,
    ).toEqual([])
  })

  it('documented exceptions actually correspond to a pair this test extracted', () => {
    // Guards the exceptions list itself: an exception for a pair/block that
    // was never extracted (typo'd token name, component since refactored,
    // etc.) is silently useless — it exempts nothing and gives false
    // confidence that the debt is tracked. Every KNOWN_EXCEPTIONS entry must
    // match at least one real evaluation.
    const seen = new Set(evaluations.map((e) => `${e.fgIdentity} on ${e.bgIdentity} [${e.block}]`))
    const staleExceptions = ALL_EXCEPTIONS.flatMap((exception) =>
      exception.blocks
        .filter((block) => !seen.has(`${exception.fg} on ${exception.bg} [${block}]`))
        .map((block) => `${exception.bead}: ${exception.fg} on ${exception.bg} [${block}]`),
    )
    expect(
      staleExceptions,
      `Exceptions with no matching extracted pair:\n${staleExceptions.join('\n')}`,
    ).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// componentLibrary-bz9-adjacent: every --ns-color-* token a component
// references via var() must actually resolve — following alias chains — in
// ALL THREE theme blocks. A token missing from only the dark blocks
// currently fails silently at runtime (the browser just ignores the
// declaration and the previous/inherited colour shows through); this catches
// it at test time instead. Restricted to --ns-color-* because non-colour
// tokens (spacing, typography, radius, motion) are intentionally defined
// ONLY in :root and shared across themes — see tokens.css's own header.
// ---------------------------------------------------------------------------

function tokenResolvesInBlock(
  token: string,
  tokenMap: ReadonlyMap<string, string>,
  depth = 0,
): boolean {
  if (depth > 10) return false
  const value = tokenMap.get(token)
  if (value === undefined) return false
  const aliasMatch = value.match(/^var\(\s*(--[\w-]+)\s*\)$/)
  if (aliasMatch) return tokenResolvesInBlock(aliasMatch[1], tokenMap, depth + 1)
  return true
}

describe('every --ns-color-* token referenced by a component resolves in all three theme blocks', () => {
  let referencedColorTokens: string[] = []
  let themeBlocks: Record<ThemeBlockName, Map<string, string>>

  beforeAll(() => {
    const tokensCss = readFileSync(TOKENS_CSS_PATH, 'utf-8')
    themeBlocks = buildThemeBlocks(tokensCss)

    const tokens = new Set<string>()
    for (const file of findComponentVueFiles(COMPONENTS_DIR)) {
      const relPath = relative(ROOT, file)
      const source = readFileSync(file, 'utf-8')
      for (const block of extractStyleBlocks(source)) {
        const css = compileStyleBlock(block, relPath)
        for (const m of css.matchAll(/var\(\s*(--ns-color-[\w-]+)/g)) tokens.add(m[1])
      }
    }
    referencedColorTokens = [...tokens].sort()
  }, 30_000)

  it('finds a non-trivial number of referenced colour tokens (extraction sanity)', () => {
    expect(referencedColorTokens.length).toBeGreaterThan(10)
  })

  it('resolves every referenced colour token in every theme block', () => {
    const missing: string[] = []
    for (const token of referencedColorTokens) {
      for (const block of THEME_BLOCK_NAMES) {
        if (!tokenResolvesInBlock(token, themeBlocks[block])) {
          missing.push(`${token} does not resolve in the "${block}" block`)
        }
      }
    }
    expect(
      missing,
      `Component-referenced tokens missing from a theme block:\n${missing.join('\n')}`,
    ).toEqual([])
  })
})

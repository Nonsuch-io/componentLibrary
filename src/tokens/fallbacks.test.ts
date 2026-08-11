import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'fs'
import { resolve, join } from 'path'

/**
 * A var() FALLBACK MUST MATCH THE TOKEN IT FALLS BACK TO.
 *
 * WHY THIS EXISTS, and it is not hypothetical. NsBanner shipped
 *
 *     background-color: var(--ns-color-bg-positive, #e8f5e9)
 *     color: var(--ns-color-text-positive, #1b5e20)
 *
 * where those two hexes are Material palette greens that appear NOWHERE in
 * tokens.css. The live tokens resolved to 2.87:1; the fallbacks read as a
 * comfortable 8-ish. A consumer bead (butiq-iko6) then quoted the FALLBACKS as
 * the component's "accessible positive treatment, #e8f5e9 background with
 * #1b5e20 text" and told its own team to migrate to NsBanner on that basis.
 * butiq-agent nearly shipped it, and only caught it by computing the ratio from
 * the shipped tokens instead of trusting the sentence.
 *
 * THAT IS THE switchboard-87q SHAPE EXACTLY: a value that is real, checkable,
 * sitting in our own source, and dead in every environment that matters. Nothing
 * renders a fallback once tokens.css loads, so no visual test, no contrast test
 * and no type can see it drift. It is only ever read by humans — which is
 * precisely why a wrong one is dangerous rather than harmless.
 *
 * The contrast checker cannot cover this: it resolves LIVE tokens, so a lying
 * fallback is invisible to it by construction. Hence a separate file.
 *
 * Compared against the LIGHT block, because that is what a fallback stands in
 * for: the state before any theme has been applied.
 */

const ROOT = resolve(__dirname, '../..')
const TOKENS_CSS = resolve(ROOT, 'src/tokens/tokens.css')

/** Light-block token values. The light block is the first `:root {`; the dark
 *  overrides live in `:root.dark` / `[data-theme='dark']` / an @media block. */
function lightBlockTokens(): Map<string, string> {
  // COMMENTS ARE STRIPPED FIRST, and that is the load-bearing half. A previous
  // version of this function replaced indexOf('}') with the brace walk below and
  // claimed to be comment-proof; review REPRODUCED the exact stated scenario — a
  // lone `}` inside a comment — and the walk still truncated, 174 tokens down to
  // 67. The walk only survives BALANCED braces in comments, and prose references
  // a closing brace far more often than an opening one. Worse, 67 cleared the
  // size floor, so the backstop did not fire either.
  const css = readFileSync(TOKENS_CSS, 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '')
  const start = css.indexOf(':root {')
  // Brace depth rather than the first '}', so a nested rule cannot end the block
  // early either. If no closing brace is found, `end` stays at `start` and the
  // size floor below fails loudly — verified, not assumed.
  let depth = 0
  let end = start
  for (let i = css.indexOf('{', start); i < css.length; i++) {
    if (css[i] === '{') depth++
    else if (css[i] === '}') {
      depth--
      if (depth === 0) {
        end = i
        break
      }
    }
  }
  const tokens = new Map<string, string>()
  for (const m of css.slice(start, end).matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    tokens.set(m[1], m[2].trim())
  }
  return tokens
}

/**
 * .vue AND .ts. Scoping this to .vue was a real hole, found by review: literal
 * hex fallbacks live in story files too (AnimatedEye.stories.ts had three), and
 * they were invisible to this scanner while it claimed to cover the repo. A
 * check that cannot fail for an entire file type is the switchboard-87q shape
 * this very file was written to prevent — one directory over.
 */
function sourceFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...sourceFiles(full))
    // *.test.ts is excluded because a test asserting on a style STRING would
    // report its own fixture as a finding. Verified empty today (no test file
    // under either tree contains a `var(--ns-…,` fallback), so this excludes
    // nothing real — stated so nobody 'fixes' it in either direction by guess.
    // Note *.stories.ts and *.d.ts ARE scanned; only .test.ts is skipped.
    else if (/\.(vue|ts)$/.test(entry.name) && !/\.test\.ts$/.test(entry.name)) out.push(full)
  }
  return out
}

/** Resolve one alias hop (`var(--a)` -> `--b`'s value) so a fallback may match
 *  either the token's literal value or what that token aliases to. */
function resolveAlias(value: string, tokens: Map<string, string>): string {
  const alias = value.match(/^var\(\s*(--[\w-]+)\s*\)$/)
  return alias ? (tokens.get(alias[1]) ?? value) : value
}

describe('var() fallbacks agree with the tokens they stand in for', () => {
  const tokens = lightBlockTokens()

  it('parses the light block at all, so an empty scan cannot read as a pass', () => {
    // Without this, a broken path or a changed `:root {` shape would yield zero
    // tokens, every lookup would be skipped, and the suite would report success
    // — the same empty-is-valid failure this file exists to catch.
    expect(
      tokens.size,
      'too few tokens parsed from the light block of tokens.css — the block is being ' +
        'truncated. Baseline is ~174; review found a truncation to 67 that cleared a ' +
        'floor of 50, which is why this is not a token-ish-looking number.',
    ).toBeGreaterThan(150)
  })

  const findings: string[] = []
  // Both trees: components AND src/stories, which also hardcodes fallbacks.
  const files = [
    ...sourceFiles(resolve(ROOT, 'src/components')),
    ...sourceFiles(resolve(ROOT, 'src/stories')),
  ]

  for (const file of files) {
    const src = readFileSync(file, 'utf-8')
    // NESTED FALLBACKS ARE REPORTED, NOT SKIPPED. `var(--a, var(--b, #hex))`
    // does not match the literal-colour pattern below, so it would slip through
    // silently — an unrecognised shape reading as a pass, which is the deny-list
    // mistake that defeated the dist-guard check twice (see useNsDisabled.dist.test.ts).
    for (const m of src.matchAll(/var\(\s*(--ns-[\w-]+)\s*,\s*var\(/g)) {
      findings.push(
        `${file.replace(ROOT + '/', '')}: var(${m[1]}, var(...)) — the OUTER pair is not ` +
          'checkable by this test (an inner `var(--b, #hex)` still is). Flatten it, or ' +
          'extend this test — there is deliberately no exception list to add it to.',
      )
    }
    // var(--token, <fallback>) where the fallback is a literal colour, not a var()
    for (const m of src.matchAll(
      /var\(\s*(--ns-[\w-]+)\s*,\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\))\s*\)/g,
    )) {
      const [, token, fallback] = m
      const declared = tokens.get(token)
      if (declared === undefined) {
        findings.push(
          `${file.replace(ROOT + '/', '')}: var(${token}) — token not declared in tokens.css`,
        )
        continue
      }
      const resolved = resolveAlias(declared, tokens)
      if (
        fallback.toLowerCase() !== declared.toLowerCase() &&
        fallback.toLowerCase() !== resolved.toLowerCase()
      ) {
        findings.push(
          `${file.replace(ROOT + '/', '')}: var(${token}, ${fallback}) — token is ${declared}` +
            (resolved !== declared ? ` (${resolved})` : ''),
        )
      }
    }
  }

  it('found fallbacks to check, so a regex that matches nothing cannot pass silently', () => {
    // A deny-list one level up: if the pattern stops matching (syntax change,
    // sass reformat), `findings` is empty and the real assertion below goes
    // green while checking nothing.
    const total = files.reduce(
      (n, f) => n + [...readFileSync(f, 'utf-8').matchAll(/var\(\s*--ns-[\w-]+\s*,/g)].length,
      0,
    )
    expect(
      total,
      'no var() fallbacks matched anywhere in src/components or src/stories',
    ).toBeGreaterThan(10)
  })

  it('every literal fallback matches its token in the light block', () => {
    expect(
      findings,
      'A var() fallback disagrees with its token. Nothing renders these once tokens.css ' +
        'loads, so they are read by humans and quoted as fact — that is exactly how ' +
        'butiq-iko6 came to describe an inaccessible banner as accessible. Fix the ' +
        'fallback to match the light-block value, or drop it.\n' +
        findings.join('\n'),
    ).toEqual([])
  })
})

/**
 * THE SHOWCASE'S OWN `fallback:` FIELDS, which the scanner above structurally
 * cannot see: DesignTokens.stories.ts stores reference values as
 * `{ name, fallback }` object literals, not `var()` syntax, so the regex misses
 * them entirely.
 *
 * That gap had content. Review found --ns-shadow-md/lg/xl each quoting only the
 * FIRST layer of a two-layer shadow, in the page whose entire purpose is to be
 * the reference for what the design system's values are. Exactly the
 * read-by-humans-and-quoted-as-fact failure the file above was written for,
 * hiding in a shape it could not parse — and it was found by review, not by the
 * check I had just widened, which is the point.
 */
describe('the DesignTokens showcase quotes real token values', () => {
  const tokens = lightBlockTokens()
  const src = readFileSync(resolve(ROOT, 'src/stories/DesignTokens.stories.ts'), 'utf-8')
  const entries = [
    ...src.matchAll(/\{\s*name:\s*'(--ns-[\w-]+)',\s*fallback:\s*'([^']+)'\s*,?\s*\}/g),
  ]

  it('found entries to check, so a parse that matches nothing cannot pass', () => {
    expect(
      entries.length,
      'no { name, fallback } entries parsed from the showcase',
    ).toBeGreaterThan(100)
  })

  it('every showcase fallback matches the light-block token', () => {
    const norm = (v: string) => v.replace(/\s+/g, ' ').trim().toLowerCase()
    const bad: string[] = []
    for (const [, name, fallback] of entries) {
      const declared = tokens.get(name)
      if (declared === undefined) {
        bad.push(`${name} — not declared in tokens.css`)
        continue
      }
      const resolved = resolveAlias(declared, tokens)
      if (norm(fallback) !== norm(declared) && norm(fallback) !== norm(resolved)) {
        bad.push(`${name} — showcase says "${fallback}", token is "${declared}"`)
      }
    }
    expect(
      bad,
      'The Design Tokens page quotes a value the token does not have. This page is ' +
        'the reference consumers read, so a wrong entry here propagates as fact.\n' +
        bad.join('\n'),
    ).toEqual([])
  })
})

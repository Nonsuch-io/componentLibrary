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
  const css = readFileSync(TOKENS_CSS, 'utf-8')
  const start = css.indexOf(':root {')
  const end = css.indexOf('}', start)
  const tokens = new Map<string, string>()
  for (const m of css.slice(start, end).matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    tokens.set(m[1], m[2].trim())
  }
  return tokens
}

function vueFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...vueFiles(full))
    else if (entry.name.endsWith('.vue')) out.push(full)
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
    expect(tokens.size, 'no tokens parsed from the light block of tokens.css').toBeGreaterThan(50)
  })

  const findings: string[] = []
  const files = vueFiles(resolve(ROOT, 'src/components'))

  for (const file of files) {
    const src = readFileSync(file, 'utf-8')
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
    expect(total, 'no var() fallbacks matched anywhere in src/components').toBeGreaterThan(10)
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

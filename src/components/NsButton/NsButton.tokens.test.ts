import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * EVERY SOLID BACKGROUND MUST USE THE on-COLOUR TOKEN THAT MATCHES IT.
 *
 * componentLibrary-34n. Four button variants paired a background with an
 * unrelated on-colour token:
 *
 *     positive          status-positive   +  text-on-ACCENT
 *     warning           status-warning    +  text-on-ACCENT
 *     negative          status-negative   +  text-on-BRAND
 *     marketing-pushed  status-positive   +  text-on-ACCENT
 *
 * ALL FOUR RENDERED CORRECTLY, which is the entire problem. on-accent and
 * on-positive both resolved to #2d0b00; on-brand and on-negative both to
 * #ffffff. The pairs agreed by coincidence, so every declaration read sensibly
 * on its own and nothing looked wrong on any screen.
 *
 * A CONTRAST CHECK CANNOT CATCH THIS, by construction: while the tokens agree
 * the ratios are identical, so there is no number to fail. That is why this file
 * asserts token IDENTITY rather than measuring anything.
 *
 * THE COINCIDENCE HAS ALREADY BROKEN ONCE. componentLibrary-2p1 moved
 * --ns-color-text-on-negative to #2d0b00 in the dark blocks (white failed at
 * 2.76:1 on dark's light-salmon #fd6d73). The negative button still asked for
 * on-brand, so it kept the white and kept the 2.76:1 — a real dark-mode failure
 * produced by exactly the divergence this pairing was always vulnerable to.
 *
 * The fourth instance (marketing-pushed) was NOT in the bead. It was found by
 * checking every pair mechanically, which is the argument for this test rather
 * than a one-time fix.
 */
const SFC = readFileSync(resolve(__dirname, 'NsButton.vue'), 'utf-8')

/** Background tokens that name a surface an on-colour exists for. Excludes
 *  `bg-canvas`/`bg-disabled`, which are neutral surfaces carrying ordinary text
 *  tokens (text-brand, text-disabled) rather than an on-colour. */
const ON_COLOUR_SURFACES = ['brand', 'accent', 'positive', 'negative', 'warning', 'info'] as const

interface Pair {
  selector: string
  background: string
  colour: string
}

function pairs(): Pair[] {
  const out: Pair[] = []
  for (const m of SFC.matchAll(/(\.[a-zA-Z0-9_-]+(?::[a-z-]+)?)\s*\{([^}]*)\}/g)) {
    const [, selector, body] = m
    const bg = body.match(/background(?:-color)?:\s*var\((--ns-color-(?:status|bg)-([\w-]+))/)
    const fg = body.match(/(?<![\w-])color:\s*var\((--ns-color-text-on-([\w-]+))/)
    if (bg && fg) out.push({ selector, background: bg[2], colour: fg[2] })
  }
  return out
}

describe('NsButton on-colour tokens match their backgrounds (componentLibrary-34n)', () => {
  const found = pairs()

  it('extracted pairs at all, so a regex that matches nothing cannot pass', () => {
    // Without this the assertion below is vacuously green the moment the CSS is
    // reformatted, the selectors are renamed, or the file moves to sass — the
    // same empty-reads-as-valid failure this repo keeps finding.
    expect(
      found.length,
      'no background/on-colour pairs extracted from NsButton.vue',
    ).toBeGreaterThan(4)
  })

  it('covers every on-colour surface the component actually uses', () => {
    // A second anti-vacuity guard, aimed one level up: the assertion below only
    // proves something about pairs the regex RECOGNISED. If a variant stopped
    // being recognised it would silently drop out of the check rather than fail.
    const surfaces = new Set(found.map((p) => p.background))
    expect([...surfaces].some((s) => ON_COLOUR_SURFACES.includes(s as never))).toBe(true)
  })

  it.each(ON_COLOUR_SURFACES)('every %s background uses text-on-%s', (surface) => {
    const mismatched = found
      .filter((p) => p.background === surface && p.colour !== surface)
      .map((p) => `${p.selector}: background ${p.background} but colour text-on-${p.colour}`)
    expect(
      mismatched,
      `A button variant pairs a ${surface} background with a different on-colour token. ` +
        'While the two tokens happen to resolve to the same hex this renders correctly ' +
        'and no contrast check can see it — then breaks the day a designer moves one, ' +
        'which has already happened once (componentLibrary-2p1, the dark negative button ' +
        'at 2.76:1).\n' +
        mismatched.join('\n'),
    ).toEqual([])
  })
})

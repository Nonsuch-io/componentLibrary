import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Every solid background must use the on-colour token that MATCHES it.
 *
 * Four variants paired e.g. `status-positive` with `text-on-ACCENT` and rendered
 * correctly, because the two tokens coincidentally resolved to the same hex. A
 * contrast check cannot see that — while they agree there is no number to fail —
 * so this asserts token IDENTITY instead.
 *
 * The coincidence has already broken once: componentLibrary-2p1 moved dark
 * `text-on-negative`, and the negative button kept white at 2.76:1.
 *
 * SCOPE: base variant blocks only. Nested `&:hover` / `&:active` never match the
 * selector regex, and a state background like `accent-active` is not the surface
 * `accent` — `.ns-btn--accent:active` is a known instance left to
 * componentLibrary-7jc, because fixing it changes a colour. Story:
 * componentLibrary-34n.
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

  // THE EXACT SET, NOT A COUNT. A count floor let review drop .ns-btn--negative
  // out of the list (6 -> 5, still above the floor) by inserting a nested block
  // between `background:` and `color:` — 17 tests green, bug shipped.
  const EXPECTED = [
    '.ns-btn--primary',
    '.ns-btn--accent',
    '.ns-btn--positive',
    '.ns-btn--negative',
    '.ns-btn--warning',
    '.ns-btn--marketing-pushed',
  ]

  it('extracts exactly the variants we know about — a dropout fails here', () => {
    expect(
      [...new Set(found.map((p) => p.selector))].sort(),
      'The set of extracted background/on-colour pairs changed. If you ADDED a ' +
        'variant, add it here. If you did not, one has silently stopped being ' +
        'recognised — most likely a nested block between `background:` and ' +
        '`color:`, which truncates the body match — and is no longer checked.',
    ).toEqual([...EXPECTED].sort())
  })

  it.each(ON_COLOUR_SURFACES)(
    'every %s background uses its matching on-colour token',
    (surface) => {
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
    },
  )
})

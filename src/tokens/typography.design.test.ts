import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * THE DESIGN'S NAMED TYPE STYLES, MEASURED, PINNED AGAINST OUR RAMP.
 *
 * Every row is a `get_variable_defs` result from the nodes listed — the Figma
 * "Font(...)" the design actually ships, not a reading of a mockup. The ruling
 * on componentLibrary-3mg is that the design is authoritative, and this file is
 * what makes that ruling falsifiable: change a class away from its measured
 * style and the row names the node that contradicts you.
 *
 * WHY THIS EXISTS: two ramp entries were wrong for an unknown length of time
 * and nothing could say so. NsText.test.ts proves every variant HAS a rule;
 * it cannot say whether the rule is RIGHT. The first version of 3mg then
 * claimed "every body style disagrees" from two samples — nine of eleven
 * actually matched. Measuring all eleven is what corrected both the ramp and
 * the claim, and a measurement that lives only in a bead is one `--notes`
 * away from gone.
 *
 * Only MEASURED styles are here. Ramp entries with no design sample yet
 * (label-xs, overline, overline-lg, overline-md-bold, heading-sm,
 * heading-lg-regular, heading-xl-regular, heading-2xl*, display) are not
 * asserted, deliberately — pinning an unmeasured value would be pinning a
 * guess. Add a row when you measure one.
 */
const MEASURED: ReadonlyArray<{
  design: string
  cls: string
  px: number
  weight: number
  lineHeightPx: number
  nodes: string
}> = [
  {
    design: 'XL heading',
    cls: 'heading-xl',
    px: 32,
    weight: 600,
    lineHeightPx: 36.8,
    nodes: '265:30901',
  },
  {
    design: 'Large heading',
    cls: 'heading-lg',
    px: 24,
    weight: 600,
    lineHeightPx: 28.8,
    nodes: '185:10182',
  },
  {
    design: 'Medium heading',
    cls: 'heading-md',
    px: 20,
    weight: 600,
    lineHeightPx: 25,
    nodes: '187:14843 185:10182',
  },
  {
    design: 'Medium heading regular',
    cls: 'heading-md-regular',
    px: 20,
    weight: 400,
    lineHeightPx: 25,
    nodes: '265:30901 185:10182',
  },
  {
    design: 'Small heading regular',
    cls: 'heading-sm-regular',
    px: 16,
    weight: 400,
    lineHeightPx: 20.8,
    nodes: '163:9495 164:10056 194:15745 187:14843 185:10182',
  },
  {
    design: 'Medium label',
    cls: 'label-md',
    px: 14,
    weight: 600,
    lineHeightPx: 19.6,
    nodes: '187:14843 185:10182 63:2797',
  },
  {
    design: 'Small label',
    cls: 'label-sm',
    px: 12,
    weight: 600,
    lineHeightPx: 16.8,
    nodes: '194:15745',
  },
  {
    design: 'Overline label medium',
    cls: 'overline-md',
    px: 14,
    weight: 500,
    lineHeightPx: 18,
    nodes: '63:2797',
  },
  {
    design: 'Small body text',
    cls: 'body-sm',
    px: 12,
    weight: 400,
    lineHeightPx: 18,
    nodes: '185:10182',
  },
  {
    design: 'Medium body text',
    cls: 'body-md',
    px: 14,
    weight: 400,
    lineHeightPx: 19.6,
    nodes: '163:9495 164:10056 194:15745 187:14843 185:10182',
  },
  { design: 'Caption', cls: 'caption', px: 12, weight: 400, lineHeightPx: 16, nodes: '164:10056' },
]

const css = readFileSync(resolve(__dirname, 'typography.css'), 'utf8')

function rule(cls: string) {
  const m = new RegExp(`\\.ns-${cls} \\{([^}]*)\\}`).exec(css)
  if (!m) return null
  const b = m[1]
  const rem = /font-size:\s*([\d.]+)rem/.exec(b)
  const w = /font-weight:\s*(\d+)/.exec(b)
  const lh = /line-height:\s*([\d.]+)/.exec(b)
  return rem && w && lh
    ? { px: parseFloat(rem[1]) * 16, weight: parseInt(w[1], 10), lineHeight: parseFloat(lh[1]) }
    : null
}

describe('typography.css matches the design where the design has been measured', () => {
  it('checks a non-empty table', () => {
    expect(MEASURED.length).toBeGreaterThan(0)
  })

  it.each(MEASURED)('.ns-$cls is the design\'s "$design" ($px/$weight/$lineHeightPx)', (row) => {
    const r = rule(row.cls)
    expect(r, `.ns-${row.cls} has no parseable rule in typography.css`).not.toBeNull()
    const got = r!
    expect(got.px, `font-size differs from "${row.design}" (nodes ${row.nodes})`).toBeCloseTo(
      row.px,
      2,
    )
    expect(got.weight, `font-weight differs from "${row.design}" (nodes ${row.nodes})`).toBe(
      row.weight,
    )
    // The design expresses line-height in px; ours is unitless. Compare the
    // rendered line box at the class's own font size, to a tenth of a pixel —
    // Figma's 36.79999923706055 is 1.15 × 32.
    expect(
      got.lineHeight * got.px,
      `line box differs from "${row.design}" (nodes ${row.nodes}) — design ${row.lineHeightPx}px`,
    ).toBeCloseTo(row.lineHeightPx, 1)
  })
})

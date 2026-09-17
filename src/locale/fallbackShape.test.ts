import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, resolve } from 'path'

/**
 * A LOCALE FALLBACK MUST TREAT BLANK AS ABSENT (componentLibrary-d13).
 *
 *   props.label ?? locale.x.y          // '' is a VALUE: aria-label="" ships
 *   props.label?.trim() || locale.x.y  // '' is "not supplied": the locale wins
 *
 * The realistic trigger is `:label="t(key)"` resolving to '' before a
 * consumer's translations load. Found five times over four months — a
 * placeholder (NsMarketingEmailCapture), a <nav> landmark name
 * (NsOnboardingStepper), a heading (NsPlanBuilder), and two more caught at
 * review (NsBannerSelectedPlan, NsOrderSummaryTotals) — each fixed alone
 * until this sweep. Reading the source is the only test that catches the
 * NEXT one before a reviewer does.
 *
 * If empty is ever a MEANINGFUL value for some prop (a consumer who wants no
 * placeholder at all), that is a decision to write down next to the `??`
 * with an eslint-style opt-out comment on the same line: `// d13: blank is a value`.
 */
function vueFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) return vueFiles(full)
    return name.endsWith('.vue') ? [full] : []
  })
}

describe('locale fallbacks treat blank as absent (componentLibrary-d13)', () => {
  it('no component uses `?? locale.` — blank would beat the locale', () => {
    const root = resolve(__dirname, '../components')
    const offenders = vueFiles(root).flatMap((file) => {
      const lines = readFileSync(file, 'utf8').split('\n')
      return lines
        .map((line, i) => ({ line, n: i + 1 }))
        .filter(({ line }) => /\?\?\s*locale\./.test(line) && !/d13: blank is a value/.test(line))
        .map(({ line, n }) => `${file.slice(root.length + 1)}:${n}: ${line.trim()}`)
    })
    expect(offenders, 'use `?.trim() || locale.…`, or say why blank is a value').toEqual([])
  })
})

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
    // Whole-file, not per-line: prettier at 100 columns breaks a long fallback
    // as `… ??` / `locale.…` on the next line, and lint-staged runs it on every
    // commit — review reproduced a reintroduction sailing through a per-line
    // scan. `\s` spans the newline; the opt-out may sit on either line.
    const offenders = vueFiles(root).flatMap((file) => {
      const source = readFileSync(file, 'utf8')
      const lines = source.split('\n')
      return [...source.matchAll(/\?\?\s*locale\./g)].flatMap((m) => {
        const start = source.slice(0, m.index).split('\n').length
        const end = start + m[0].split('\n').length - 1
        const window = lines.slice(start - 1, end)
        if (window.some((line) => /d13: blank is a value/.test(line))) return []
        return [`${file.slice(root.length + 1)}:${start}: ${window.map((l) => l.trim()).join(' ')}`]
      })
    })
    expect(offenders, 'use `?.trim() || locale.…`, or say why blank is a value').toEqual([])
  })
})

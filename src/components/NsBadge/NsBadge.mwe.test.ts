import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import NsBadge from './NsBadge.vue'

/**
 * componentLibrary-mwe. Figma specifies nine badge colours; Quasar's palette has
 * seven. `ghost` and `neutral` fell through to Quasar, which emitted
 * `.bg-ghost` / `.bg-neutral` — classes that match no CSS anywhere — so those
 * badges rendered UNSTYLED with no error and no warning.
 */
describe('NsBadge ghost/neutral (componentLibrary-mwe)', () => {
  const q = (w: ReturnType<typeof mount>) => w.findComponent({ name: 'QBadge' })

  it.each(['ghost', 'neutral'])(
    'handles color="%s" itself instead of handing Quasar a class that matches nothing',
    (colour) => {
      const w = mount(NsBadge, { attrs: { color: colour } })
      expect(w.classes(), `no ns-badge--${colour} class`).toContain(`ns-badge--${colour}`)
      expect(
        q(w).props('color'),
        `"${colour}" was still forwarded to Quasar, which will emit .bg-${colour}`,
      ).toBeUndefined()
    },
  )

  it('does not leave a raw color attribute on the DOM for ns-only values', () => {
    // Vue applies $attrs to the root IN ADDITION to an explicit v-bind, so
    // without inheritAttrs:false the withheld colour reaches Quasar anyway.
    const w = mount(NsBadge, { attrs: { color: 'ghost' } })
    expect(w.attributes('color'), 'raw color leaked through $attrs').toBeUndefined()
  })

  it.each(['primary', 'positive', 'grey-4', 'orange'])(
    'still forwards "%s" to Quasar untouched',
    (colour) => {
      // 62 of butiq's 104 badge sites bind :color, and 11 use Quasar palette
      // names Figma has no opinion about. Those must keep working exactly as
      // before — this fix is narrow on purpose.
      const w = mount(NsBadge, { attrs: { color: colour } })
      expect(q(w).props('color')).toBe(colour)
      expect(w.classes().filter((c) => c.startsWith('ns-badge--'))).toEqual([])
    },
  )

  it('defines CSS for exactly the two colours Quasar cannot express', () => {
    // happy-dom has no cascade, so the class assertions above cannot prove the
    // styling exists. Asserting the style block does — and enumerating rather
    // than spot-checking also catches a stray variant added later.
    const sfc = readFileSync(resolve(process.cwd(), 'src/components/NsBadge/NsBadge.vue'), 'utf-8')
    const style = sfc.slice(sfc.indexOf('<style'))
    const variants = [...style.matchAll(/^\s*&--([a-z]+)/gm)].map((m) => m[1]).sort()
    expect(variants, `style block defines: ${variants.join(', ')}`).toEqual(['ghost', 'neutral'])
    expect(style, 'neutral must use the token that already existed').toContain(
      '--ns-color-status-neutral',
    )
  })
})

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TypographyScale from './TypographyScale.vue'
import { KNOWN_VARIANTS } from '../components/NsText/variants'

describe('TypographyScale', () => {
  // This page was a hand-maintained fifth copy of NsText's vocabulary and had
  // already lost four variants without anyone noticing — a docs page that
  // silently omits shipped type styles is worse than no page, because it reads
  // as complete. It derives from KNOWN_VARIANTS now; these assert it stays that
  // way and that no row renders with an empty description.
  it('documents every variant the library ships', () => {
    const text = mount(TypographyScale).text()
    for (const variant of KNOWN_VARIANTS) {
      expect(text, `the type scale page does not document ${variant}`).toContain(variant)
    }
  })

  it('gives every documented variant a non-empty description', () => {
    const rows = mount(TypographyScale).findAll('.props')
    expect(rows.length).toBe(KNOWN_VARIANTS.length)
    for (const row of rows) {
      expect(row.text().trim(), 'a variant rendered with a blank description cell').not.toBe('')
    }
  })

  it('checks a non-empty vocabulary', () => {
    expect(KNOWN_VARIANTS.length).toBeGreaterThan(0)
  })
})

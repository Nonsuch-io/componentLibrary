import { describe, it, expect } from 'vitest'
import { nsComponentManifest, nsTemplateTagManifest, generateQuasarBanRules } from './manifest'

describe('nsComponentManifest', () => {
  it('maps every Quasar PascalCase name to an Ns equivalent', () => {
    for (const [quasar, ns] of Object.entries(nsComponentManifest)) {
      expect(quasar).toMatch(/^Q[A-Z]/)
      expect(ns).toMatch(/^Ns[A-Z]/)
    }
  })

  it('contains all existing and placeholder components', () => {
    expect(Object.keys(nsComponentManifest).length).toBeGreaterThanOrEqual(48)
  })
})

describe('nsTemplateTagManifest', () => {
  it('converts PascalCase to kebab-case tags', () => {
    expect(nsTemplateTagManifest['q-btn']).toBe('ns-button')
    expect(nsTemplateTagManifest['q-card']).toBe('ns-card')
    expect(nsTemplateTagManifest['q-breadcrumbs-el']).toBe('ns-breadcrumb-element')
    expect(nsTemplateTagManifest['q-td']).toBe('ns-table-cell')
  })
})

describe('generateQuasarBanRules', () => {
  it('returns an array of ESLint rule entries', () => {
    const rules = generateQuasarBanRules()
    expect(rules.length).toBe(Object.keys(nsComponentManifest).length)
    for (const rule of rules) {
      expect(rule).toHaveProperty('element')
      expect(rule).toHaveProperty('message')
      expect(rule.message).toContain('instead of')
    }
  })

  it('references the correct Ns tag in each message', () => {
    const rules = generateQuasarBanRules()
    const btnRule = rules.find((r) => r.element === 'q-btn')
    expect(btnRule?.message).toContain('<ns-button>')
  })
})

import { describe, it, expect } from 'vitest'
import { createQuasarConfig } from './quasarConfig'

describe('createQuasarConfig()', () => {
  it('returns a config object with brand colours', () => {
    const config = createQuasarConfig()
    expect(config.config).toBeDefined()

    const inner = config.config as { brand: Record<string, string> }
    expect(inner.brand.primary).toBe('#d56307')
    expect(inner.brand.secondary).toBe('#93dbff')
    expect(inner.brand.accent).toBe('#93dbff')
    expect(inner.brand.positive).toBe('#d8dc36')
    expect(inner.brand.negative).toBe('#c7151c')
    expect(inner.brand.info).toBe('#0069b4')
    expect(inner.brand.warning).toBe('#f7bc2b')
  })

  it('includes plugins key', () => {
    const config = createQuasarConfig()
    expect(config.plugins).toEqual({})
  })

  it('allows brand colour overrides', () => {
    const config = createQuasarConfig({
      brand: { primary: '#custom' },
    })

    const inner = config.config as { brand: Record<string, string> }
    expect(inner.brand.primary).toBe('#custom')
    // Other brand colours remain
    expect(inner.brand.secondary).toBe('#93dbff')
  })

  it('allows plugin overrides', () => {
    const config = createQuasarConfig({
      plugins: { Notify: {} },
    })
    expect(config.plugins).toEqual({ Notify: {} })
  })

  it('passes through extra keys', () => {
    const config = createQuasarConfig({
      lang: 'fr',
    })
    expect(config.lang).toBe('fr')
  })
})

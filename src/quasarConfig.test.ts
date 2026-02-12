import { describe, it, expect } from 'vitest'
import { createQuasarConfig } from './quasarConfig'

describe('createQuasarConfig()', () => {
  it('returns a config object with brand colours', () => {
    const config = createQuasarConfig()
    expect(config.config).toBeDefined()

    const inner = config.config as { brand: Record<string, string> }
    expect(inner.brand.primary).toBe('#3b82f6')
    expect(inner.brand.secondary).toBe('#8b5cf6')
    expect(inner.brand.accent).toBe('#f59e0b')
    expect(inner.brand.positive).toBe('#22c55e')
    expect(inner.brand.negative).toBe('#ef4444')
    expect(inner.brand.info).toBe('#3b82f6')
    expect(inner.brand.warning).toBe('#f59e0b')
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
    expect(inner.brand.secondary).toBe('#8b5cf6')
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

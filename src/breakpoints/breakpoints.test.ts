import { describe, it, expect } from 'vitest'
import {
  nsBreakpoints,
  nsBreakpointNames,
  nsMediaUp,
  nsMediaDown,
  nsMediaOnly,
  nsMediaBetween,
} from './index'
import type { NsBreakpointName } from './index'

describe('breakpoints', () => {
  describe('nsBreakpoints', () => {
    it('defines all seven breakpoint values', () => {
      expect(Object.keys(nsBreakpoints)).toHaveLength(7)
      expect(nsBreakpoints).toHaveProperty('xs')
      expect(nsBreakpoints).toHaveProperty('sm')
      expect(nsBreakpoints).toHaveProperty('md')
      expect(nsBreakpoints).toHaveProperty('lg')
      expect(nsBreakpoints).toHaveProperty('xl')
      expect(nsBreakpoints).toHaveProperty('xxl')
      expect(nsBreakpoints).toHaveProperty('xxxl')
    })

    it('matches Quasar default breakpoints plus Nonsuch extensions', () => {
      expect(nsBreakpoints.xs).toBe(0)
      expect(nsBreakpoints.sm).toBe(600)
      expect(nsBreakpoints.md).toBe(1024)
      expect(nsBreakpoints.lg).toBe(1440)
      expect(nsBreakpoints.xl).toBe(1920)
      expect(nsBreakpoints.xxl).toBe(2560)
      expect(nsBreakpoints.xxxl).toBe(3840)
    })

    it('values are in ascending order', () => {
      const values = nsBreakpointNames.map((name) => nsBreakpoints[name])
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThan(values[i - 1])
      }
    })
  })

  describe('nsBreakpointNames', () => {
    it('contains all names in order', () => {
      expect(nsBreakpointNames).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl'])
    })
  })

  describe('nsMediaUp', () => {
    it.each([
      ['xs', '(min-width: 0px)'],
      ['sm', '(min-width: 600px)'],
      ['md', '(min-width: 1024px)'],
      ['lg', '(min-width: 1440px)'],
      ['xl', '(min-width: 1920px)'],
      ['xxl', '(min-width: 2560px)'],
      ['xxxl', '(min-width: 3840px)'],
    ] as [NsBreakpointName, string][])('nsMediaUp("%s") → %s', (name, expected) => {
      expect(nsMediaUp(name)).toBe(expected)
    })
  })

  describe('nsMediaDown', () => {
    it.each([
      ['sm', '(max-width: 599px)'],
      ['md', '(max-width: 1023px)'],
      ['lg', '(max-width: 1439px)'],
      ['xl', '(max-width: 1919px)'],
      ['xxl', '(max-width: 2559px)'],
      ['xxxl', '(max-width: 3839px)'],
    ] as [Exclude<NsBreakpointName, 'xs'>, string][])(
      'nsMediaDown("%s") → %s',
      (name, expected) => {
        expect(nsMediaDown(name)).toBe(expected)
      },
    )
  })

  describe('nsMediaOnly', () => {
    it.each([
      ['xs', '(min-width: 0px) and (max-width: 599px)'],
      ['sm', '(min-width: 600px) and (max-width: 1023px)'],
      ['md', '(min-width: 1024px) and (max-width: 1439px)'],
      ['lg', '(min-width: 1440px) and (max-width: 1919px)'],
      ['xl', '(min-width: 1920px) and (max-width: 2559px)'],
      ['xxl', '(min-width: 2560px) and (max-width: 3839px)'],
      ['xxxl', '(min-width: 3840px)'],
    ] as [NsBreakpointName, string][])('nsMediaOnly("%s") → %s', (name, expected) => {
      expect(nsMediaOnly(name)).toBe(expected)
    })
  })

  describe('nsMediaBetween', () => {
    it('generates a range between two breakpoints', () => {
      expect(nsMediaBetween('sm', 'lg')).toBe('(min-width: 600px) and (max-width: 1919px)')
    })

    it('handles range ending at xxxl (no upper bound)', () => {
      expect(nsMediaBetween('md', 'xxxl')).toBe('(min-width: 1024px)')
    })

    it('handles range to xxl', () => {
      expect(nsMediaBetween('sm', 'xxl')).toBe('(min-width: 600px) and (max-width: 3839px)')
    })

    it('handles single breakpoint range', () => {
      expect(nsMediaBetween('md', 'md')).toBe('(min-width: 1024px) and (max-width: 1439px)')
    })
  })
})

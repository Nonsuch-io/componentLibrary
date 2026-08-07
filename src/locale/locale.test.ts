import { describe, it, expect } from 'vitest'
import type { NsLocaleMessages } from './NsLocaleMessages'
import { nsLocaleEnCA } from './en-CA'
import { nsLocaleFrCA } from './fr-CA'

describe('nsLocaleEnCA', () => {
  it('satisfies NsLocaleMessages interface', () => {
    const locale: NsLocaleMessages = nsLocaleEnCA
    expect(locale).toBeDefined()
  })

  it('has all common strings', () => {
    expect(nsLocaleEnCA.common.loading).toBe('Loading…')
    expect(nsLocaleEnCA.common.retry).toBe('Retry')
    expect(nsLocaleEnCA.common.cancel).toBe('Cancel')
    expect(nsLocaleEnCA.common.confirm).toBe('Confirm')
    expect(nsLocaleEnCA.common.save).toBe('Save')
    expect(nsLocaleEnCA.common.delete).toBe('Delete')
    expect(nsLocaleEnCA.common.edit).toBe('Edit')
    expect(nsLocaleEnCA.common.search).toBe('Search')
    expect(nsLocaleEnCA.common.noResults).toBe('No results found')
    expect(nsLocaleEnCA.common.showMore).toBe('Show more')
    expect(nsLocaleEnCA.common.showLess).toBe('Show less')
  })

  it('has all product strings', () => {
    expect(nsLocaleEnCA.product.addToCart).toBe('Add to cart')
    expect(nsLocaleEnCA.product.outOfStock).toBe('Out of stock')
    expect(nsLocaleEnCA.product.inStock).toBe('In stock')
    expect(nsLocaleEnCA.product.quantity).toBe('Quantity')
    expect(nsLocaleEnCA.product.price).toBe('Price')
    expect(nsLocaleEnCA.product.sale).toBe('Sale')
  })

  it('has all media strings', () => {
    expect(nsLocaleEnCA.media.zoomIn).toBe('Zoom in')
    expect(nsLocaleEnCA.media.zoomOut).toBe('Zoom out')
    expect(nsLocaleEnCA.media.fullscreen).toBe('Fullscreen')
    expect(nsLocaleEnCA.media.exitFullscreen).toBe('Exit fullscreen')
    expect(nsLocaleEnCA.media.previousImage).toBe('Previous image')
    expect(nsLocaleEnCA.media.nextImage).toBe('Next image')
  })

  it('has all validation strings', () => {
    expect(nsLocaleEnCA.validation.required).toBe('This field is required')
    expect(nsLocaleEnCA.validation.invalidEmail).toBe('Please enter a valid email address')
    expect(nsLocaleEnCA.validation.tooShort).toBe('Too short')
    expect(nsLocaleEnCA.validation.tooLong).toBe('Too long')
  })

  it('has navigation strings', () => {
    expect(nsLocaleEnCA.navigation.breadcrumbs).toBe('Breadcrumb')
  })

  it('every top-level key contains only string values (no nesting beyond 1 level)', () => {
    for (const section of Object.values(nsLocaleEnCA)) {
      for (const value of Object.values(section)) {
        expect(typeof value).toBe('string')
        expect((value as string).length).toBeGreaterThan(0)
      }
    }
  })
})

describe('nsLocaleFrCA', () => {
  it('satisfies NsLocaleMessages interface', () => {
    const locale: NsLocaleMessages = nsLocaleFrCA
    expect(locale).toBeDefined()
  })

  it('has French common strings', () => {
    expect(nsLocaleFrCA.common.loading).toBe('Chargement…')
    expect(nsLocaleFrCA.common.cancel).toBe('Annuler')
    expect(nsLocaleFrCA.common.save).toBe('Enregistrer')
    expect(nsLocaleFrCA.common.search).toBe('Rechercher')
  })

  it('has French product strings', () => {
    expect(nsLocaleFrCA.product.addToCart).toBe('Ajouter au panier')
    expect(nsLocaleFrCA.product.outOfStock).toBe('Rupture de stock')
    expect(nsLocaleFrCA.product.inStock).toBe('En stock')
  })

  it('has French media strings', () => {
    expect(nsLocaleFrCA.media.zoomIn).toBe('Agrandir')
    expect(nsLocaleFrCA.media.fullscreen).toBe('Plein écran')
  })

  it('has French validation strings', () => {
    expect(nsLocaleFrCA.validation.required).toBe('Ce champ est requis')
    expect(nsLocaleFrCA.validation.invalidEmail).toBe('Veuillez entrer une adresse courriel valide')
  })

  it('has French navigation strings', () => {
    expect(nsLocaleFrCA.navigation.breadcrumbs).toBe("Fil d'Ariane")
  })

  it('every top-level key contains only string values', () => {
    for (const section of Object.values(nsLocaleFrCA)) {
      for (const value of Object.values(section)) {
        expect(typeof value).toBe('string')
        expect((value as string).length).toBeGreaterThan(0)
      }
    }
  })
})

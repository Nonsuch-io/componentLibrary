import type { NsLocaleMessages } from './NsLocaleMessages'

/**
 * English (Canada) locale for Ns-specific strings.
 *
 * This is the built-in fallback — components use these values
 * when no locale is provided via provideNsLocale().
 */
export const nsLocaleEnCA: NsLocaleMessages = {
  common: {
    loading: 'Loading…',
    retry: 'Retry',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    noResults: 'No results found',
    showMore: 'Show more',
    showLess: 'Show less',
  },

  product: {
    addToCart: 'Add to cart',
    outOfStock: 'Out of stock',
    inStock: 'In stock',
    quantity: 'Quantity',
    price: 'Price',
    sale: 'Sale',
  },

  media: {
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    fullscreen: 'Fullscreen',
    exitFullscreen: 'Exit fullscreen',
    previousImage: 'Previous image',
    nextImage: 'Next image',
  },

  validation: {
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email address',
    tooShort: 'Too short',
    tooLong: 'Too long',
  },

  marketing: {
    emailAddress: 'Email address',
    emailPlaceholder: 'your@email.com',
  },

  navigation: {
    breadcrumbs: 'Breadcrumb',
    collapseMenu: 'Hide Menu',
    expandMenu: 'Expand menu',
    closeMenu: 'Close menu',
    openMenu: 'Open menu',
  },
}

/**
 * NsLocaleMessages — typed interface for all Ns-specific strings.
 *
 * The library ships default locale objects (nsLocaleEnCA, nsLocaleFrCA).
 * Consuming apps can merge this into their vue-i18n messages
 * under a namespace like `$ns`, or provide translations via
 * the `provideNsLocale()` helper.
 *
 * The library itself never imports or calls vue-i18n — it stays
 * fully decoupled. Components resolve strings via:
 *   1. Explicit prop (highest priority)
 *   2. Injected NsLocaleMessages (via provideNsLocale)
 *   3. Built-in English defaults (nsLocaleEnCA)
 *
 * Quasar-originated strings (e.g. "Close", "Clear") continue to
 * use $q.lang.* and are NOT duplicated here.
 */
export interface NsLocaleMessages {
  /** Common strings shared across components */
  common: {
    loading: string
    retry: string
    cancel: string
    confirm: string
    save: string
    delete: string
    edit: string
    search: string
    noResults: string
    showMore: string
    showLess: string
  }

  /** Product-related strings (NsProductCard, etc.) */
  product: {
    addToCart: string
    outOfStock: string
    inStock: string
    quantity: string
    price: string
    sale: string
  }

  /** Media/image viewer strings */
  media: {
    zoomIn: string
    zoomOut: string
    fullscreen: string
    exitFullscreen: string
    previousImage: string
    nextImage: string
  }

  /** Form validation messages */
  validation: {
    required: string
    invalidEmail: string
    tooShort: string
    tooLong: string
  }

  /** Marketing-component strings (NsMarketingEmailCapture, etc.) */
  marketing: {
    emailAddress: string
    emailPlaceholder: string
  }

  /** Navigation-component strings (NsBreadcrumbs, etc.) */
  navigation: {
    /** Accessible name for the breadcrumb <nav> landmark. */
    breadcrumbs: string
    /**
     * VISIBLE text on the sidebar toggle when the sidebar is expanded.
     *
     * This is the accessible name too — the button takes its name from this
     * content rather than an aria-label, so the two cannot drift apart. See
     * NsNavSidebar and WCAG 2.5.3.
     */
    collapseMenu: string
    /**
     * Accessible name for the sidebar toggle when COLLAPSED, where the button
     * is icon-only and has no visible text to be named from.
     */
    expandMenu: string
    /**
     * Accessible name for the app-shell hamburger when the drawer is OPEN.
     * Separate from collapseMenu, which is the sidebar's VISIBLE text and reads
     * oddly as an icon-only button's name.
     */
    closeMenu: string
    /** Accessible name for the app-shell hamburger when the drawer is CLOSED. */
    openMenu: string
  }
}

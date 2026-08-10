declare const process: { env: { NODE_ENV?: string } } | undefined

/**
 * Dev-only, warn-once check that the library's own stylesheet was actually
 * loaded by the consumer.
 *
 * WHY THIS EXISTS (componentLibrary-07u). butiq's storefront and homepage
 * NEVER imported `@nonsuch/component-library/style.css`. Every Ns component
 * in those apps rendered without its own CSS for months and nothing warned,
 * nothing failed — jsdom has no cascade, so no test could see it either.
 *
 * It stayed invisible because most components WRAP a Quasar one and borrow
 * `quasar.css`, which the consumer DID load — so 33 of 34 components used
 * still had most of their rules. `NsBreadcrumbs` was such a wrapper until it
 * was rewritten as custom nav/ol markup; the moment it stopped borrowing, it
 * had nothing, and a breadcrumb rendered as a bare numbered list on a live
 * page. See ADR 0002.
 *
 * THE SENTINEL. `:root { --ns-styles-loaded: 1 }` ships from a component's
 * (unscoped — see NsThemeProvider.vue) style block, so it lands in the built
 * `dist/nonsuch-components.css`. If a consumer's page resolves that custom
 * property, the stylesheet is loaded. If it does not, it isn't — regardless
 * of which components happen to look "almost right" because they borrow
 * Quasar's styling.
 *
 * WHERE THIS IS CALLED FROM matters: `createNonsuch()`, not per-component.
 * That is the one place every consumer already calls, once, on install — so
 * this fires (at most) once per app rather than once per mounted component.
 */
const SENTINEL_PROPERTY = '--ns-styles-loaded'

let warned = false

/**
 * Test seam: clears the warn-once memory. TESTS ONLY — not exported from the
 * public entry. Module-level state leaks between tests in a file; reset it
 * in `beforeEach`.
 */
export function __resetNsStylesheetWarning(): void {
  warned = false
}

export function warnIfNsStylesheetMissing(): void {
  // Same shape and polarity as useNsDisabled.ts / useNsAttrConflictWarning.ts,
  // deliberately: FAIL OPEN, warn unless we can PROVE production. The inverted
  // form (`typeof process === 'undefined' || ...`) returns early in a browser,
  // where `typeof process` genuinely IS 'undefined' — so the warning would be
  // dead for every real consumer while every Node-based test passed.
  if (typeof process !== 'undefined' && process?.env?.NODE_ENV === 'production') return

  // SSR-SAFE. `createNonsuch()` runs during Nuxt SSR, where `document` does
  // not exist. There is nothing to probe on the server, and warning on every
  // request would be far worse noise than the bug this exists to catch.
  if (typeof document === 'undefined') return

  if (warned) return

  const loaded = getComputedStyle(document.documentElement)
    .getPropertyValue(SENTINEL_PROPERTY)
    .trim()
  if (loaded !== '') return

  warned = true
  console.warn(
    '[nonsuch] "@nonsuch/component-library/style.css" does not appear to be loaded. ' +
      'Components will render without their own styles. Most will look ALMOST right, ' +
      "because they borrow Quasar's stylesheet instead of their own — but any component " +
      'that does not wrap a Quasar element will render completely unstyled. Import ' +
      '"@nonsuch/component-library/style.css" once, near your app entry.',
  )
}

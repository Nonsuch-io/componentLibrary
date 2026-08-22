declare const process: { env: { NODE_ENV?: string } } | undefined

/**
 * Dev-only, warn-once: the consumer never imported our `style.css`.
 *
 * Detected via the `--ns-styles-loaded` sentinel, NOT by eyeballing components —
 * most wrap a Quasar one and borrow `quasar.css`, so "looks almost right" is not
 * evidence. MUST be called from `createNonsuch()`, not per-component, so it
 * fires once per app. Story: componentLibrary-07u.
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

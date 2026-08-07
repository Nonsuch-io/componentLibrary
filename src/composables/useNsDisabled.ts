import { computed, useAttrs, type ComputedRef } from 'vue'

declare const process: { env: { NODE_ENV?: string } } | undefined

/**
 * Resolves a control's disabled state, accepting Quasar's `disable` AND the
 * `disabled` spelling everyone actually reaches for.
 *
 * WHY THIS EXISTS. Quasar uses `disable` and never `disabled` — verified in its
 * types: 40 occurrences of `disable?:`, zero of `disabled?:`. Our wrappers spread
 * `$attrs`, so `disabled` falls through as a plain HTML attribute. Measured in a
 * real browser (componentLibrary-ob8):
 *
 *   <NsInput disabled />     input.disabled FALSE, no .disabled class, no aria-disabled
 *   <NsInput disable  />     input.disabled TRUE,  .disabled class,    aria-disabled="true"
 *
 * QInput/QCheckbox/QSelect render a wrapper div with the control nested inside,
 * so `disabled` lands on the wrapper where it means nothing and the inner control
 * stays LIVE. A form silently accepts input it was meant to refuse, with no
 * error, no warning and no type complaint. `disabled` is also what the Figma
 * variant is called, so the design system actively leads people to the spelling
 * that does nothing.
 *
 * NsButton is the mild case — QBtn renders a real `<button>`, so `disabled`
 * natively disables it and only Quasar's styling class is missed.
 *
 * WHY ALIAS RATHER THAN ONLY WARN. Silently doing nothing is the worst outcome;
 * a warning alone still leaves the control live for anyone not watching a
 * console. Aliasing makes the natural spelling correct, and the warning stops it
 * from spreading. That is ADR 0002 rule 2 — one system wins, loudly.
 */
const warned = new Set<string>()

/** Test seam: the warning dedupes per component+attr, which leaks across tests. */
export function __resetNsDisabledWarnings(): void {
  warned.clear()
}

function warnOnce(componentName: string): void {
  // process.env.NODE_ENV, NOT import.meta.env — the latter is inlined when THIS
  // LIBRARY builds, so the branch is tree-shaken out of dist/ and the warning
  // never reaches a consumer while still passing tests from source. See
  // useNsAttrConflictWarning, which documents the measurement.
  if (typeof process === 'undefined' || process?.env?.NODE_ENV === 'production') return
  if (warned.has(componentName)) return
  warned.add(componentName)
  console.warn(
    `[${componentName}] "disabled" is not a Quasar prop and does nothing on its own — ` +
      `the underlying control stays interactive. It has been treated as "disable" ` +
      `for you, but use the "disable" prop instead. (componentLibrary-ob8)`,
  )
}

/**
 * @param componentName used in the dev warning, e.g. `'NsInput'`
 * @param disable the component's own declared `disable` prop
 */
export function useNsDisabled(
  componentName: string,
  disable: () => boolean | undefined,
): ComputedRef<boolean> {
  const attrs = useAttrs()

  return computed(() => {
    if (disable() === true) return true

    // Vue does NOT camelCase attrs that fall through to $attrs, so `disabled`
    // arrives exactly as written. An empty string is what a bare `disabled`
    // attribute produces in a template, and it means true.
    const raw = attrs.disabled
    if (raw === undefined || raw === false || raw === null || raw === 'false') return false

    warnOnce(componentName)
    return true
  })
}

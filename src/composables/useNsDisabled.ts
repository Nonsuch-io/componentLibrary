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

/**
 * Test seam: the warning dedupes per COMPONENT NAME — the Set is keyed by that
 * alone, not by component+attr as an earlier comment claimed. Module-level, so
 * it leaks between tests in a file; reset it in beforeEach.
 */
export function __resetNsDisabledWarnings(): void {
  warned.clear()
}

function warnOnce(componentName: string): void {
  // process.env.NODE_ENV, NOT import.meta.env — the latter is inlined when THIS
  // LIBRARY builds, so the branch is tree-shaken out of dist/ and the warning
  // never reaches a consumer while still passing tests from source.
  //
  // FAIL OPEN: warn unless we can PROVE production. The inverted form
  // (`typeof process === 'undefined' || ...`) returns early in a browser, where
  // `typeof process` genuinely IS 'undefined' — so the warning was dead for
  // every real consumer while every test passed, because vitest runs in Node.
  if (typeof process !== 'undefined' && process?.env?.NODE_ENV === 'production') return
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
export interface NsDisabledBinding {
  /** Bind to the Quasar component's `disable` prop. */
  resolvedDisable: ComputedRef<boolean>
  /**
   * Spread INSTEAD of `$attrs`, so the raw `disabled` attribute does not also
   * reach the DOM.
   *
   * Leaving it in was a measurable bug, not untidiness: on NsButton, QBtn
   * renders a real `<button>`, so `disabled="false"` gave `disable === false`
   * (our carve-out) while the raw string fell through and set
   * `element.disabled = true` — a button styled fully enabled that does not
   * respond to clicks. The library's own semantics and the rendered DOM
   * disagreed. Every test asserted at the Vue-prop level and could not see it.
   */
  attrsWithoutDisabled: ComputedRef<Record<string, unknown>>
}

export function useNsDisabled(
  componentName: string,
  disable: () => boolean | undefined,
): NsDisabledBinding {
  const attrs = useAttrs()

  const resolvedDisable = computed(() => {
    if (disable() === true) return true

    // Vue does NOT camelCase attrs that fall through to $attrs, so `disabled`
    // arrives exactly as written.
    const raw = attrs.disabled
    if (raw === undefined) return false

    // MATCH VUE'S OWN BOOLEAN-ATTR COERCION (`!!value || value === ''`), plus
    // one deliberate carve-out. The first version treated every non-false value
    // as disabled, so `:disabled="form.errors.length"` with ZERO errors rendered
    // a disabled field — and then told the consumer it had been "treated as
    // disable for you", which is affirmatively wrong for a falsy binding.
    //
    // The carve-out is the literal string 'false': HTML says any value disables,
    // so `disabled="false"` natively means DISABLED, which is a footgun no
    // template author intends. We override it to mean enabled.
    const isDisabled = raw === '' || (Boolean(raw) && raw !== 'false')
    if (!isDisabled) return false

    warnOnce(componentName)
    return true
  })

  const attrsWithoutDisabled = computed(() => {
    if (attrs.disabled === undefined) return attrs
    const { disabled: _dropped, ...rest } = attrs
    return rest
  })

  return { resolvedDisable, attrsWithoutDisabled }
}

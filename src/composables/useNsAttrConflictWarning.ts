import { useAttrs } from 'vue'

/**
 * Describes a Quasar attribute (or the set of spellings it may arrive as
 * in `$attrs`) that silently competes with one of this library's own props
 * when a consumer supplies both to the same component.
 */
export interface NsAttrConflict {
  /**
   * The attr key(s) that trigger the warning, exactly as they may appear in
   * `$attrs`. Vue's template compiler does NOT camelCase attributes that
   * fall through to `$attrs` (only declared props get that treatment), so
   * multi-word attrs must list both the kebab-case (template-authored) and
   * camelCase (render-function/JSX-authored) spellings — e.g.
   * `['text-color', 'textColor']`.
   */
  attrs: readonly string[]
  /**
   * The Ns prop consumers should use instead of the conflicting attr.
   *
   * OMIT IT when there is no equivalent. `round` had `useInstead: 'iconOnly'`,
   * and that advice was WRONG: iconOnly is a SQUARE icon-only layout, round is a
   * CIRCLE. Following it silently turns a circular button square — a visual
   * regression the library was actively recommending on 89 butiq call sites.
   * The same reasoning took `round` off the never-list in componentLibrary-nbr;
   * the warning was not updated to match, so it kept giving advice the guard
   * itself had already rejected.
   */
  useInstead?: string
  /**
   * Why the attr conflicts, when no replacement exists yet. Shown instead of
   * "use X instead", so the warning stays honest about the absence.
   */
  because?: string
}

function buildConflictWarning(
  componentName: string,
  attrKey: string,
  conflict: NsAttrConflict,
): string {
  const head =
    `[${componentName}] "${attrKey}" was passed through to the underlying Quasar component, ` +
    `where it competes with this component's own styling. Both systems can apply at once and ` +
    `silently produce unreadable output (e.g. matching text and background colours).`

  // NEVER RECOMMEND A PROP THAT IS NOT EQUIVALENT. A warning that names a
  // replacement is an instruction, and a wrong instruction is worse than no
  // warning: it converts "something is off here" into "do this specific thing",
  // which people then do.
  return conflict.useInstead
    ? `${head} Use the "${conflict.useInstead}" prop instead of "${attrKey}".`
    : `${head} ${conflict.because ?? `There is no equivalent Ns prop for "${attrKey}" yet.`}`
}

/**
 * Dev-only guard: warns when a consumer passes a Quasar attribute that
 * conflicts with one of this component's own curated props (e.g. `flat` /
 * `color` on `NsButton`, which competes with `variant`). Costs nothing in
 * production builds — gated on `process.env.NODE_ENV`.
 *
 * THE GUARD IS `process.env.NODE_ENV`, NOT `import.meta.env.DEV`, AND THAT IS LOAD-BEARING.
 * Vite inlines `import.meta.env.DEV` to `false` when it builds THIS LIBRARY, so the whole
 * branch — and every warning in it — is tree-shaken out of `dist/` before a consumer's
 * bundler ever sees it. Measured on the first attempt at this: zero `console.warn` and zero
 * occurrences of the warning text in the published bundle. The guard was dead for every
 * consumer while passing its own tests, because vitest runs from SOURCE where DEV is true.
 *
 * `process.env.NODE_ENV` survives the library build verbatim and is resolved by the
 * CONSUMER's bundler, which is how Vue ships its own dev warnings. A test asserts the
 * warning string is actually present in `dist/` so this cannot silently regress again.
 *
 * Deliberately does NOT reconcile the two styling systems or make the
 * combination "work" — the goal is to make the collision loud, not
 * convenient, so wrong call sites don't spread silently.
 *
 * Call once, synchronously, from a component's `<script setup>`:
 *
 * ```ts
 * useNsAttrConflictWarning('NsButton', [
 *   { attrs: ['color'], useInstead: 'variant' },
 *   { attrs: ['text-color', 'textColor'], useInstead: 'variant' },
 * ])
 * ```
 */
// Declared locally rather than pulling in @types/node: this is a BROWSER library, and the
// only thing it needs from `process` is the one string every bundler defines. Vue ships its
// own dev warnings the same way. Adding @types/node here would put Node globals in scope for
// the whole package, which is a much larger change than this line needs.
declare const process: { env: { NODE_ENV?: string } } | undefined

const warned = new Set<string>()

/**
 * Clear the warn-once memory. TESTS ONLY — not exported from the public entry.
 *
 * The dedupe below is module-level and therefore persists across tests in a file, which made
 * the first version of the suite ORDER-DEPENDENT: a `color` warning fired by an earlier test
 * silently suppressed the one a later test was asserting, and the later test failed for a
 * reason that had nothing to do with its subject. Call this in `beforeEach`.
 */
export function __resetAttrConflictWarnings(): void {
  warned.clear()
}

export function useNsAttrConflictWarning(
  componentName: string,
  conflicts: readonly NsAttrConflict[],
): void {
  // `typeof process` rather than a bare reference: a consumer bundling for the browser
  // without a NODE_ENV define would otherwise throw a ReferenceError at import time, which
  // would be a far worse bug than the one this guard exists to report.
  if (typeof process !== 'undefined' && process?.env?.NODE_ENV === 'production') return

  const attrs = useAttrs()
  for (const conflict of conflicts) {
    // `!== false` as well as `!== undefined`: `:flat="false"` is inert (Quasar checks
    // truthiness), so warning about it would be a false positive, and a guard that cries
    // wolf once gets ignored for the cases that matter.
    const matchedKey = conflict.attrs.find(
      (key) => attrs[key] !== undefined && attrs[key] !== false,
    )
    if (!matchedKey) continue
    // WARN ONCE PER (component, attr) PER SESSION. Without this a v-for of 50 offending
    // buttons produces 50 identical lines — and HMR remounts multiply it — burying the
    // signal in exactly the situation where someone needs to read it.
    const seenKey = `${componentName}:${matchedKey}`
    if (warned.has(seenKey)) continue
    warned.add(seenKey)
    console.warn(buildConflictWarning(componentName, matchedKey, conflict))
  }
}

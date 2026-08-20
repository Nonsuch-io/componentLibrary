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
  /**
   * What KIND of conflict this is, which decides how the warning opens.
   * Defaults to styling, because that is what every conflict was when this
   * composable was written. Set 'behaviour' for attrs that change what the
   * component DOES rather than how it looks — a consumer told they have a
   * contrast problem when they have an emit-type problem will look in the wrong
   * place, and stop trusting the next warning.
   */
  kind?: 'styling' | 'behaviour'
}

function buildConflictWarning(
  componentName: string,
  attrKey: string,
  conflict: NsAttrConflict,
): string {
  // THE HEAD IS ABOUT STYLING ONLY WHEN THE CONFLICT IS. This composable was
  // written for NsButton, where every conflict really is two styling systems
  // fighting — so the sentence about "unreadable output (e.g. matching text and
  // background colours)" was hardcoded. Its first NON-styling use (NsCheckbox's
  // tri-state attrs, a BEHAVIOUR and emit-type conflict) then told the consumer
  // they had a colour-contrast problem they do not have. A warning that
  // misdescribes the fault is the round -> iconOnly mistake in a different place:
  // it converts "something is off" into a confident wrong diagnosis.
  const head =
    conflict.kind === 'behaviour'
      ? `[${componentName}] "${attrKey}" was passed through to the underlying Quasar ` +
        `component, where it changes behaviour this component has its own contract for.`
      : `[${componentName}] "${attrKey}" was passed through to the underlying Quasar component, ` +
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
 * Dev-only, warn-once-per-(component, attr): a Quasar attr fell through $attrs and
 * competes with one of this component's own props.
 *
 * Makes the collision LOUD; deliberately does not reconcile it.
 *
 * GUARD MUST BE `process.env.NODE_ENV`, never `import.meta.env` — vite inlines the
 * latter at THIS library's build, tree-shaking every warning out of dist/ while
 * tests still pass from source. Story: componentLibrary-nk3, PR #211.
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

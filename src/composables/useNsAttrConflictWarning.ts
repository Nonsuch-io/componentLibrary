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
  /** The Ns prop consumers should use instead of the conflicting attr. */
  useInstead: string
}

function buildConflictWarning(componentName: string, attrKey: string, useInstead: string): string {
  return (
    `[${componentName}] "${attrKey}" was passed through to the underlying Quasar component, ` +
    `but it competes with this component's own "${useInstead}" prop. Both styling systems can ` +
    `apply at once and silently produce unreadable output (e.g. matching text and background ` +
    `colours). Use the "${useInstead}" prop instead of "${attrKey}".`
  )
}

/**
 * Dev-only guard: warns when a consumer passes a Quasar attribute that
 * conflicts with one of this component's own curated props (e.g. `flat` /
 * `color` on `NsButton`, which competes with `variant`). Costs nothing in
 * production builds — gated on `import.meta.env.DEV`.
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
export function useNsAttrConflictWarning(
  componentName: string,
  conflicts: readonly NsAttrConflict[],
): void {
  if (!import.meta.env.DEV) return

  const attrs = useAttrs()
  for (const conflict of conflicts) {
    const matchedKey = conflict.attrs.find((key) => attrs[key] !== undefined)
    if (matchedKey) {
      console.warn(buildConflictWarning(componentName, matchedKey, conflict.useInstead))
    }
  }
}

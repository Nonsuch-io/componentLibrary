<template>
  <nav :aria-label="resolvedAriaLabel" class="ns-breadcrumbs-nav">
    <ol v-bind="$attrs" class="ns-breadcrumbs">
      <li v-for="(crumb, index) in crumbs" :key="index" class="ns-breadcrumbs__item">
        <component :is="crumb" />
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
/**
 * NsBreadcrumbs — accessible breadcrumb navigation.
 *
 * Renders a `<nav>` landmark around a real `<ol>/<li>` list, so screen readers announce
 * the trail as a sequence ("2 of 3") instead of an anonymous run of links.
 *
 * The landmark's accessible name resolves as `ariaLabel` prop -> the injected
 * locale's `navigation.breadcrumbs`. There is NO further fallback: `useNsLocale`
 * defaults to en-CA only when nothing is injected at all, so injecting a locale
 * object without a `navigation` key throws rather than degrading. That is
 * deliberate under ADR 0002 rule 4 — a landmark with a missing or empty name is
 * worse than a loud failure — but the earlier comment here claimed a three-step
 * chain the code never implemented, which is why it now says what it does.
 *
 * Quasar's QBreadcrumbs can't be used directly for this: it renders a plain
 * `<div>` with no landmark and no `aria-current` (verified against
 * node_modules/quasar/src/components/breadcrumbs/QBreadcrumbs.js, not its
 * docs — componentLibrary-2c7), and its internal separator / "last item"
 * logic keys off `vnode.type.name === 'QBreadcrumbsEl'`. Our
 * NsBreadcrumbElement children never match that check (they're
 * `NsBreadcrumbElement` vnodes, not `QBreadcrumbsEl` ones), so separators
 * silently never render for real NsBreadcrumbs usage today — confirmed by
 * mounting three NsBreadcrumbElement crumbs and inspecting the DOM before
 * this fix. This component inspects its own default slot directly instead
 * and owns list, separator, and `aria-current` semantics itself.
 *
 * Separators are pure CSS (`::before` in the scoped styles below), so
 * there's no separator DOM node to ever forget to mark `aria-hidden` — it
 * simply cannot enter the accessibility tree.
 *
 * The last NsBreadcrumbElement found in the slot is marked
 * `aria-current="page"` automatically, unless a crumb already declares its
 * own `aria-current` explicitly — that author-supplied value is always
 * left untouched instead of being duplicated onto the last crumb too.
 */
import { computed, useSlots, cloneVNode, Comment, Fragment, type VNode } from 'vue'
import { useNsLocale } from '../../composables/useNsLocale'
declare const process: { env: { NODE_ENV?: string } } | undefined

import NsBreadcrumbElement from '../NsBreadcrumbElement/NsBreadcrumbElement.vue'

export interface NsBreadcrumbsProps {
  /**
   * Accessible name for the breadcrumb `<nav>` landmark. Falls back to the
   * injected locale's `navigation.breadcrumbs`, then the en-CA default
   * ("Breadcrumb").
   */
  ariaLabel?: string
}

const props = withDefaults(defineProps<NsBreadcrumbsProps>(), {
  ariaLabel: undefined,
})

defineOptions({ inheritAttrs: false })

const slots = useSlots()
const locale = useNsLocale()

const resolvedAriaLabel = computed(() => props.ariaLabel?.trim() || locale.navigation.breadcrumbs)

/**
 * Default-slot vnodes, filtered down to real content (skipping comments and
 * whitespace-only text nodes), with `aria-current="page"` cloned onto the
 * last NsBreadcrumbElement — unless any crumb already declares its own
 * `aria-current`, in which case the author's markup is left as-is.
 *
 * Identifies crumbs by direct component-reference equality against the
 * imported NsBreadcrumbElement. This matches typical usage (the component
 * imported from this package, or resolved from the installed plugin within
 * one Vue app instance) but won't detect a consumer-authored component that
 * merely wraps NsBreadcrumbElement — such a wrapper wouldn't be the actual
 * last DOM crumb from this component's point of view.
 */
const crumbs = computed<VNode[]>(() => {
  const nodes = flattenFragments(slots.default?.() ?? []).filter(
    (node) => node.type !== Comment && !isEmptyTextNode(node),
  )

  const hasExplicitAriaCurrent = nodes.some(
    (node) => node.type === NsBreadcrumbElement && node.props?.['aria-current'] !== undefined,
  )

  let lastCrumbIndex = -1
  nodes.forEach((node, index) => {
    if (node.type === NsBreadcrumbElement) lastCrumbIndex = index
  })

  // Silence here is the failure this component exists to remove: a consumer
  // wrapping NsBreadcrumbElement (or passing any shape we cannot recognise)
  // gets a perfect-looking trail with no current-page marker and no signal.
  if (
    typeof process !== 'undefined' &&
    process?.env?.NODE_ENV !== 'production' &&
    nodes.length > 0 &&
    lastCrumbIndex === -1 &&
    !hasExplicitAriaCurrent
  ) {
    console.warn(
      '[NsBreadcrumbs] No NsBreadcrumbElement found in the default slot, so ' +
        'aria-current="page" was not applied and this trail has no current-page ' +
        'marker. Pass NsBreadcrumbElement directly rather than a wrapper around it, ' +
        'or set aria-current="page" yourself on the current crumb.',
    )
  }

  return nodes.map((node, index) => {
    if (index === lastCrumbIndex && !hasExplicitAriaCurrent) {
      return cloneVNode(node, { 'aria-current': 'page' })
    }
    return node
  })
})

/**
 * `v-for` and `<template v-if>` compile to a single Fragment vnode whose
 * children are the real crumbs. Without descending into them, a DYNAMIC trail —
 * the standard way breadcrumbs are written — matched nothing: one `<li>`
 * containing every crumb, no `aria-current`, and (since separators are
 * `li:not(:first-child)::before`) no separators either. A worse accessibility
 * tree than the bug this component was written to fix, failing silently and
 * looking plausible. Found in review, measured as 1 `<li>` with
 * aria-current `[null, null, null]`.
 */
function flattenFragments(nodes: VNode[]): VNode[] {
  return nodes.flatMap((node) =>
    node.type === Fragment && Array.isArray(node.children)
      ? flattenFragments(node.children as VNode[])
      : [node],
  )
}

function isEmptyTextNode(node: VNode): boolean {
  return typeof node.children === 'string' && node.children.trim() === ''
}
</script>

<style lang="sass" scoped>
.ns-breadcrumbs-nav
  font-family: var(--ns-font-family-text)

.ns-breadcrumbs
  display: flex
  flex-wrap: wrap
  align-items: center
  list-style: none
  margin: 0
  padding: 0
  gap: var(--ns-space-1)

  &__item
    display: flex
    align-items: center

    // Decorative separator — CSS-generated content is never part of the
    // accessibility tree or the DOM's textContent, so it can never be
    // announced by assistive tech and needs no aria-hidden of its own.
    &:not(:first-child)::before
      content: "/" / ""
      margin: 0 var(--ns-space-1)
      color: var(--ns-color-text-tertiary)
</style>

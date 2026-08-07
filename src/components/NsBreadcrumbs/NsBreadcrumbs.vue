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
 * Renders a `<nav>` landmark (accessible name defaulting to the injected
 * locale's `navigation.breadcrumbs` string, then the en-CA built-in
 * "Breadcrumb") around a real `<ol>/<li>` list, so screen readers announce
 * the trail as a sequence ("2 of 3") instead of an anonymous run of links.
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
import { computed, useSlots, cloneVNode, Comment, type VNode } from 'vue'
import { useNsLocale } from '../../composables/useNsLocale'
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

const resolvedAriaLabel = computed(() => props.ariaLabel ?? locale.navigation.breadcrumbs)

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
  const rawNodes = slots.default?.() ?? []
  const nodes = rawNodes.filter((node) => node.type !== Comment && !isEmptyTextNode(node))

  const hasExplicitAriaCurrent = nodes.some(
    (node) => node.type === NsBreadcrumbElement && node.props?.['aria-current'] !== undefined,
  )

  let lastCrumbIndex = -1
  nodes.forEach((node, index) => {
    if (node.type === NsBreadcrumbElement) lastCrumbIndex = index
  })

  return nodes.map((node, index) => {
    if (index === lastCrumbIndex && !hasExplicitAriaCurrent) {
      return cloneVNode(node, { 'aria-current': 'page' })
    }
    return node
  })
})

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
  gap: 4px

  &__item
    display: flex
    align-items: center

    // Decorative separator — CSS-generated content is never part of the
    // accessibility tree or the DOM's textContent, so it can never be
    // announced by assistive tech and needs no aria-hidden of its own.
    &:not(:first-child)::before
      content: "/"
      margin: 0 4px
      color: var(--ns-color-text-tertiary, currentColor)
</style>

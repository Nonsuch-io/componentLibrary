<template>
  <header class="ns-page-heading">
    <div v-if="hasControls()" class="ns-page-heading__controls">
      <slot name="controls" />
    </div>
    <NsPageTitle class="ns-page-heading__title" :title="title" :subtitle="subtitle" :level="level">
      <template v-if="$slots.default" #default><slot /></template>
      <template v-if="$slots.subtitle" #subtitle><slot name="subtitle" /></template>
    </NsPageTitle>
  </header>
</template>

<script setup lang="ts">
import { Comment, Fragment, useSlots, type Slot, type VNode } from 'vue'
import NsPageTitle from '../NsPageTitle/NsPageTitle.vue'

/**
 * NsPageHeading — a page title with its controls above it.
 *
 * IT WRAPS NsPageTitle RATHER THAN REPLACING IT, which was the open question
 * on componentLibrary-8ds. Verified on two Figma instances, 265:30841 (350x86)
 * and 265:30876 (350x161), both structured as
 * `Page Controls (350x37, contains NsButton) + Page Title (contains NsPageTitle)`.
 * So these are two components and NsPageHeading is a layout wrapper adding
 * actions — not one component with a size or level prop.
 *
 * The two Page Title heights are worth knowing: 41 and 116. Those are
 * NsPageTitle without and with a subtitle, which corroborates the subtitle
 * finding from a second direction.
 *
 * WHAT IS MEASURED AND WHAT IS NOT. The containment and the 350x37 controls
 * row are measured. The ORDER — controls above the title — comes from Figma
 * child order rather than from recorded y values, and the GAP between the two
 * was never measured at all; the Figma MCP server was unreachable when this
 * was built. Both are flagged in componentLibrary-8ds with the node ids to
 * re-query. They are laid out here with `--ns-space-2` for consistency with
 * NsPageTitle's own padding, which is a choice, not a measurement.
 *
 * EVERY TITLE PROP AND SLOT IS FORWARDED rather than reimplemented. The empty
 * -string handling, the slot-content detection, the heading-level clamp and
 * the dev warnings all live in NsPageTitle and are tested there; duplicating
 * any of it here would give this component a second place to get the same
 * a11y decisions wrong.
 */

/**
 * DECLARED, NOT `extends NsPageTitleProps`. Vue's `defineProps` macro cannot
 * resolve an interface that extends a type imported from another SFC — it
 * compiles to a component with no props at all, and the template then fails to
 * find `title`. Measured: `extends` gave three TS2339s on props that plainly
 * exist.
 *
 * The cost is that this list can fall behind NsPageTitle's. NsPageHeading.test.ts
 * compares the two components' runtime prop keys and fails if a prop is added
 * there and not forwarded here, which is the drift this shape invites.
 */
export interface NsPageHeadingProps {
  /** The page title. Forwarded. Ignored when the default slot is used. */
  title?: string
  /** Optional supporting line under the title. Forwarded. */
  subtitle?: string
  /** Which heading element to render, 1-6. Forwarded; clamped by NsPageTitle. */
  level?: 1 | 2 | 3 | 4 | 5 | 6
}

defineProps<NsPageHeadingProps>()

defineSlots<{
  /** Actions for the page, rendered above the title. Typically NsButton. */
  controls?: () => unknown
  /** The title content. Forwarded to NsPageTitle, overriding the `title` prop. */
  default?: () => unknown
  /** The subtitle content. Forwarded to NsPageTitle. */
  subtitle?: () => unknown
}>()

const slots = useSlots()

/**
 * Slot CONTENT, not slot presence — the same walk NsPageTitle uses, and for the
 * same reason: `slots.controls !== undefined` is true for a slot the parent
 * merely declares, so `<template #controls><NsButton v-if="canEdit"/></template>`
 * would render an empty controls row that still takes its gap. Measured on
 * NsPageTitle in review, where the equivalent bug produced an empty `<h1>`.
 *
 * Deliberately a local copy rather than a shared helper. NsBreadcrumbs has the
 * same two functions inline; the size audit found that shared-helper
 * indirection can cost more than the duplication it removes, since gzip already
 * deduplicates. If a fourth component needs this, lift it then.
 */
function renders(nodes: VNode[]): boolean {
  return nodes.some((node) => {
    if (node.type === Fragment) {
      return Array.isArray(node.children) ? renders(node.children as VNode[]) : false
    }
    return (
      node.type !== Comment && !(typeof node.children === 'string' && node.children.trim() === '')
    )
  })
}

function slotRenders(slot: Slot | undefined): boolean {
  return slot !== undefined && renders(slot())
}

/** A plain function, not a computed: `useSlots()` is not reactive. NsTable.vue:45. */
function hasControls(): boolean {
  return slotRenders(slots.controls)
}
</script>

<style lang="scss" scoped>
.ns-page-heading {
  display: flex;
  flex-direction: column;
  // UNMEASURED — see the note above. Chosen for consistency with NsPageTitle's
  // own vertical padding, not read off the design.
  gap: var(--ns-space-2);
  width: 100%;

  &__controls {
    display: flex;
    align-items: center;
    gap: var(--ns-space-2);
  }
}
</style>

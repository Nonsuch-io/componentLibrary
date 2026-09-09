<template>
  <NsCard class="ns-form-section">
    <div v-if="hasTitle() || hasDescription()" class="ns-form-section__heading">
      <NsText
        v-if="hasTitle()"
        :as="headingTag"
        variant="heading-sm"
        class="ns-form-section__title"
      >
        <slot name="title">{{ title }}</slot>
      </NsText>
      <NsText v-if="hasDescription()" as="p" variant="body-md" class="ns-form-section__description">
        <slot name="description">{{ description }}</slot>
      </NsText>
    </div>

    <div v-if="hasNotice()" class="ns-form-section__notice">
      <slot name="notice" />
    </div>

    <div class="ns-form-section__fields">
      <slot />
    </div>
  </NsCard>
</template>

<script setup lang="ts">
import { Comment, Fragment, computed, useSlots, type Slot, type VNode } from 'vue'
import NsCard from '../NsCard/NsCard.vue'
import NsText from '../NsText/NsText.vue'

/**
 * NsFormSection — one titled block of a form.
 *
 * ONE COMPONENT, NOT ELEVEN. butiq asked for eleven NsFormSection* variants —
 * ShopAddress, ShopHours, SignUpProfile, PlanCheckOutBillingInformation and so
 * on. All eleven were expanded in Figma and every one is this component with
 * different content: the design names INSTANCES after what they contain, not
 * after their type. Sample size 11 of 11, each expanded by id.
 *
 * The strongest evidence is the `hidden="true"` children. Variants carry each
 * OTHER's dead nodes — a hidden second Field Row in SignUpProfile, hidden
 * NsInput and NsSelect in the base. Eleven independent components would not
 * each ship the others' switched-off slots; one component with optional slots
 * would, and does.
 *
 * That makes genericity the design constraint rather than a nicety. Eleven
 * bespoke sections would make a GST/HST label change a library release — the
 * coupling this library refused once for NsPlanBuilder and would have accepted
 * twenty times over here. Story: componentLibrary-lrw.1.
 *
 * THE SLOT CONTRACT, agreed with butiq:
 *
 *     NsCard > [title]? > [description]? > [notice]? > Fields = n x (row | component)
 *
 * TITLE AND DESCRIPTION ARE INDEPENDENTLY OPTIONAL, not one optional pair.
 * PlanCheckOutPaymentMethod (185:10738) has a title and NO description, which
 * is the sample that disproved the pair reading — the first three variants
 * expanded all happened to have both. Modelling them as a pair ships an empty
 * descender or a collapsed heading for anyone with a title only, and it reaches
 * screenshot review looking fine.
 *
 * `notice` IS SECTION-SCOPED AND THERE IS DELIBERATELY NO ROW-LEVEL SLOT HERE.
 * Measured: PaymentMethod puts NsBanner directly in the card above Fields;
 * StorageLocation (202:23429) puts one INSIDE Fields as a row. Those are not
 * the same content in two positions — one is section-wide, the other is scoped
 * to the input beside it, and they differ in the DOM order a screen reader
 * walks while looking identical in a screenshot. A row-level banner belongs to
 * whatever occupies that row; a second slot here would recreate the ambiguity
 * one level down.
 *
 * `notice` IS SEVERITY-NEUTRAL, and that is not a hedge — it is where
 * verification failures, refusals, plan downgrades and section validation
 * summaries go, as much as informational messages. It takes any content, not
 * only NsBanner, which is why it is not called `banner`. Severity is carried by
 * whatever fills it.
 */

export interface NsFormSectionProps {
  /** Section title. Ignored when the `title` slot is used. */
  title?: string
  /** Supporting line under the title. Ignored when the `description` slot is used. */
  description?: string
  /**
   * Heading level for the title, 2-6. Defaults to 2: a form section sits under
   * a page heading, which owns the h1. Never renders h1 — a section title is by
   * definition not the page's own title, and offering it would invite a second.
   */
  level?: 2 | 3 | 4 | 5 | 6
}

const props = withDefaults(defineProps<NsFormSectionProps>(), {
  title: undefined,
  description: undefined,
  level: 2,
})

defineSlots<{
  /** The fields. Rows, or a whole component — ShopHours puts NsHoursOfOperation here. */
  default?: () => unknown
  /** Section title. Overrides the `title` prop. */
  title?: () => unknown
  /** Supporting line. Overrides the `description` prop. */
  description?: () => unknown
  /** Section-scoped messaging of ANY severity, above the fields. */
  notice?: () => unknown
}>()

const slots = useSlots()

/**
 * Slot CONTENT, not presence — the same walk NsPageTitle and NsPageHeading use.
 * `slots.title !== undefined` is true for a slot the parent merely declares, so
 * `<template #title><span v-if="loaded"/></template>` would render an empty
 * heading: announced by a screen reader as a heading with no name, and worse
 * than no heading because it still lands in the outline.
 *
 * SAME LIMIT AS THE OTHER TWO COPIES: this sees Comment vnodes, empty Fragments
 * and whitespace-only text — what `v-if`, `v-for` over nothing and interpolating
 * '' produce. It CANNOT see through a child component that renders nothing.
 * Local copy rather than a shared helper, deliberately: the size audit found
 * that shared-helper indirection can cost more than the duplication, since gzip
 * already deduplicates.
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

/**
 * Plain functions, not computeds: `useSlots()` returns a NON-reactive object, so
 * a computed over it evaluates once and never again. NsTable.vue:45 documents
 * the same trap, and NsPageTitle re-shipped it once before this was understood.
 *
 * `?.trim() ||` and not `??` for the props: nullish treats '' as a value, so
 * `title=""` would render an empty heading. The recurring bug in this library.
 */
function hasTitle(): boolean {
  return slotRenders(slots.title) || (props.title?.trim() ?? '') !== ''
}

function hasDescription(): boolean {
  return slotRenders(slots.description) || (props.description?.trim() ?? '') !== ''
}

function hasNotice(): boolean {
  return slotRenders(slots.notice)
}

const HEADING_TAGS = ['h2', 'h3', 'h4', 'h5', 'h6'] as const
const MIN_LEVEL = 2
const MAX_LEVEL = 6

/**
 * Indexed rather than interpolated: `h${n}` does not narrow to NsText's element
 * union, and a cast would silently accept `h7` — which is not an element, renders
 * inline and adds nothing to the outline. NaN survives both clamps and would
 * index past the end, so it is handled before them.
 */
const headingTag = computed<(typeof HEADING_TAGS)[number]>(() => {
  const level = Number.isFinite(props.level) ? Math.round(props.level) : MIN_LEVEL
  return HEADING_TAGS[Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, level)) - MIN_LEVEL]
})
</script>

<style lang="scss" scoped>
.ns-form-section {
  display: flex;
  flex-direction: column;
  // 20px throughout, measured across all eleven variants: Fields sits at x=20,
  // y=20 in a 700-wide card leaving 660 of content, and Field Rows run at a
  // 94px pitch with 74px rows. NsCard carries no padding of its own.
  gap: var(--ns-space-5);
  padding: var(--ns-space-5);
  width: 100%;

  &__heading {
    display: flex;
    flex-direction: column;
    // Section Heading is 49 tall for a 21px title over a 20px description:
    // 21 + 8 + 20 = 49. Measured on 163:9495 and 164:10056.
    gap: var(--ns-space-2);
  }

  &__title {
    color: var(--ns-color-text-primary);
  }

  &__description {
    color: var(--ns-color-text-secondary);
  }

  &__fields {
    display: flex;
    flex-direction: column;
    // Field Rows are 20px apart — y = 0, 94, 188, 282 with 74px rows.
    gap: var(--ns-space-5);
  }
}
</style>

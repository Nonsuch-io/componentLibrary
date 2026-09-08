<template>
  <div class="ns-page-title">
    <NsText v-if="hasTitle" :as="headingTag" variant="heading-xl" class="ns-page-title__title">
      <slot>{{ props.title }}</slot>
    </NsText>
    <NsText v-if="hasSubtitle" as="p" variant="heading-md-regular" class="ns-page-title__subtitle">
      <slot name="subtitle">{{ props.subtitle }}</slot>
    </NsText>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots, watchEffect } from 'vue'
import NsText from '../NsText/NsText.vue'

declare const process: { env: { NODE_ENV?: string } } | undefined

/**
 * NsPageTitle — the title-and-subtitle block at the top of a page.
 *
 * Measured off Figma 265:30901 and 265:30915, identical on both:
 *
 *     NsPageTitle 350x140
 *       NsText 350x37  y=8    "XL heading"             32/36.8 w600
 *       NsText 350x75  y=57   "Medium heading regular" 20/25   w400
 *
 * which gives 8px (space-2) of vertical padding and a 12px (space-3) gap.
 * IT IS TWO TEXTS, NOT ONE. An earlier reading of this component had the
 * 41 -> 116 height growth down as the title wrapping to more lines; it is a
 * SUBTITLE. Anything built against the single-string reading is wrong.
 * Story: componentLibrary-8ds.
 *
 * NOT THE SAME COMPONENT AS NsPageHeading, which was the open question on the
 * bead. NsPageHeading CONTAINS this one — verified on 265:30841 (350x86) and
 * 265:30876 (350x161), both `Page Controls (-> NsButton) + Page Title (-> this)`.
 * So NsPageHeading is a layout wrapper adding actions, not a level variant, and
 * they are two components rather than one with a size prop.
 *
 * THE HEADING LEVEL IS A PROP BECAUSE A HARDCODED `h1` IS UNUSABLE. A page that
 * already has an `h1` — which is most pages using this inside a shell — would
 * get a second one, and a screen-reader user navigating by heading would find
 * two top-level headings and no way to tell which is the page. `level` sets the
 * element; the type stays `heading-xl` either way, because appearance and
 * document outline are independent (the same reasoning as NsText's own
 * `variant`/`as` split).
 *
 * The subtitle is a `<p>`, deliberately. It reads as a heading visually but it
 * is a description, and marking it up as a second heading would put a phantom
 * entry in the outline between this page's title and its first real section.
 */

export interface NsPageTitleProps {
  /** The page title. Ignored when the default slot is used. */
  title?: string
  /** Optional supporting line under the title. Ignored when the `subtitle` slot is used. */
  subtitle?: string
  /**
   * Which heading element to render, 1-6. Defaults to 1 for a page that has no
   * other title; set it lower when this sits inside a shell that already has one.
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6
}

const props = withDefaults(defineProps<NsPageTitleProps>(), {
  title: undefined,
  subtitle: undefined,
  level: 1,
})

defineSlots<{
  /** The title content. Overrides the `title` prop. */
  default?: () => unknown
  /** The subtitle content. Overrides the `subtitle` prop. */
  subtitle?: () => unknown
}>()

const slots = useSlots()

const headingTag = computed(() => `h${props.level}` as const)

/**
 * `?.trim() ||` and NOT `??`. Nullish coalescing treats an empty string as a
 * present value, so `title=""` would render an EMPTY HEADING — which a screen
 * reader announces as a heading with no name, and which is worse than no
 * heading at all because it lands in the outline. This is the recurring bug in
 * this library (NsBreadcrumbs, NsNavSidebar); the fix is the same each time.
 */
const hasTitle = computed(() => slots.default !== undefined || (props.title?.trim() ?? '') !== '')
const hasSubtitle = computed(
  () => slots.subtitle !== undefined || (props.subtitle?.trim() ?? '') !== '',
)

/**
 * FAIL OPEN — warn unless we can PROVE production, matching the house pattern
 * (see NsText, useNsStylesheetWarning). A bundler cannot fold `typeof process`,
 * and a Vite SPA ships no `process` polyfill, so this is live in browsers too.
 * That is deliberate: a page-title block with no title renders an empty box,
 * which looks like a layout bug rather than a missing prop and is exactly the
 * kind of silence that survives review.
 */
if (typeof process === 'undefined' || process?.env?.NODE_ENV !== 'production') {
  watchEffect(() => {
    if (!hasTitle.value) {
      console.warn(
        '[NsPageTitle] No title: the `title` prop is empty or whitespace and no default ' +
          'slot was given, so no heading was rendered and this page has no title in its ' +
          'outline. Pass `title`, or the default slot.',
      )
    }
  })
}
</script>

<style lang="scss" scoped>
.ns-page-title {
  display: flex;
  flex-direction: column;
  // 12px between title and subtitle, 8px above and below — Figma space-3 and
  // space-2 on 265:30901 (title y=8 h=37, subtitle y=57 h=75, container 140).
  gap: var(--ns-space-3);
  padding: var(--ns-space-2) 0;
  width: 100%;

  &__title {
    color: var(--ns-color-text-primary);
  }

  // COLOUR IS UNVERIFIED against Figma. The type style is measured
  // ("Medium heading regular", 20/25 w400); the colour is not — the variable
  // defs for the frame returned both --ns-color-text-primary and
  // --ns-color-text-brand without saying which text used which. `secondary` is
  // the sensible default for a supporting line, and it is set in CSS rather
  // than via NsText's `tone` prop precisely so a consumer can override it
  // without fighting an inline style. Confirm when Figma is reachable.
  &__subtitle {
    color: var(--ns-color-text-secondary);
  }
}
</style>

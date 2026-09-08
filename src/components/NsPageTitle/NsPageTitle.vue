<template>
  <div class="ns-page-title">
    <NsText v-if="hasTitle()" :as="headingTag" variant="heading-xl" class="ns-page-title__title">
      <slot>{{ props.title }}</slot>
    </NsText>
    <NsText
      v-if="hasSubtitle()"
      as="p"
      variant="heading-md-regular"
      class="ns-page-title__subtitle"
    >
      <slot name="subtitle">{{ props.subtitle }}</slot>
    </NsText>
  </div>
</template>

<script setup lang="ts">
import {
  Comment,
  Fragment,
  computed,
  onMounted,
  onUpdated,
  useSlots,
  type Slot,
  type VNode,
} from 'vue'
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
   * other title; set it lower (`:level="2"`, bound — not `level="2"`, which is a string) when this
   * sits inside a shell that already has one.
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

/**
 * SLOT PRESENCE IS NOT SLOT CONTENT, and the difference renders an empty
 * heading. `slots.default !== undefined` is true for any slot the parent
 * declares — including `<template #default><span v-if="false"/></template>`, or
 * one interpolating a value that has not loaded yet. Measured in review: that
 * produced `<h1></h1>` with no text and NO warning, which is precisely the
 * a11y failure the `?.trim() ||` below exists to prevent, reached through the
 * other input. Vue's own `renderSlot` already treats an all-Comment slot as
 * empty (which is why a `title` prop still wins there). This matches Vue on
 * Comments and Fragments and is deliberately STRICTER on text: Vue's
 * `ensureValidVNode` accepts a whitespace-only Text vnode as content, and a
 * heading whose only content is a space is still a heading with no name.
 *
 * HONEST LIMITS: this sees Comment vnodes, empty Fragments and whitespace-only
 * text — what `v-if`, `v-for` over nothing, and interpolating '' actually
 * produce. It CANNOT see through a child component that renders nothing
 * (`<MyEmpty />` counts as content) or an empty element (`<span></span>`).
 * That is the same limit Vue's fallback logic has for components, and rendering
 * to DOM to read textContent would be disproportionate for a heading block.
 */
function renders(nodes: VNode[]): boolean {
  return nodes.some((node) => {
    // A Fragment's children are an array for anything the template compiler
    // emits, but a hand-written `h(Fragment)` carries `null` — which would fall
    // through to the leaf branch below and count as content.
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
 * PLAIN FUNCTIONS, NOT COMPUTEDS — called from the template so they re-run on
 * every render. `useSlots()` returns a NON-REACTIVE object, so a computed over
 * it evaluates once and never again. NsTable.vue:45 already documents this
 * exact trap ("a consumer's `<template v-if="show" #top>` rendered on main and
 * NEVER on this branch") and this component re-shipped it: measured in review,
 * a `#subtitle` toggled on after mount never appeared, one toggled off left an
 * empty `<p>` behind, and a default slot arriving late never produced an `<h1>`.
 *
 * `?.trim() ||` and NOT `??` for the props. Nullish treats an empty string as a
 * present value, so `title=""` would render an EMPTY HEADING — which a screen
 * reader announces as a heading with no name, and which is worse than no
 * heading at all because it still lands in the outline. The recurring bug in
 * this library (NsBreadcrumbs, NsNavSidebar); the fix is the same each time.
 */
/**
 * The last value each function returned, recorded AS THE TEMPLATE RENDERS.
 *
 * The dev check below must not call these itself: invoking a slot outside the
 * render function makes Vue emit "Slot \"default\" invoked outside of the render
 * function: this will not track dependencies used in the slot" into every
 * consumer's console. Measured — an earlier version of this fix did exactly
 * that on every mount. Reading a flag the render already set costs nothing and
 * keeps slot invocation where Vue wants it.
 */
let titleRendered = false
let subtitleRendered = false

function hasTitle(): boolean {
  titleRendered = slotRenders(slots.default) || (props.title?.trim() ?? '') !== ''
  return titleRendered
}

function hasSubtitle(): boolean {
  subtitleRendered = slotRenders(slots.subtitle) || (props.subtitle?.trim() ?? '') !== ''
  return subtitleRendered
}

/**
 * `level` is a union to TypeScript and a bare Number at runtime, so a JS
 * consumer or a bound value can hand us 7 or 0. `<h7>` is not an element: it
 * renders inline, contributes NOTHING to the outline, and looks almost right.
 * Clamp to a real heading rather than emit a tag that is silently not one.
 */
const HEADING_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const
const MIN_LEVEL = 1
const MAX_LEVEL = HEADING_TAGS.length

const isValidLevel = (level: number) =>
  Number.isInteger(level) && level >= MIN_LEVEL && level <= MAX_LEVEL

/**
 * Indexed rather than interpolated: `h${clamped}` is typed `\`h${number}\`` and
 * does not narrow to NsText's element union, so a template literal would need a
 * cast — and a cast here would silently accept `h7` again, which is the whole
 * thing being guarded against. NaN is handled explicitly because Math.round(NaN)
 * survives both clamps and would index past the end.
 */
const headingTag = computed<(typeof HEADING_TAGS)[number]>(() => {
  const level = Number.isFinite(props.level) ? Math.round(props.level) : MIN_LEVEL
  return HEADING_TAGS[Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, level)) - 1]
})

/**
 * FAIL OPEN — warn unless we can PROVE production, matching the house pattern
 * (NsText, useNsStylesheetWarning). A bundler cannot fold `typeof process`, and
 * a Vite SPA ships no `process` polyfill, so this is live in browsers too.
 *
 * On mount AND update, not `watchEffect`: the conditions depend on SLOT content,
 * which a reactive effect over the non-reactive `slots` object cannot track — so
 * a watchEffect would warn once at mount and then describe a state that is no
 * longer true. The flags make each warning fire once per transition rather than
 * on every render.
 */
if (typeof process === 'undefined' || process?.env?.NODE_ENV !== 'production') {
  let warnedNoTitle = false
  let warnedBadLevel = false

  const check = () => {
    if (!titleRendered) {
      if (!warnedNoTitle) {
        warnedNoTitle = true
        console.warn(
          '[NsPageTitle] No title: the `title` prop is empty or whitespace and the default ' +
            'slot rendered nothing, so no heading was rendered and this page has no title ' +
            'in its outline. Pass `title`, or content in the default slot.',
        )
      }
    } else {
      warnedNoTitle = false
    }

    if (!isValidLevel(props.level)) {
      if (!warnedBadLevel) {
        warnedBadLevel = true
        const inRange = props.level >= MIN_LEVEL && props.level <= MAX_LEVEL
        console.warn(
          `[NsPageTitle] level="${props.level}" is not a heading level, so it was ` +
            (inRange
              ? `ROUNDED to <${headingTag.value}>. Levels must be whole numbers.`
              : `CLAMPED to <${headingTag.value}>. Only 1-6 are elements; ` +
                `<h${props.level}> would render inline and add nothing to the outline.`),
        )
      }
    } else {
      warnedBadLevel = false
    }
  }

  onMounted(check)
  onUpdated(check)
}
</script>

<style lang="scss" scoped>
.ns-page-title {
  display: flex;
  flex-direction: column;
  // KEEP THIS. Removed once on review advice that it is redundant on a block
  // container — true standalone, false where this actually gets used. The
  // measured NsPageTitle fills its NsPageHeading (350 of 350 on 265:30841), and
  // NsPageHeading lays out `Page Controls + Page Title`, so as a flex ITEM this
  // would otherwise shrink to its text. The story documents the block as
  // full-width; that claim and this rule stand or fall together.
  width: 100%;
  // 12px between title and subtitle, 8px above and below — Figma space-3 and
  // space-2 on 265:30901 (title y=8 h=37, subtitle y=57 h=75, container 140).
  gap: var(--ns-space-3);
  padding: var(--ns-space-2) 0;

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

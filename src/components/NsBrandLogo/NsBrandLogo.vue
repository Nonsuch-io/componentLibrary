<template>
  <a
    v-if="href"
    :href="href"
    :aria-label="alt"
    v-bind="anchorAttrs"
    class="ns-brand-logo ns-brand-logo--link"
  >
    <ns-image v-bind="imageBindings" class="ns-brand-logo__image" />
  </a>
  <ns-image v-else v-bind="imageBindings" class="ns-brand-logo ns-brand-logo__image" />
</template>

<script setup lang="ts">
import { computed, useAttrs, watchEffect } from 'vue'
import NsImage from '../NsImage/NsImage.vue'

declare const process: { env: { NODE_ENV?: string } } | undefined

/**
 * NsBrandLogo — a brand-agnostic logo, built on NsImage (and so on Quasar's QImg).
 *
 * THE LIBRARY SHIPS NO BRAND ASSET. The consuming app passes its own `src`, which
 * is what keeps this component product-agnostic — the same rule that governs the
 * Storybook placeholders (see `src/stories/placeholderMarketingContent.ts`).
 *
 * A brand usually has more than one LOCKUP — a wide wordmark for a header, a
 * stacked mark for a page body — with very different aspect ratios. This component
 * deliberately does NOT model lockups as a prop: it takes one `src` per call site,
 * so an app can add a third lockup without a library release.
 */
export interface NsBrandLogoProps {
  /** URL of the brand logo asset. Supplied by the consuming app. */
  src: string
  /**
   * Accessible name for the logo, e.g. the brand name. Omit it ONLY when the
   * brand name is already in adjacent text, and pass `aria-hidden="true"` in that
   * case so the logo does not announce as an unnamed image.
   */
  alt?: string
  /** Rendered width. A number is treated as pixels. */
  width?: number | string
  /** Rendered height. A number is treated as pixels. */
  height?: number | string
  /**
   * Aspect ratio, width ÷ height (a 185×71 wordmark is `2.6`). Reserves the
   * correct box before the asset loads — see the sizing note below.
   */
  ratio?: number | string
  /**
   * When set, the logo is wrapped in a link — the usual "logo goes home". The
   * anchor is named from `alt`, EXPLICITLY rather than by name-from-content:
   * a consumer passing `aria-hidden="true"` for a decorative logo would otherwise
   * strip the only name the link had.
   */
  href?: string
}

const props = withDefaults(defineProps<NsBrandLogoProps>(), {
  alt: undefined,
  width: undefined,
  height: undefined,
  ratio: undefined,
  href: undefined,
})

// inheritAttrs is off in BOTH branches, not just the linked one: Vue applies
// $attrs to the root automatically IN ADDITION to any explicit v-bind, so leaving
// it on would double-apply them to the unlinked root — the same duplicate-class
// bug NsImage still has (it v-binds $attrs AND lets Vue inherit them), filed as
// componentLibrary-bnw.
defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

/**
 * WHICH ELEMENT AN ATTR BELONGS TO, WHEN THERE ARE TWO.
 *
 * Unlinked, the image is the root and everything lands on it. Linked, there are
 * two candidates and the split is not cosmetic:
 *
 *   anchor  `class`, `style`, `id`, `data-*` — the anchor is the element that sits
 *           in the consumer's layout (NsSiteHeader's `logo` slot, say) and the one
 *           an e2e selector means. A utility class aimed at positioning the link is
 *           simply inert one level down on the image.
 *   image   everything else — `ratio`, `fit`, `loading`, `aria-*` are QImg's
 *           concerns. `aria-hidden` especially: on the anchor it would hide the
 *           whole link, which is never what a decorative-logo consumer means.
 */
const isAnchorAttr = (key: string) =>
  key === 'class' || key === 'style' || key === 'id' || key.startsWith('data-')

const anchorAttrs = computed(() =>
  Object.fromEntries(Object.entries(attrs).filter(([key]) => isAnchorAttr(key))),
)

const imageAttrs = computed(() =>
  props.href === undefined
    ? attrs
    : Object.fromEntries(Object.entries(attrs).filter(([key]) => !isAnchorAttr(key))),
)

/** QImg types `width`/`height` as String, so a number would trip a Vue prop-type
 *  warning and be dropped. Accepting a number and converting is the ergonomic
 *  half of this wrapper — `:width="72"` is what a call site wants to write. */
const toCssLength = (value: number | string | undefined) =>
  typeof value === 'number' ? `${value}px` : value

const imageBindings = computed(() => ({
  src: props.src,
  alt: props.alt,
  width: toCssLength(props.width),
  height: toCssLength(props.height),
  ratio: props.ratio,

  // LOGO-APPROPRIATE DEFAULTS. Each of these overrides a QImg default that is
  // right for photographic content and wrong for a logo:
  //
  //   fit         QImg defaults to 'cover', which CROPS. A cropped wordmark is a
  //               damaged trademark, not a styling nit.
  //   loading     QImg defaults to 'lazy'. A logo is above-the-fold chrome; lazy
  //               loading makes it pop in after the header has already painted.
  //   noSpinner   A spinner inside a 72px wordmark reads as a broken image.
  //   noTransition A fade-in on the brand mark is the same pop-in by another name.
  fit: 'contain',
  loading: 'eager',
  noSpinner: true,
  noTransition: true,

  /**
   * LINKED, THE IMAGE IS HIDDEN FROM ASSISTIVE TECH — the anchor already carries
   * the name. QImg renders `<div role="img" aria-label={alt}>`, so without this the
   * anchor and its own descendant both announce the brand: two accessible objects,
   * one logo, in exactly the call pattern the stories recommend.
   *
   * This cannot make a link anonymous. If `alt` is absent the anchor had no name to
   * lose — the image's was equally absent — and that case warns separately below.
   */
  'aria-hidden': props.href !== undefined ? 'true' : undefined,

  // LAST, so a consumer's attrs win over every default above — `fit="cover"` on a
  // call site that genuinely wants a cropped mark still works, as does
  // `aria-hidden="false"` to put the image back in the tree.
  ...imageAttrs.value,
}))

/**
 * QImg RESERVES A 16:9 BOX WHEN IT KNOWS NOTHING ELSE, AND NO LOCKUP IS 16:9.
 *
 * QImg sizes itself with a padding-bottom filler div derived from `ratio`, falling
 * back to `initialRatio` — 1.7778 (QImg.js: `const defaultRatio = 1.7778`). Measured
 * with only `width: 72`: the box renders 72×40.5 with `padding-bottom: 56.25%`, so a
 * 72×27 wordmark floats in 13px of dead space and then snaps to its real height once
 * the asset loads. `loading="eager"` shortens that window; it does not close it.
 *
 * Either `ratio` or an explicit `height` removes the guess. This warns rather than
 * picking a default because the right number is a property of the ASSET, which only
 * the consumer has — a library-side guess would be wrong for every brand but one.
 */
/**
 * A LINKED LOGO WITH NO `alt` IS AN ANONYMOUS LINK.
 *
 * Screen-reader users navigating by link list hear "link" with no destination —
 * and it is the site's primary navigation control. The `aria-label` on the anchor
 * covers the normal case, but it is only as good as the `alt` feeding it.
 *
 * Separate from the sizing warning below because the two are independent: a call
 * site can get sizing right and naming wrong.
 */
if (typeof process === 'undefined' || process?.env?.NODE_ENV !== 'production') {
  let warnedName = false
  watchEffect(() => {
    if (warnedName) return
    if (props.href === undefined || props.alt !== undefined) return
    warnedName = true
    console.warn(
      '[NsBrandLogo] has `href` but no `alt`, so the link has no accessible name. ' +
        'Pass `alt` with the brand name.',
    )
  })
}

if (typeof process === 'undefined' || process?.env?.NODE_ENV !== 'production') {
  let warned = false
  watchEffect(() => {
    if (warned) return
    // Reads the RESOLVED bindings rather than the props. Today that is the same
    // check — `ratio` and `height` are declared props, so Vue routes them there and
    // they can never arrive through $attrs — but it stays correct if either is ever
    // moved off the prop surface. (An earlier comment here claimed attrs could
    // already carry them and that props alone cried wolf; review measured that and
    // it was wrong.)
    const bindings = imageBindings.value
    if (bindings.ratio !== undefined || bindings.height !== undefined) return
    warned = true
    // Kept terse ON PURPOSE. The guard is deliberately fail-open so it fires in a
    // browser, which means no consumer bundler can tree-shake this string out —
    // every character is shipped weight. See the size-limit budget.
    console.warn(
      '[NsBrandLogo] has neither `ratio` nor `height`, so QImg reserves a 16:9 box ' +
        'and the logo shifts on load. Pass `ratio` (width ÷ height) or `height`.',
    )
  })
}
</script>

<style lang="sass" scoped>
.ns-brand-logo
  // The asset carries the brand's own colour; nothing here should tint it.
  flex-shrink: 0

  &--link
    display: inline-flex
    align-items: center
    justify-content: center
    // An anchor is inline by default, which adds descender space under the logo
    // and misaligns it against sibling header actions.
    text-decoration: none
    color: inherit

    // AGENTS.md: interactive elements must be at least 44x44 on mobile. The logo
    // link is the one interactive element here, and it is sized by its image —
    // the header lockup this component exists for is 72x27, which is 17px short.
    // The flex centring above keeps the smaller image centred in the larger hit
    // box, so the target grows without the logo appearing to move.
    min-width: var(--ns-touch-target)
    min-height: var(--ns-touch-target)

    &:focus-visible
      outline: 2px solid var(--ns-color-border-focus, currentColor)
      outline-offset: 2px
      border-radius: var(--ns-radius-sm)
</style>

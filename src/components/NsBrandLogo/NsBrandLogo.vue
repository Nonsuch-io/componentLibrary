<template>
  <a
    v-if="isLinked"
    :href="href"
    :aria-label="anchorLabel"
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
// Type-only: erased at compile time, so typing this surface costs zero bundle
// bytes. The size argument that killed the earlier denylist was about a RUNTIME
// array of prop names; it does not apply here.
import type { QImgProps } from 'quasar'

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
   *
   * BLANK MEANS NOT A LINK, deliberately: `:href="isHome ? '' : '/'"` is how a call
   * site says "don't link the logo on the page it points at", and an unresolved
   * `:href="config.homeUrl"` arrives the same way.
   */
  href?: string
  /**
   * Passed straight to the underlying image, for QImg options this component does
   * not surface — `fetchpriority`, `placeholderSrc`, `imgClass`, and so on. Also the
   * way to override a logo default (`{ fit: 'cover' }`), to put a linked logo's
   * image back in the accessibility tree (`{ 'aria-hidden': false }`), or to hear
   * about a broken asset (`{ onError }`, `{ errorSrc }`) — on a LINKED logo `@error`
   * and `@load` land on the anchor, where they can never fire.
   *
   * Exists because a linked logo has TWO elements and an attribute cannot say which
   * one it meant. Everything else you pass lands on the root, as usual.
   */
  imgProps?: Partial<QImgProps> & {
    // QImg's own props are typed, so `{ fi: 'cover' }` and `{ fit: 123 }` are
    // compile errors rather than attributes that silently do nothing. aria-/data-
    // stay open because they are legitimate on the image and QImg does not
    // declare them.
    [key: `aria-${string}`]: unknown
    [key: `data-${string}`]: unknown
  }
}

const props = withDefaults(defineProps<NsBrandLogoProps>(), {
  alt: undefined,
  width: undefined,
  height: undefined,
  ratio: undefined,
  href: undefined,
  imgProps: undefined,
})

// inheritAttrs is off in BOTH branches, not just the linked one: Vue applies
// $attrs to the root automatically IN ADDITION to any explicit v-bind, so leaving
// it on would double-apply them to the unlinked root.
//
// It does NOT fix NsImage's own double-application — NsImage v-binds $attrs AND
// lets Vue inherit them, so a consumer class still renders twice through this
// component. That is pre-existing and filed as componentLibrary-bnw.
defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

/**
 * PRESENT IS NOT THE SAME AS SET.
 *
 * `href=""`, `alt=""`, `src=" "` and `ratio=""` all pass a `!== undefined` check
 * and all mean nothing to a user. They arrive the same way too: an expression that
 * has not resolved yet (`:src="theme.logoUrl"`), a CMS field that came back empty
 * (`:ratio="asset.width / asset.height"`), or a deliberate blank. So every check in
 * this component asks for a VALUE, and every one of them asks the same way.
 */
const hasValue = (value: unknown) => String(value ?? '').trim() !== ''

/**
 * ONE DEFINITION OF "IS THIS A LINK", READ BY EVERY PLACE THAT ASKS.
 *
 * The template used to decide with `v-if="href"` (truthy) while the script decided
 * three more times with `href === undefined` (strict). `href=""` split them: the
 * template rendered the unlinked branch, so `$attrs` were routed to an anchor that
 * did not exist and were dropped, and the image was still marked `aria-hidden` —
 * a logo removed from the accessibility tree while carrying a perfectly good `alt`.
 */
const isLinked = computed(() => hasValue(props.href))

/** An empty `aria-label` names nothing and is its own axe failure, so a blank
 *  `alt` omits the attribute rather than emitting one. The unnamed-link warning
 *  below covers the case; this just avoids adding a second defect to it. */
const anchorLabel = computed(() => (hasValue(props.alt) ? props.alt : undefined))

/**
 * WHICH ELEMENT AN ATTR BELONGS TO, WHEN THERE ARE TWO.
 *
 * `$attrs` go to the ROOT — the anchor when linked, the image when not. That is
 * Vue's own semantic, and it is the one a call site already expects: `@click`,
 * `target`, `aria-current`, `data-testid` and a utility class all mean the element
 * you are looking at. Image-specific overrides go through `imgProps`, explicitly.
 *
 * TWO EARLIER ATTEMPTS GUESSED, AND BOTH GUESSED WRONG.
 *
 * Sending everything to the image meant `onClick` bound to the inner div, so
 * clicking the link never fired it, and `target="_blank"` landed on a `<div>` and
 * silently opened in the same tab — measured, and covered by no test.
 *
 * Replacing that with a name table of QImg's props fixed those cases and bought a
 * maintenance trap: the table has to track a dependency's prop list, and the day
 * QImg adds one, that attr silently lands on the wrong element again. It also cost
 * ~100B of string data against a deliberately tight budget.
 *
 * So this component no longer infers intent from an attribute's name. Naming the
 * target is the consumer's job, and it is one short prop.
 */
const imageOverrides = computed(() => ({
  ...(isLinked.value ? {} : attrs),
  ...props.imgProps,
}))

const anchorAttrs = computed(() => (isLinked.value ? attrs : {}))

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
  'aria-hidden': isLinked.value ? 'true' : undefined,

  // LAST, so a consumer's overrides win over every default above.
  ...imageOverrides.value,
}))

/**
 * A LINKED LOGO WITH NO `alt` IS AN ANONYMOUS LINK.
 *
 * Screen-reader users navigating by link list hear "link" with no destination —
 * and it is the site's primary navigation control. The `aria-label` on the anchor
 * covers the normal case, but it is only as good as the `alt` feeding it.
 *
 * `alt=""` counts as no name here even though it is the standard HTML idiom for a
 * DECORATIVE image, and that is the point: decorative is a coherent thing to be
 * inside a link's content, but a link needs a name whatever its content is.
 *
 * Separate from the sizing warning below because the two are independent: a call
 * site can get sizing right and naming wrong.
 */
if (typeof process === 'undefined' || process?.env?.NODE_ENV !== 'production') {
  let warnedName = false
  watchEffect(() => {
    if (warnedName) return
    if (!isLinked.value || hasValue(props.alt)) return
    warnedName = true
    console.warn(
      '[NsBrandLogo] has `href` but no `alt`, so the link has no accessible name. ' +
        'Pass `alt` with the brand name.',
    )
  })
}

/**
 * NO `src` MEANS NO IMAGE AT ALL, AND NOTHING ELSE REPORTS IT.
 *
 * QImg only builds a source when `src || srcset || sizes` is truthy, so a blank
 * `src` creates no `<img>` element — and therefore no `error` event, so a
 * consumer's own `onError` cannot catch this either. What renders is the reserved
 * box plus an empty content div, still wrapped in `role="img"` with the brand's
 * name on it: a screen reader announces a logo that is visibly not there.
 *
 * `srcset` alone is a legitimate way to source the image, so it satisfies this.
 */
if (typeof process === 'undefined' || process?.env?.NODE_ENV !== 'production') {
  let warnedSrc = false
  watchEffect(() => {
    if (warnedSrc) return
    if (hasValue(props.src) || hasValue(props.imgProps?.srcset)) return
    warnedSrc = true
    console.warn('[NsBrandLogo] has no `src`, so no logo renders at all.')
  })
}

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
 *
 * A ratio has to be a POSITIVE FINITE NUMBER to count. QImg computes
 * `props.ratio || naturalRatio`, so `0`, `NaN` and `''` are falsy and land on the
 * same 16:9 fallback this warns about — measured, byte-identical output. Checking
 * presence would have stayed silent for exactly the inputs that cause the bug, and
 * `:ratio="asset.width / asset.height"` over a CMS record produces all three.
 */
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
    const ratio = Number(bindings.ratio)
    if ((Number.isFinite(ratio) && ratio > 0) || hasValue(bindings.height)) return
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
    // link is the one interactive element here and it is sized by its image — the
    // header lockup this component exists for is 72x27, which is 17px short.
    //
    // GROWS THE HIT AREA, NOT THE BOX. min-height on the anchor itself was measured
    // overflowing its only real consumer: NsSiteHeader is 66px with 16px padding, so
    // its content box is 34px, and a 44px anchor plus the logo slot's own 8px ate
    // 18px of the header's declared padding. Any sticky header clipping overflow
    // would then have clipped the touch target. The overlay is absolutely positioned
    // and never participates in flex sizing.
    //
    // VERTICAL ONLY, AND THAT ASYMMETRY IS DELIBERATE.
    //
    // An earlier version set min-width too, with a comment claiming it "only ever
    // grows vertically in practice" because the wordmark is already wider than 44px.
    // That was true of the one shape the stories test and false of a shape this
    // component documents: review measured a 32x32 linked mark whose overlay reached
    // 6px past its own box on each side and swallowed a click aimed at a sibling
    // button 4px away. A stolen click is a functional bug; a target that is short on
    // one axis is a degradation. So the axis that cannot harm a neighbour grows, and
    // the one that can does not.
    //
    // A logo link narrower than 44px therefore does NOT reach the minimum
    // horizontally. That is the consumer's to solve with size or spacing — which is
    // also how WCAG 2.5.8 resolves it, via the spacing exception rather than by
    // growing targets into each other.
    position: relative

    &::after
      content: ''
      position: absolute
      top: 50%
      left: 50%
      transform: translate(-50%, -50%)
      width: 100%
      height: 100%
      min-height: var(--ns-touch-target)

    &:focus-visible
      outline: 2px solid var(--ns-color-border-focus, currentColor)
      outline-offset: 2px
      border-radius: var(--ns-radius-sm)
</style>

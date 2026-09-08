<template>
  <component :is="as" :class="['ns-text', `ns-${variant}`]" :style="toneStyle">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { KNOWN_VARIANTS, KNOWN_TONES, KNOWN_ELEMENTS } from './variants'

declare const process: { env: { NODE_ENV?: string } } | undefined

/**
 * NsText — the design system's type ramp as a component.
 *
 * The most-used component in the butiq design, and neither agent ranked it:
 * a Figma section tree renders every instance as a SELF-CLOSING LEAF, so
 * `NsText` appeared ZERO times in a 301-instance tree while actually sitting
 * two-deep inside every NsPageTitle and every NsFormSection heading. Both
 * usage counts we prioritised on were structurally blind to it.
 * Story: componentLibrary-lrw.8.
 *
 * NOT new design work. The design's named type styles already map 1:1 onto
 * the utility classes in `tokens/typography.css`, line-heights matching to
 * the decimal — "XL heading" (32/36.8 w600) IS `.ns-heading-xl` (2rem, 1.15).
 * This component exposes that existing ramp as a typed surface; it does not
 * invent a second one. That is why the styles live in typography.css and not
 * in a `<style>` block here — one ramp, one source.
 *
 * `variant` and `as` ARE DELIBERATELY INDEPENDENT, and this is an
 * accessibility decision rather than a convenience. A component where
 * `variant="heading-xl"` also emitted `<h1>` would force every consumer to
 * choose between correct type and a correct document outline — and they will
 * choose the type, because that is the part they can see. That is how a page
 * ends up with three `<h1>`s, or a visually-large heading with nothing
 * between it and the one above it. Screen-reader users navigate by that
 * outline. So: `variant` picks how it LOOKS, `as` picks what it IS, and
 * `as="h2" variant="body-md"` is a legitimate, supported combination.
 */

export type NsTextVariant = (typeof KNOWN_VARIANTS)[number]
export type NsTextTone = (typeof KNOWN_TONES)[number]
export type NsTextElement = (typeof KNOWN_ELEMENTS)[number]

export interface NsTextProps {
  /** Which type style to render. Independent of `as`. */
  variant?: NsTextVariant
  /** Which element to render. Independent of `variant`. */
  as?: NsTextElement
  /** Semantic text colour. Omitted means inherit, which is usually right. */
  tone?: NsTextTone
}

const props = withDefaults(defineProps<NsTextProps>(), {
  variant: 'body-md',
  as: 'span',
  tone: undefined,
})

defineSlots<{
  /** The text content. */
  default: () => unknown
}>()

const toneStyle = computed(() =>
  props.tone === undefined ? undefined : { color: `var(--ns-color-text-${props.tone})` },
)

/**
 * TypeScript catches a bad `variant`/`tone` for TS consumers; these guards are
 * for the JavaScript ones, and for a bound `:variant` whose value arrives from
 * data. Both failures are SILENT and look fine in review: an unknown variant
 * emits a class no stylesheet defines and renders at browser-default type, and
 * an unknown tone emits `var(--ns-color-text-nope)` with no fallback, which is
 * invalid at computed-value time and so quietly inherits the parent's colour.
 *
 * THESE RUN IN PRODUCTION BROWSERS TOO, and that is not an accident — it is
 * what the whole house pattern does (NsButton, NsBrandLogo, NsImage, NsBanner,
 * NsInput, NsDialog, NsRadioButtons). A bundler folds `process.env.NODE_ENV`
 * to a constant but CANNOT fold `typeof process`, because it may not assume a
 * global exists; and a normal Vite SPA ships no `process` polyfill, so that
 * first clause is permanently true in the browser. Verified against a real
 * production build of butiq's admin app: the bundle contains `typeof process<"u"`
 * and live warning tags, and no `NODE_ENV` at all. So this is FAIL OPEN in the
 * strong sense — it warns everywhere except a runtime that proves production.
 * The inverted form (`typeof process === 'undefined' || ...`) would be dead for
 * every real consumer while every Node-based test still passed.
 */
function isDev(): boolean {
  return typeof process === 'undefined' || process?.env?.NODE_ENV !== 'production'
}

if (isDev()) {
  watchEffect(() => {
    if (!(KNOWN_VARIANTS as readonly string[]).includes(props.variant)) {
      console.warn(
        `[NsText] Unknown variant "${props.variant}", so class "ns-${props.variant}" was ` +
          'emitted and matches no stylesheet rule — this text is rendering at the ' +
          `browser default. Use one of: ${KNOWN_VARIANTS.join(', ')}.`,
      )
    }
    if (props.tone !== undefined && !(KNOWN_TONES as readonly string[]).includes(props.tone)) {
      console.warn(
        `[NsText] Unknown tone "${props.tone}", so "var(--ns-color-text-${props.tone})" was ` +
          'emitted, resolves to nothing, and this text silently inherits its parent ' +
          `colour instead. Use one of: ${KNOWN_TONES.join(', ')}.`,
      )
    }
  })
}
</script>

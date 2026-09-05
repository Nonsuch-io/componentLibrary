<template>
  <component :is="as" :class="['ns-text', `ns-${variant}`]" :style="toneStyle">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue'

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

/**
 * The type ramp, exactly as `tokens/typography.css` defines it. Each value
 * maps to `.ns-{variant}`; adding one here without adding the class there
 * renders unstyled, which is what `KNOWN_VARIANTS` below exists to catch.
 */
export type NsTextVariant =
  | 'caption'
  | 'overline'
  | 'overline-lg'
  | 'overline-md'
  | 'overline-md-bold'
  | 'body-sm'
  | 'body-md'
  | 'label-xs'
  | 'label-sm'
  | 'label-md'
  | 'heading-sm'
  | 'heading-sm-regular'
  | 'heading-md'
  | 'heading-md-regular'
  | 'heading-lg'
  | 'heading-lg-regular'
  | 'heading-xl'
  | 'heading-xl-regular'
  | 'heading-2xl'
  | 'heading-2xl-regular'
  | 'display'

/**
 * Text elements only. `<component :is>` renders whatever string it is given,
 * so an open `string` here would let `as="script"` through — and the union
 * costs nothing, since ADR 0002 rule 2 already requires one for any
 * vocabulary the design system names.
 */
export type NsTextElement =
  | 'span'
  | 'p'
  | 'div'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'label'
  | 'legend'
  | 'figcaption'
  | 'strong'
  | 'em'
  | 'small'

/**
 * Semantic text colours, resolved to `--ns-color-text-{tone}`. A curated
 * subset of the 28 text tokens: these are the ones the design actually uses
 * plus the obvious semantic set, kept short because the runtime array below
 * is shipped weight.
 */
export type NsTextTone =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'brand'
  | 'accent'
  | 'inverse'
  | 'positive'
  | 'negative'
  | 'warning'
  | 'info'
  | 'disabled'
  | 'link'

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
 * Neither throws, neither warns without this, and both look "almost right".
 */
const KNOWN_VARIANTS: readonly string[] = [
  'caption',
  'overline',
  'overline-lg',
  'overline-md',
  'overline-md-bold',
  'body-sm',
  'body-md',
  'label-xs',
  'label-sm',
  'label-md',
  'heading-sm',
  'heading-sm-regular',
  'heading-md',
  'heading-md-regular',
  'heading-lg',
  'heading-lg-regular',
  'heading-xl',
  'heading-xl-regular',
  'heading-2xl',
  'heading-2xl-regular',
  'display',
]

const KNOWN_TONES: readonly string[] = [
  'primary',
  'secondary',
  'tertiary',
  'brand',
  'accent',
  'inverse',
  'positive',
  'negative',
  'warning',
  'info',
  'disabled',
  'link',
]

/**
 * FAIL OPEN — warn unless we can PROVE production. Same shape and polarity as
 * useNsStylesheetWarning.ts and useNsDisabled.ts, deliberately: the inverted
 * form (`typeof process === 'undefined' || ...`) returns early in a browser,
 * where `typeof process` genuinely IS 'undefined', so the warning would be
 * dead for every real consumer while every Node-based test still passed.
 */
function isDev(): boolean {
  return typeof process === 'undefined' || process?.env?.NODE_ENV !== 'production'
}

if (isDev()) {
  watchEffect(() => {
    if (!KNOWN_VARIANTS.includes(props.variant)) {
      console.warn(
        `[NsText] Unknown variant "${props.variant}", so class "ns-${props.variant}" was ` +
          'emitted and matches no stylesheet rule — this text is rendering at the ' +
          `browser default. Use one of: ${KNOWN_VARIANTS.join(', ')}.`,
      )
    }
    if (props.tone !== undefined && !KNOWN_TONES.includes(props.tone)) {
      console.warn(
        `[NsText] Unknown tone "${props.tone}", so "var(--ns-color-text-${props.tone})" was ` +
          'emitted, resolves to nothing, and this text silently inherits its parent ' +
          `colour instead. Use one of: ${KNOWN_TONES.join(', ')}.`,
      )
    }
  })
}
</script>

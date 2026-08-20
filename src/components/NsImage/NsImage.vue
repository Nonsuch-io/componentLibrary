<template>
  <q-img v-bind="$attrs" class="ns-image">
    <slot />
  </q-img>
</template>

<script setup lang="ts">
import { useAttrs, watchEffect } from 'vue'

declare const process: { env: { NODE_ENV?: string } } | undefined
/**
 * NsImage — A styled wrapper around Quasar's QImg.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QImg props and events are forwarded via $attrs.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsImageProps {}

defineProps<NsImageProps>()

const attrs = useAttrs()

// QImg renders role="img" with aria-label={alt} (QImg.js:334). Without `alt` that
// is an image role with no name — axe reports role-img-alt and a screen reader
// announces "image" and nothing else. Decorative images want aria-hidden="true",
// not an empty alt: QImg still emits the role. Story: componentLibrary-057.
if (typeof process === 'undefined' || process?.env?.NODE_ENV !== 'production') {
  let warned = false
  watchEffect(() => {
    if (warned) return
    const named = typeof attrs.alt === 'string' && attrs.alt.trim() !== ''
    if (
      named ||
      attrs['aria-label'] !== undefined ||
      // aria-labelledby also satisfies axe's role-img-alt; omitting it made the
      // guard cry wolf at a correctly-named image (caught in review).
      attrs['aria-labelledby'] !== undefined ||
      attrs['aria-hidden'] !== undefined
    )
      return
    warned = true
    console.warn(
      '[NsImage] has no `alt`, so it announces as "image" with no description. ' +
        'Pass `alt` describing what the image CONVEYS, or aria-hidden="true" if it ' +
        'is purely decorative.',
    )
  })
}
</script>

<style lang="sass" scoped>
.ns-image
  font-family: var(--ns-font-family-text)
</style>

<template>
  <q-badge v-bind="attrsWithoutNsColour" :color="quasarColour" :class="['ns-badge', nsColourClass]">
    <slot />
  </q-badge>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'

/**
 * NsBadge — styled wrapper around QBadge.
 *
 * Figma specifies NINE colours; Quasar's palette has seven. `ghost` and `neutral`
 * fell through and emitted `.bg-ghost` / `.bg-neutral`, which match no CSS
 * anywhere — they rendered unstyled with no error, warning or type complaint.
 * Those two are handled here; everything else passes through untouched.
 *
 * NOT a strict union, despite ADR 0002 rule 2: of the consumer's 104 call sites,
 * 11 use Quasar palette names Figma has no opinion about (grey-4, orange) and
 * would break UNCONDITIONALLY; 62 more pass a bound `:color`.
 * `inheritAttrs: false` is required — Vue applies $attrs to the root IN ADDITION
 * to an explicit v-bind, which would re-emit the class we just withheld.
 * Story: componentLibrary-mwe.
 */

/** The two Figma colours Quasar has no equivalent for. */
const NS_ONLY_COLOURS = ['ghost', 'neutral'] as const
type NsOnlyColour = (typeof NS_ONLY_COLOURS)[number]

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsBadgeProps {}
defineProps<NsBadgeProps>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

const rawColour = computed(() => {
  const value = attrs.color
  return typeof value === 'string' ? value : undefined
})

const isNsOnly = computed(
  () => rawColour.value !== undefined && NS_ONLY_COLOURS.includes(rawColour.value as NsOnlyColour),
)

/**
 * Withhold `ghost`/`neutral` from Quasar. Passing them through would emit
 * `.bg-ghost` / `.bg-neutral`, which match nothing — the original bug. Every
 * other value still reaches Quasar untouched.
 */
const quasarColour = computed(() => (isNsOnly.value ? undefined : rawColour.value))

const nsColourClass = computed(() => (isNsOnly.value ? `ns-badge--${rawColour.value}` : undefined))

/**
 * `inheritAttrs: false` is required, not tidiness: Vue applies `$attrs` to the
 * root IN ADDITION to an explicit v-bind, so without it the raw `color` would
 * reach Quasar anyway and re-emit the class we just withheld.
 */
const attrsWithoutNsColour = computed(() => {
  if (!isNsOnly.value) return attrs
  const { color: _dropped, ...rest } = attrs
  return rest
})
</script>

<style lang="sass" scoped>
.ns-badge
  font-family: var(--ns-font-family-text)

  // Values resolved from Figma rather than invented — Ghost is genuinely
  // transparent (color-btn-tertiary-bg = #ffffff00), which is why it never had
  // a background token of its own.
  &--ghost
    background: var(--ns-color-btn-tertiary-bg)
    color: var(--ns-color-text-primary)

  &--neutral
    background: var(--ns-color-status-neutral)
    color: var(--ns-color-text-primary)
</style>

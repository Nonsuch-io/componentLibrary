<template>
  <q-badge v-bind="attrsWithoutNsColour" :color="quasarColour" :class="['ns-badge', nsColourClass]">
    <slot />
  </q-badge>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'

/**
 * NsBadge — A styled wrapper around Quasar's QBadge.
 *
 * Figma specifies NINE colours (Badges page, node 4451:1602): Primary,
 * Secondary, Accent, Positive, Negative, Info, Warning, Ghost and Neutral.
 * Quasar's palette has seven of them — it has no `ghost` and no `neutral`.
 *
 * SO TWO OF THE NINE FAILED SILENTLY (componentLibrary-mwe). `color` fell
 * through to Quasar, which emits a `.bg-<name>` class; `.bg-ghost` and
 * `.bg-neutral` match no CSS anywhere, so those badges rendered UNSTYLED with no
 * error, no warning and no type complaint. `--ns-color-status-neutral` existed
 * in all three theme blocks the whole time and the component could not reach it.
 *
 * WHY THIS IS NOT A STRICT UNION, which ADR 0002 rule 2 would otherwise suggest.
 * Measured against the only consumer before choosing: 104 `<ns-badge>` sites, of
 * which 62 pass a BOUND `:color` and 11 use Quasar palette names Figma has no
 * opinion about (`grey`, `grey-4`, `grey-7`, `orange`, `green`, `blue`). A union
 * of the nine Figma names would break roughly 73 of 104 — the same mistake as
 * the first draft of componentLibrary-nbr, where a `never` guard would have
 * turned 89 circular buttons square.
 *
 * The defect is narrow, so the fix is narrow: handle the two values Quasar
 * cannot, pass everything else through exactly as before. Nothing breaks, and
 * `ghost`/`neutral` start working. Whether the vocabulary should eventually be
 * locked down belongs with nbr, not here.
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

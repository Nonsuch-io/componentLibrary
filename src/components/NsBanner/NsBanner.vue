<template>
  <q-banner
    v-bind="$attrs"
    :class="['ns-banner', `ns-banner--${type}`]"
    :dense="dense"
    :rounded="rounded"
    :role="ariaRole"
    :aria-live="ariaLive"
  >
    <template v-if="$slots.avatar" #avatar>
      <slot name="avatar" />
    </template>

    <slot />

    <template v-if="$slots.action" #action>
      <slot name="action" />
    </template>
  </q-banner>
</template>

<script setup lang="ts">
/**
 * NsBanner — A styled banner wrapping Quasar's QBanner.
 *
 * Provides semantic type variants (info, positive, warning, negative)
 * with token-based colours and layout.
 *
 * `positive`/`negative` (not `success`/`error`) — componentLibrary-whr.
 * `positive`/`negative` is the design system's vocabulary: Figma's variant
 * names, the token names (`--ns-color-bg-positive`, `--ns-color-bg-negative`),
 * and NsButton's own `variant` union all agree on it. This component used to
 * be the only one that renamed it at the API boundary (`success`/`error`)
 * and then read the `positive`/`negative` tokens three lines later — so a
 * consumer following the design and writing `type="positive"` got an
 * unstyled banner with no error. Renamed CLEAN, with no alias: an alias
 * would keep the old, wrong vocabulary "working" indefinitely, which is the
 * exact confusion this fixes. See NsBanner.test.ts's "legacy prop values"
 * block for what passing the old spelling now does (nothing — same as any
 * other unrecognised value) and the Worker Report for why that was chosen
 * over a `useNsDisabled`-style warn+alias.
 */

import { computed, watchEffect } from 'vue'

declare const process: { env: { NODE_ENV?: string } } | undefined

export type NsBannerType = 'info' | 'positive' | 'warning' | 'negative'

export interface NsBannerProps {
  /** Semantic type controlling the banner colour */
  type?: NsBannerType
  /** Use dense (compact) layout */
  dense?: boolean
  /** Apply rounded border-radius */
  rounded?: boolean
}

const props = withDefaults(defineProps<NsBannerProps>(), {
  type: 'info',
  dense: false,
  rounded: true,
})

/**
 * Negative/warning banners are assertive alerts; info/positive are polite
 * status messages. `aria-live="assertive"` interrupts a screen reader, so it
 * stays scoped to exactly these two types rather than broadening with the
 * vocabulary change.
 */
const NS_BANNER_TYPES: readonly NsBannerType[] = ['info', 'positive', 'warning', 'negative']

/**
 * Warn on ANY value outside the union — not just the renamed ones.
 *
 * A legacy alias for `success`/`error` was rejected: it would keep the wrong
 * vocabulary producing correct output forever. But a bare rename leaves a
 * straggler silent, and the failure is worse than "unstyled" — a legacy
 * `type="error"` takes the ELSE branch of both computeds below, so it gets
 * role="status" + aria-live="polite" instead of alert + assertive. An error
 * banner a screen-reader user may never hear.
 *
 * Warning on the whole class covers `success`, `error`, and next year's
 * `postive` identically, never styles anything, and cannot expire into a
 * two-vocabulary problem. Typecheck catches most of it — but not `as any`,
 * not values arriving from data, and not storefront's `nuxt build`, which does
 * not typecheck.
 *
 * Fail-open guard: warn unless we can PROVE production. The inverted form is
 * dead in a browser, where `typeof process` genuinely is 'undefined'.
 */
watchEffect(() => {
  if (typeof process !== 'undefined' && process?.env?.NODE_ENV === 'production') return
  if (props.type === undefined || NS_BANNER_TYPES.includes(props.type)) return
  console.warn(
    `[NsBanner] type="${String(props.type)}" is not a valid NsBannerType. Valid values are ` +
      `${NS_BANNER_TYPES.map((t) => `"${t}"`).join(', ')}. The banner will render unstyled AND ` +
      `without the role/aria-live that "negative" and "warning" carry. Note "success" and ` +
      `"error" were renamed to "positive" and "negative" (componentLibrary-whr).`,
  )
})

const ariaRole = computed(() =>
  props.type === 'negative' || props.type === 'warning' ? 'alert' : 'status',
)
const ariaLive = computed(() =>
  props.type === 'negative' || props.type === 'warning' ? 'assertive' : 'polite',
)
</script>

<style lang="sass" scoped>
.ns-banner
  font-family: var(--ns-font-family-text)
  border-radius: var(--ns-radius-md)

  // INK IS text-on-bg-*, NOT text-*. `--ns-color-text-X` is a coloured text token
  // for a NEUTRAL surface; putting it on `--ns-color-bg-X` gave 1.36:1 warning
  // text in light mode and, in dark, the LITERALLY IDENTICAL hex for both
  // (#eaa500 on #eaa500, #fd6d73 on #fd6d73) -- invisible, not merely low
  // contrast. `--ns-color-text-on-X` is not the fix either: that one belongs to
  // the SOLID `--ns-color-status-X` surface, and white on the pale #fedee0 fill
  // is 1.25:1. Two different surfaces need two different inks. (componentLibrary-2p1,
  // reported by butiq-agent, who computed it rather than trusting the bead.)
  //
  // FALLBACKS ARE THE REAL LIGHT-MODE TOKEN VALUES. The previous ones were
  // Material palette hexes that resolved to a 1.48:1 pairing, and butiq quoted
  // them out of a bead AS the component's accessible treatment -- fallbacks read
  // exactly like fact because they are real hex sitting in our own source.

  &--info
    background-color: var(--ns-color-bg-info, #e0f1fa)
    color: var(--ns-color-text-on-bg-info, #2d0b00)

  &--positive
    background-color: var(--ns-color-bg-positive, #f3f4d2)
    color: var(--ns-color-text-on-bg-positive, #2d0b00)

  &--warning
    background-color: var(--ns-color-bg-warning, #f9e3ad)
    color: var(--ns-color-text-on-bg-warning, #2d0b00)

  &--negative
    background-color: var(--ns-color-bg-negative, #fedee0)
    color: var(--ns-color-text-on-bg-negative, #2d0b00)
</style>

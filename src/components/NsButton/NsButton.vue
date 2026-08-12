<template>
  <q-btn
    v-bind="attrsWithoutDisabled"
    unelevated
    no-caps
    :ripple="false"
    :loading="loading"
    :padding="buttonPadding"
    :aria-busy="loading"
    :disable="resolvedDisable"
    :class="['ns-btn', `ns-btn--${variant}`, `ns-btn--${size}`, { 'ns-btn--icon-only': iconOnly }]"
  >
    <slot />
    <template #loading>
      <slot name="loading">
        <q-spinner-dots />
      </slot>
    </template>
  </q-btn>
</template>

<script setup lang="ts">
import { computed, useAttrs, watchEffect } from 'vue'
import { QSpinnerDots } from 'quasar'
import { useNsAttrConflictWarning } from '../../composables/useNsAttrConflictWarning'
import { useNsDisabled } from '../../composables/useNsDisabled'

declare const process: { env: { NODE_ENV?: string } } | undefined

export type NsButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'accent'
  | 'positive'
  | 'negative'
  | 'warning'
  | 'marketing'
  | 'marketing-pushed'

export type NsButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface NsButtonProps {
  variant?: NsButtonVariant
  size?: NsButtonSize
  /** Square icon-only layout — use when no label slot is provided */
  iconOnly?: boolean
  loading?: boolean
  /** Disable the button */
  disable?: boolean
}

const props = withDefaults(defineProps<NsButtonProps>(), {
  variant: 'primary',
  size: 'md',
  iconOnly: false,
  loading: false,
  disable: false,
})

// QBtn renders a real <button>, so the `disabled` spelling natively disables
// it already — but without this it misses Quasar's `.disabled` class and
// `aria-disabled`, and doesn't get the loud alias warning the other
// controls get. See useNsDisabled and componentLibrary-ob8.
// inheritAttrs: false is REQUIRED, not tidiness. Vue applies $attrs to the root
// element automatically IN ADDITION to any explicit v-bind, so without this the
// raw `disabled` attribute lands on the DOM anyway and defeats the filtering
// below — measured: the attribute was still present on the rendered element.
defineOptions({ inheritAttrs: false })

const { resolvedDisable, attrsWithoutDisabled } = useNsDisabled('NsButton', () => props.disable)

// componentLibrary-nk3: `unelevated` is deliberately NOT in this list. It is hardcoded on the
// q-btn AFTER the attrs spread, so mergeProps always resolves ours and a consumer-passed value
// is inert — warning about it would be a false positive, and a guard that is wrong once gets
// ignored for the cases that matter (fable).
//
// NsButton declares neither `color` nor `flat` (and
// friends), so they fall through $attrs to QBtn and can silently collide
// with the `.ns-btn--*` variant CSS below (e.g. flat + color="primary"
// renders orange text on an orange background — both systems agree on the
// same brand colour, which is exactly what makes it invisible). This is a
// dev-only warning, not a reconciliation: it does NOT make the combination
// render correctly, it only makes the collision loud instead of silent.
const attrs = useAttrs()

/**
 * AN ICON-ONLY BUTTON WITH NO ACCESSIBLE NAME IS A BUTTON A SCREEN READER CANNOT
 * DESCRIBE. `iconOnly` means "there is no text here" — so unless the consumer
 * supplies aria-label, aria-labelledby or title, the control announces as
 * "button" and nothing else. axe reports it as button-name; nothing else can.
 *
 * THE LIBRARY CANNOT SUPPLY THE NAME. Only the call site knows what the icon
 * means, and inventing one ("Button", or the icon's name) would be worse than
 * silence: it produces a confident, wrong announcement instead of an obviously
 * missing one. So this warns and does not guess — the same reasoning as the
 * NsRadioButtons unlabelled-group guard.
 *
 * SCOPE, MEASURED RATHER THAN ASSUMED: all six `icon-only` call sites in the
 * only consumer are already named, so this fires zero times there today. It is
 * here to stop the seventh. The real population of unnamed icon buttons in that
 * codebase — 35 of them — uses Quasar's `round` attr instead, which this
 * component already warns about for a different reason and which
 * componentLibrary-nbr plans to make a type error. That gap is tracked
 * separately; it is their markup, not a defect this component can fix.
 */
if (typeof process === 'undefined' || process?.env?.NODE_ENV !== 'production') {
  watchEffect(() => {
    if (!props.iconOnly) return
    const named =
      attrs['aria-label'] !== undefined ||
      attrs['aria-labelledby'] !== undefined ||
      attrs['title'] !== undefined
    if (named) return
    console.warn(
      '[NsButton] `iconOnly` is set but the button has no accessible name, so it ' +
        'announces as "button" with no description. Add aria-label (or ' +
        'aria-labelledby / title) describing the ACTION, not the icon — ' +
        '"Delete item", not "trash".',
    )
  })
}

useNsAttrConflictWarning('NsButton', [
  { attrs: ['color'], useInstead: 'variant' },
  { attrs: ['text-color', 'textColor'], useInstead: 'variant' },
  { attrs: ['flat'], useInstead: 'variant' },
  { attrs: ['outline'], useInstead: 'variant' },
  { attrs: ['push'], useInstead: 'variant' },
  { attrs: ['glossy'], useInstead: 'variant' },
  // Size/shape collisions, not colour ones. Quasar's .q-btn--dense sets min-height and
  // .q-btn--round sets min-width/min-height, both of which LAND and fight the Ns size system —
  // while .q-btn--round's border-radius LOSES to our scoped .ns-btn radius, producing a
  // half-Quasar, half-Ns mongrel. Exactly the class of collision this guard exists for.
  { attrs: ['dense'], useInstead: 'size' },
  // NO useInstead. iconOnly is a SQUARE icon-only layout; round is a CIRCLE.
  // Recommending it would silently turn 89 butiq buttons square — the same
  // reasoning that took `round` off the never-list in componentLibrary-nbr.
  {
    attrs: ['round'],
    because:
      'There is no equivalent Ns prop yet — "iconOnly" is a square layout, not a circle. ' +
      'Leave "round" in place for now; see componentLibrary-nbr.',
  },
  // Same shape as `round`: a fab is a circular, elevated button. `size` changes
  // dimensions, not form, so it is not a replacement.
  {
    attrs: ['fab', 'fab-mini', 'fabMini'],
    because:
      'There is no equivalent Ns prop yet — a fab is a circular elevated button, and "size" ' +
      'only changes dimensions. Leave it in place for now; see componentLibrary-nbr.',
  },
])

const paddingMap: Record<NsButtonSize, { default: string; iconOnly: string }> = {
  xs: { default: '4px 8px', iconOnly: '8px' },
  sm: { default: '8px 12px', iconOnly: '8px' },
  md: { default: '8px 16px', iconOnly: '8px' },
  lg: { default: '12px 16px', iconOnly: '12px' },
  xl: { default: '20px', iconOnly: '12px' },
}

const buttonPadding = computed(() => {
  if (props.variant === 'marketing' || props.variant === 'marketing-pushed')
    return props.iconOnly ? '12px' : '16px 20px'
  return paddingMap[props.size][props.iconOnly ? 'iconOnly' : 'default']
})
</script>

<style lang="scss" scoped>
// ---- Base ----
.ns-btn {
  font-family: var(--ns-font-family-text);
  font-weight: 600;
  border-radius: 8px;
  transition:
    background 150ms ease,
    color 150ms ease,
    box-shadow 150ms ease;

  :deep(.q-btn__wrapper) {
    min-height: unset; /* Quasar 2.x internal — revisit on major Quasar bump */
  }

  :deep(.q-btn__content) {
    gap: 4px; /* Quasar 2.x internal — revisit on major Quasar bump */
  }
}

// ---- Sizes ----
.ns-btn--xs {
  font-size: 12px;
}

.ns-btn--sm {
  font-size: 12px;
}

.ns-btn--md {
  font-size: 14px;
}

.ns-btn--lg {
  font-size: 16px;

  :deep(.q-btn__content) {
    gap: 8px; /* Quasar 2.x internal — revisit on major Quasar bump */
  }
}

.ns-btn--xl {
  font-size: 20px;

  :deep(.q-btn__content) {
    gap: 12px; /* Quasar 2.x internal — revisit on major Quasar bump */
  }

  &.ns-btn--icon-only {
    border-radius: 12px;
  }
}

// ---- Primary ----
.ns-btn--primary {
  background: var(--ns-color-bg-brand);
  color: var(--ns-color-text-on-brand);

  &:hover:not(.disabled) {
    background: var(--ns-color-bg-brand-hover);
  }

  &:active:not(.disabled) {
    background: var(--ns-color-bg-brand-active);
  }

  &.disabled {
    background: var(--ns-color-bg-disabled);
    color: var(--ns-color-text-disabled);
  }
}

// ---- Secondary ----
.ns-btn--secondary {
  background: var(--ns-color-bg-canvas);
  color: var(--ns-color-text-brand);
  box-shadow: inset 0 0 0 1px var(--ns-color-border-brand);

  &:hover:not(.disabled) {
    background: var(--ns-color-bg-surface);
    color: var(--ns-color-bg-brand-hover);
    box-shadow: inset 0 0 0 1px var(--ns-color-bg-brand-hover);
  }

  &:active:not(.disabled) {
    background: var(--ns-color-bg-header);
    color: var(--ns-color-bg-brand-active);
    box-shadow: inset 0 0 0 1px var(--ns-color-bg-brand-active);
  }

  &.disabled {
    background: transparent;
    color: var(--ns-color-text-disabled);
    box-shadow: inset 0 0 0 1px var(--ns-color-text-disabled);
  }
}

// ---- Tertiary ----
.ns-btn--tertiary {
  background: transparent;
  color: var(--ns-color-text-brand);

  &:hover:not(.disabled) {
    color: var(--ns-color-bg-brand-hover);
  }

  &:active:not(.disabled) {
    color: var(--ns-color-text-brand);
  }

  &.disabled {
    color: var(--ns-color-bg-disabled);
  }
}

// ---- Accent ----
.ns-btn--accent {
  background: var(--ns-color-status-accent);
  color: var(--ns-color-text-on-accent);

  &:hover:not(.disabled) {
    background: var(--ns-color-status-accent-hover);
  }

  &:active:not(.disabled) {
    background: var(--ns-color-status-accent-active);
    color: var(--ns-color-text-on-brand);
  }

  &.disabled {
    background: var(--ns-color-bg-disabled);
    color: var(--ns-color-text-disabled);
  }
}

// ---- Positive ----
.ns-btn--positive {
  background: var(--ns-color-status-positive);
  // on-POSITIVE, matching the background token. Was on-accent, which happens to
  // resolve to the same #2d0b00 — see the note above .ns-btn--negative.
  color: var(--ns-color-text-on-positive);

  &:hover:not(.disabled) {
    background: var(--ns-color-status-positive-hover);
  }

  &:active:not(.disabled) {
    background: var(--ns-color-status-positive-active);
  }

  &.disabled {
    background: var(--ns-color-bg-disabled);
    color: var(--ns-color-text-disabled);
  }
}

// ---- Negative ----
.ns-btn--negative {
  background: var(--ns-color-status-negative);
  // ON-NEGATIVE, AND THIS ONE IS NOT COSMETIC (componentLibrary-34n).
  // Three variants paired a background with an unrelated on-colour token, and it
  // rendered correctly because the pairs coincidentally resolved to the same hex
  // — on-accent and on-positive were both #2d0b00, on-brand and on-negative both
  // #ffffff. The whole point of separate on-colour tokens is that a designer can
  // move one; the day that happened, three variants would break and each
  // declaration would still read perfectly sensibly on its own.
  //
  // The day arrived. componentLibrary-2p1 changed --ns-color-text-on-negative to
  // #2d0b00 in the DARK blocks, because white on dark's light-salmon #fd6d73 is
  // 2.76:1 and failed on its own intended surface. This button still asked for
  // on-BRAND, so it kept the white and kept the 2.76:1. Using the token that
  // matches its background takes it to 6.56:1.
  color: var(--ns-color-text-on-negative);

  &:hover:not(.disabled) {
    background: var(--ns-color-status-negative-hover);
  }

  &:active:not(.disabled) {
    background: var(--ns-color-status-negative-active);
  }

  &.disabled {
    background: var(--ns-color-bg-disabled);
    color: var(--ns-color-text-disabled);
  }
}

// ---- Warning ----
.ns-btn--warning {
  background: var(--ns-color-status-warning);
  // on-WARNING, matching the background token. Was on-accent.
  color: var(--ns-color-text-on-warning);

  &:hover:not(.disabled) {
    background: var(--ns-color-status-warning-hover);
  }

  &:active:not(.disabled) {
    background: var(--ns-color-status-warning-active);
  }

  &.disabled {
    background: var(--ns-color-bg-disabled);
    color: var(--ns-color-text-disabled);
  }
}

// ---- Marketing (shared base) ----
.ns-btn--marketing,
.ns-btn--marketing-pushed {
  border-radius: 9999px;
  font-size: 1.5rem;

  :deep(.q-btn__content) {
    gap: 12px;
  }

  &.disabled {
    background: var(--ns-color-bg-disabled);
    color: var(--ns-color-text-disabled);

    :deep(img) {
      filter: brightness(0.565);
    }
  }
}

// ---- Marketing ----
.ns-btn--marketing {
  // componentLibrary-nk3: was var(--ns-color-text-primary), a TEXT token
  // that flips with the theme (#2d0b00 light / #fef7ee dark) while the
  // `color: white` below is hardcoded and cannot flip — 1.06:1 contrast in
  // dark mode. --ns-color-bg-dark is #2d0b00 in BOTH modes (it doesn't flip),
  // so this preserves the light-mode look exactly and fixes dark mode.
  background: var(--ns-color-bg-dark);
  color: white;

  :deep(img) {
    filter: brightness(0) invert(1);
  }

  &:hover:not(.disabled) {
    background: #3d1500;
  }

  &:active:not(.disabled) {
    background: #1e0700;
  }
}

// ---- Marketing pushed ----
.ns-btn--marketing-pushed {
  background: var(--ns-color-status-positive);
  // A FOURTH instance, not listed in componentLibrary-34n's three. Found by
  // auditing every background/on-colour pair mechanically rather than fixing the
  // three the bead named — which is the argument for the test below existing at
  // all. Same coincidence: on-accent and on-positive are both #2d0b00 today.
  color: var(--ns-color-text-on-positive);

  :deep(img) {
    filter: none;
  }

  &:hover:not(.disabled) {
    background: var(--ns-color-status-positive-hover);
  }

  &:active:not(.disabled) {
    background: var(--ns-color-status-positive-active);
  }
}
</style>

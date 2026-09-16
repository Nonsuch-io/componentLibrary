<template>
  <NsMenu
    v-bind="{ maxWidth: '450px', ...$attrs }"
    :model-value="modelValue"
    class="ns-tooltip-details"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="ns-tooltip-details__panel">
      <p class="ns-tooltip-details__text ns-body-md"><slot /></p>
      <NsButton
        variant="tertiary"
        size="sm"
        icon-only
        class="ns-tooltip-details__close"
        :aria-label="locale.common.close"
        @click="$emit('update:modelValue', false)"
      >
        <PhX :size="16" weight="regular" />
      </NsButton>
    </div>
  </NsMenu>
</template>

<script setup lang="ts">
/**
 * NsTooltipDetails — a DISMISSIBLE details panel opened from a "What is
 * this?" trigger beside a field (design `NsTooltipDetails`, the base under
 * NsToolTipDetailsPostalCode 2440:223869; componentLibrary-605). Not the
 * library's NsTooltip: that is a hover tip that goes away on its own. This
 * takes focus, stays until dismissed, and gives focus back.
 *
 * MEASURED 2026-09-16 on 185:11426 (five identical instances in the SIGN UP
 * section, all the PostalCode variant): a surface panel, 12px padding, 10px
 * between the text and the X, radius 8, the "shadow-md" effect (0 3 10 at
 * 10%); body text 14/400 taking the width; a 32px X (4px padding around a
 * 24px icon — here NsButton sm icon-only with a 16px icon, the library's
 * 32). 246 wide in the section instance, 450 on the main component: the
 * width is the anchor's context, so the panel is content-sized up to 450.
 * The GST/HST variant the bead names has NO instance and no addressable
 * main: sample size 0 — recorded as a name, not a shape. Both variants are
 * content, so this is the base and the words are the slot.
 *
 * BUILT ON NsMenu (QMenu), which already IS the disclosure pattern: the
 * anchor gets aria-expanded, the popup takes focus on open, Escape and a
 * click outside close it, and focus returns to the anchor on hide — the
 * "return path for focus" the bead asked for, measured in the story. The
 * panel adds the chrome and an explicit Close button, because a panel that
 * only closes on Escape is invisible to a pointer user. Anchoring, offsets
 * and the trigger are the consumer's, through NsMenu's attrs and NsButton;
 * the story shows the design's "What is this?" trigger.
 */
import { PhX } from '@phosphor-icons/vue'
import NsMenu from '../NsMenu/NsMenu.vue'
import NsButton from '../NsButton/NsButton.vue'
import { useNsLocale } from '../../composables/useNsLocale'

export interface NsTooltipDetailsProps {
  /** v-model — whether the panel is open. Omit to let NsMenu manage it from its anchor. */
  modelValue?: boolean
}

withDefaults(defineProps<NsTooltipDetailsProps>(), { modelValue: undefined })

defineEmits<{
  'update:modelValue': [open: boolean]
}>()

defineOptions({ inheritAttrs: false })

const locale = useNsLocale()
</script>

<style lang="scss">
// UNSCOPED on purpose: QMenu teleports the popup to the body, so the scoped
// attribute never lands on `.q-menu` and a scoped rule cannot reach it —
// measured here (radius stayed 4px) and on NsMenu (componentLibrary-3sy).
// The element carries this class from `class` above; nothing else has it.
.q-menu.ns-tooltip-details {
  // QMenu's own surface: the panel below carries the design's; the popup
  // keeps only its positioning; QMenu's shadow is replaced by the token.
  border-radius: var(--ns-radius-md);
  box-shadow: var(--ns-shadow-md);
  // The 450 cap is QMenu's own `max-width` prop (an inline style that beats
  // CSS), defaulted above and overridable through attrs.
}
</style>

<style lang="scss" scoped>
.ns-tooltip-details {
  &__panel {
    display: flex;
    align-items: flex-start;
    gap: 10px; // the design's, not a token — 10 sits between space-2 and space-3
    padding: var(--ns-space-3);
    background: var(--ns-color-bg-surface);
    color: var(--ns-color-text-primary);
  }

  &__text {
    flex: 1 1 auto;
    min-width: 0;
    margin: 0;
  }

  &__close {
    flex: 0 0 auto;
  }
}
</style>

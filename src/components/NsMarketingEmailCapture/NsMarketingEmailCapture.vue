<template>
  <div
    class="ns-marketing-email-capture"
    :class="{ 'ns-marketing-email-capture--focused': isFocused }"
  >
    <input
      class="ns-marketing-email-capture__input"
      type="email"
      :aria-label="resolvedAriaLabel"
      :placeholder="resolvedPlaceholder"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @focus="isFocused = true"
      @blur="isFocused = false"
    />
    <slot name="cta" />
  </div>
</template>

<script setup lang="ts">
/**
 * NsMarketingEmailCapture — Pill-style email capture for marketing pages.
 *
 * Renders a raw <input type="email"> rather than wrapping NsInput, because
 * the marketing pill design needs a borderless, transparent input that
 * integrates into a parent-styled container (with the CTA button beside
 * it inside the same pill on desktop). NsInput wraps Quasar's QInput,
 * which renders four layers of wrapping DOM with its own padding,
 * borders, and focus styling — fighting that to look "marketing pill"
 * would require extensive :deep() overrides on Quasar internals, which
 * is fragile across Quasar updates. The raw input here keeps the
 * accessibility essentials (type=email, aria-label, focus-visible box-
 * shadow) and the marketing-specific styling stays simple.
 *
 * Strings (aria-label, placeholder) follow the documented locale
 * resolution order: explicit prop → injected NsLocaleMessages → en-CA
 * built-ins.
 */
import { computed, ref } from 'vue'
import { useNsLocale } from '../../composables/useNsLocale'

export interface NsMarketingEmailCaptureProps {
  modelValue?: string
  /** Visible placeholder text. Falls back to the injected locale's marketing.emailPlaceholder, then en-CA. */
  placeholder?: string
  /** Accessible name for the input. Falls back to the injected locale's marketing.emailAddress, then en-CA. */
  ariaLabel?: string
}

const props = withDefaults(defineProps<NsMarketingEmailCaptureProps>(), {
  modelValue: '',
  placeholder: undefined,
  ariaLabel: undefined,
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const locale = useNsLocale()
const isFocused = ref(false)

const resolvedPlaceholder = computed(() => props.placeholder ?? locale.marketing.emailPlaceholder)
const resolvedAriaLabel = computed(() => props.ariaLabel ?? locale.marketing.emailAddress)
</script>

<style lang="scss" scoped>
.ns-marketing-email-capture {
  display: flex;
  flex-direction: column;
  gap: var(--ns-space-3);
  width: 100%;
  transition: box-shadow 150ms ease;

  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: center;
    background: var(--ns-color-bg-surface);
    border-radius: var(--ns-radius-full);
    padding: 8px 8px 8px 32px;

    &--focused {
      box-shadow: 0 0 0 3px var(--ns-color-border-focus);
    }
  }

  &__input {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: var(--ns-color-bg-surface);
    border-radius: var(--ns-radius-full);
    padding: var(--ns-space-4) var(--ns-space-6);
    font-family: var(--ns-font-family-text);
    font-size: 1.25rem;
    line-height: 1.25;
    color: var(--ns-color-text-primary);

    &:focus {
      box-shadow: 0 0 0 3px var(--ns-color-border-focus);
      outline: none;
    }

    @media (min-width: 1024px) {
      background: transparent;
      border-radius: 0;
      padding: 0;

      &:focus {
        box-shadow: none;
      }
    }

    &::placeholder {
      color: var(--ns-color-text-tertiary);
    }
  }
}
</style>

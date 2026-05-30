<template>
  <div
    class="ns-marketing-email-capture"
    :class="{ 'ns-marketing-email-capture--focused': isFocused }"
  >
    <input
      class="ns-marketing-email-capture__input"
      type="email"
      aria-label="Email address"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @focus="isFocused = true"
      @blur="isFocused = false"
    />
    <slot name="cta" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

export interface NsMarketingEmailCaptureProps {
  modelValue?: string
  placeholder?: string
}

withDefaults(defineProps<NsMarketingEmailCaptureProps>(), {
  modelValue: '',
  placeholder: 'your@email.com',
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const isFocused = ref(false)
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

<template>
  <div class="ns-step-list">
    <slot />
    <div class="ns-step-list__closing-separator" />
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.ns-step-list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;

  &__closing-separator {
    height: 1px;
    width: 100%;
    background: var(--ns-color-border-brand);
  }
}
</style>

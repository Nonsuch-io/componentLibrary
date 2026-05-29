<template>
  <div class="ns-eyebrow-tag">
    <slot />
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.ns-eyebrow-tag {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: var(--ns-color-bg-highlight);
  color: var(--ns-color-text-primary);
  font-family: var(--ns-font-family-text);
  font-size: 1.75rem;
  font-weight: 400;
  line-height: 1.1;
  text-transform: uppercase;
  white-space: nowrap;
}
</style>

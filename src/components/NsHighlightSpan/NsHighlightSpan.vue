<template>
  <div class="ns-highlight-span">
    <slot />
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.ns-highlight-span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background: var(--ns-color-status-accent);
  color: var(--ns-color-text-primary);
  font-family: var(--ns-font-family-display);
  font-size: 5.75rem;
  font-weight: 600;
  font-style: italic;
  line-height: 1.1;
  white-space: nowrap;
}
</style>

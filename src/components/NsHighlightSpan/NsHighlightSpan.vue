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
  font-family: var(--ns-font-family-text);
  font-size: 2rem;
  font-weight: var(--ns-font-weight-semibold);
  font-style: italic;
  line-height: 1.15;
  white-space: nowrap;

  @media (min-width: 1024px) {
    font-family: var(--ns-font-family-display);
    font-size: var(--ns-font-size-display);
    font-weight: 600;
    line-height: 1.1;
  }
}
</style>

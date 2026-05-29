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
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px;
  background: var(--ns-color-bg-highlight);
  color: var(--ns-color-text-primary);
  font-family: var(--ns-font-family-text);
  font-size: var(--ns-font-size-xl);
  font-weight: 400;
  line-height: 1.1;
  text-transform: uppercase;

  @media (min-width: 1024px) {
    font-size: 1.75rem;
    white-space: nowrap;
    flex-wrap: nowrap;
  }
}
</style>

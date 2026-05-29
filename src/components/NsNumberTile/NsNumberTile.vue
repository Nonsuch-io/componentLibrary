<template>
  <div class="ns-number-tile">
    <span class="ns-number-tile__number">{{ number }}</span>
  </div>
</template>

<script setup lang="ts">
export interface NsNumberTileProps {
  number: number | string
}

defineProps<NsNumberTileProps>()
</script>

<style lang="scss" scoped>
.ns-number-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  width: 78px;
  background: var(--ns-color-bg-header);

  &__number {
    font-family: var(--ns-font-family-text);
    font-size: 3rem;
    font-weight: 600;
    line-height: 1.1;
    color: var(--ns-color-text-brand);
    text-align: center;
    width: 100%;
  }
}
</style>

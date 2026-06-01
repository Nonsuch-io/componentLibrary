<template>
  <section class="ns-hero">
    <div class="ns-hero__eyebrow">
      <slot name="eyebrow" />
    </div>
    <div class="ns-hero__media">
      <slot name="media" />
    </div>
    <div class="ns-hero__headline">
      <slot name="headline" />
    </div>
    <div class="ns-hero__capture">
      <slot name="capture" />
    </div>
  </section>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.ns-hero {
  display: flex;
  flex-direction: column;
  gap: var(--ns-space-6);
  width: 100%;
  padding: var(--ns-space-6) var(--ns-space-4);
  overflow: hidden;

  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-areas:
      'eyebrow  media'
      'headline media'
      'capture  media';
    row-gap: var(--ns-space-8);
    column-gap: var(--ns-space-3);
    min-height: 640px;
    padding: var(--ns-space-10) var(--ns-space-12);
  }

  &__eyebrow {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    @media (min-width: 1024px) {
      grid-area: eyebrow;
    }
  }

  &__media {
    display: flex;
    align-items: center;
    justify-content: center;

    @media (min-width: 1024px) {
      grid-area: media;
      align-items: flex-start;
      justify-content: flex-end;
    }
  }

  &__headline {
    display: flex;
    flex-direction: column;
    gap: var(--ns-space-4);
    font-family: var(--ns-font-family-text);
    font-size: 2rem;
    font-weight: var(--ns-font-weight-semibold);
    line-height: 1.15;
    color: var(--ns-color-text-primary);

    @media (min-width: 1024px) {
      grid-area: headline;
      font-size: var(--ns-font-size-display);
      font-weight: 600;
      line-height: 1.1;
    }
  }

  &__capture {
    @media (min-width: 1024px) {
      grid-area: capture;
      padding-top: var(--ns-space-4);
    }
  }
}

/*
 * Optional decorative element above the capture input.
 *
 * Consumers can place a decorative graphic (e.g. a doodle arrow pointing at
 * the call-to-action) inside the capture slot — apply
 * .ns-hero__capture-doodle to it and wrap the capture content in a
 * `position: relative` container so the absolute positioning works.
 *
 * Mobile (<1024px): hovers above the centre of the capture, rotated -45deg.
 * Desktop (>=1024px): hovers above the top-right of the capture, no rotation.
 *
 * :deep() is required because the doodle is rendered as slot content (owned
 * by the parent's CSS scope, not NsHero's).
 */
:deep(.ns-hero__capture-doodle) {
  position: absolute;
  width: 8rem;
  height: auto;
  pointer-events: none;
  bottom: calc(100% + 0.5rem);
  left: 50%;
  transform: translateX(-50%) rotate(-45deg);
  transform-origin: center;

  @media (min-width: 1024px) {
    width: 13rem;
    left: auto;
    right: 1.25rem;
    bottom: calc(100% + 1.25rem);
    transform: none;
  }
}
</style>

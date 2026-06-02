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
    /*
     * Deliberate one-off layout dimension: ensures the hero retains a
     * minimum visual presence above the fold even when the headline /
     * capture content is short. Not promoted to a design token because
     * it's specific to this section, not a shared system value.
     */
    min-height: var(--ns-hero-min-height, 40rem);
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
    /* Mobile: clearance above the input so a decorative doodle
     * (.ns-hero__capture-doodle, see below) doesn't overlap the
     * headline / description stacked above it. */
    margin-top: 5rem;

    @media (min-width: 1024px) {
      margin-top: 0;
      grid-area: capture;
      padding-top: var(--ns-space-4);
    }
  }
}
</style>

<!--
  Unscoped styles for the optional decorative doodle element.

  Consumers can place a decorative graphic (e.g. a doodle arrow pointing
  at the call-to-action) inside the capture slot — apply
  .ns-hero__capture-doodle to it and wrap the capture content in a
  `position: relative` container so the absolute positioning works.

  Mobile (<1024px): centred above the input, rotated -35deg.
  Desktop (>=1024px): anchored at the wrapper's top-right corner and
  translated outward so the visible doodle hangs above-right of the input.

  These rules live in an UNSCOPED block (not `scoped`) because the doodle
  is rendered as slot content, owned by the parent's CSS scope. We tried
  `:deep(.ns-hero__capture-doodle)` inside the scoped block, but Vue's
  scoped-style compiler silently drops some declarations from @media
  rules when :deep() is involved (observed: `right: 0` and `left: auto`
  stripped from the compiled @media rule, leaving the doodle anchored at
  the wrapper's left edge on desktop). Hoisting to an unscoped block
  sidesteps the bug. The `.ns-hero__capture-doodle` class is namespaced
  enough that leakage isn't a concern.

  The desktop translate values are tuned to the marketing doodle SVG's
  specific 214×145 canvas — visible paths are distributed across the
  upper-left, upper-center-right, and lower-right of the viewBox, so a
  naïve "centre at the corner" placement would leave the lower-right
  path dripping into the input area. Asset-specific; revisit if the
  doodle SVG changes.
-->
<style lang="scss">
.ns-hero__capture-doodle {
  position: absolute;
  width: 8rem;
  height: auto;
  pointer-events: none;
  bottom: calc(100% + 0.5rem);
  /*
   * Horizontally centre an absolutely-positioned element with explicit
   * width: `left: 0; right: 0` over-constrains, and
   * `margin-left/right: auto` resolves by distributing equally.
   *
   * Uses the individual `rotate` and `translate` CSS properties rather
   * than the `transform` shorthand — they compose in a fixed
   * translate→rotate order regardless of declaration order, which
   * sidesteps the right-to-left composition pitfall of `transform:
   * translateX(...) rotate(...)` where the rotation composes first and
   * the translate then shifts along the rotated axis.
   */
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  rotate: -35deg;

  @media (min-width: 1024px) {
    width: 13rem;
    top: 0;
    right: 0;
    bottom: auto;
    left: auto;
    margin-left: 0;
    margin-right: 0;
    /*
     * Anchor: top-right corner of the wrapper.
     * Translate the bbox up by ~70% of its own height and right by ~46%
     * of its own width so the visible-content cluster sits above-and-
     * right of the corner.
     */
    rotate: 0deg;
    translate: 46% -70%;
  }
}
</style>

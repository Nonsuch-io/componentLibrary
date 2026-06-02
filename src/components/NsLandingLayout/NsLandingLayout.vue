<template>
  <div class="ns-landing-layout">
    <header v-if="$slots.header" class="ns-landing-layout__header">
      <slot name="header" />
    </header>
    <section v-if="$slots.hero" class="ns-landing-layout__hero">
      <slot name="hero" />
    </section>
    <main v-if="$slots.default" class="ns-landing-layout__main">
      <slot />
    </main>
    <footer v-if="$slots.footer" class="ns-landing-layout__footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup lang="ts">
/**
 * NsLandingLayout — Marketing landing page scaffold.
 *
 * Provides the structural skeleton for a public-facing marketing
 * landing page: a header band, a hero section, a stack of arbitrary
 * content sections, and a footer band. Consumers supply each piece
 * via named slots and the default slot.
 *
 * Slots:
 *   - header: site header / nav (e.g. NsSiteHeader)
 *   - hero: above-the-fold hero (e.g. NsHero)
 *   - default: any number of mid-page sections (e.g. NsTrustBar,
 *     NsExpectSection, NsAboutSection) stacked in source order
 *   - footer: site footer (e.g. NsSiteFooter)
 */
</script>

<style lang="scss" scoped>
.ns-landing-layout {
  display: flex;
  flex-direction: column;
  background: var(--ns-color-bg-header);
  font-family: var(--ns-font-family-text);
}
</style>

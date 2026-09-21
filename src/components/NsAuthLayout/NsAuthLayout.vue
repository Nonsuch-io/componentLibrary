<template>
  <NsLayout class="ns-auth-layout" :class="`ns-auth-layout--${surface}`">
    <NsPageContainer>
      <NsPage class="ns-auth-layout__page">
        <div class="ns-auth-layout__container" :style="containerStyle">
          <div v-if="$slots.branding" class="ns-auth-layout__branding">
            <slot name="branding" />
          </div>
          <NsCard v-if="surface === 'card'" class="ns-auth-layout__card">
            <slot />
          </NsCard>
          <slot v-else />
        </div>
      </NsPage>
    </NsPageContainer>
  </NsLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import NsLayout from '../NsLayout/NsLayout.vue'
import NsPage from '../NsPage/NsPage.vue'
import NsPageContainer from '../NsPageContainer/NsPageContainer.vue'
import NsCard from '../NsCard/NsCard.vue'

/**
 * NsAuthLayout — A centered layout for authentication flows.
 *
 * Provides a vertically and horizontally centered card container
 * ideal for login, register, 2FA, and similar auth pages.
 * Mobile-first: full-width with padding on small screens,
 * constrained max-width on larger screens.
 */
/**
 * `card` (the default) is the login shell: one NsCard, vertically centred.
 * `canvas` is the sign-up shell (componentLibrary-grj.2, Figma 264:26835
 * "Sign Up Form (FULL) [Desktop]", read 2026-09-18): the content sits
 * DIRECTLY on the page — the slot's own section cards (NsFormSection) on the
 * canvas fill — top-aligned, with the design's 40px vertical and 32px side
 * padding at desktop. Before this, a sign-up page in this layout was a card
 * inside a card, on a white body: no library component paints the canvas,
 * so this mode does. The frame's fill is `color-bg-canvas` #fefbf5 — the
 * outer frame's variables carry it, and the library's token matches.
 */
export type NsAuthLayoutSurface = 'card' | 'canvas'

export interface NsAuthLayoutProps {
  /** Maximum width of the content column (CSS value). 440px suits the card; the sign-up frame is 910 wide. */
  maxWidth?: string
  /** `card` (default) wraps the slot in an NsCard; `canvas` puts it straight on the canvas fill. */
  surface?: NsAuthLayoutSurface
}

const props = withDefaults(defineProps<NsAuthLayoutProps>(), {
  maxWidth: '440px',
  surface: 'card',
})

const containerStyle = computed(() => ({
  maxWidth: props.maxWidth,
}))
</script>

<style lang="sass" scoped>
.ns-auth-layout__page
  display: flex
  align-items: center
  justify-content: center
  min-height: inherit
  padding: var(--ns-space-4)

// canvas (264:26838 "Page Content"): the fill, top-aligned content — a long
// form must not float to the vertical middle — and the design's inset,
// 40 above and below, 32 at the sides at desktop; the mobile frame was not
// read, so below 1024 the card mode's 16 stands (INFERRED).
.ns-auth-layout--canvas .ns-auth-layout__page
  align-items: flex-start
  background: var(--ns-color-bg-canvas)

@media (min-width: 1024px)
  .ns-auth-layout--canvas .ns-auth-layout__page
    padding: var(--ns-space-10) var(--ns-space-8)

.ns-auth-layout__container
  width: 100%
  margin: 0 auto

.ns-auth-layout__branding
  text-align: center
  margin-bottom: var(--ns-space-6)

.ns-auth-layout__card
  width: 100%
</style>

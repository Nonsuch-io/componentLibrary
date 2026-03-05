<template>
  <NsLayout class="ns-auth-layout">
    <NsPageContainer>
      <NsPage class="ns-auth-layout__page">
        <div class="ns-auth-layout__container" :style="containerStyle">
          <div v-if="$slots.branding" class="ns-auth-layout__branding">
            <slot name="branding" />
          </div>
          <NsCard class="ns-auth-layout__card">
            <slot />
          </NsCard>
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
export interface NsAuthLayoutProps {
  /** Maximum width of the auth card container (CSS value) */
  maxWidth?: string
}

const props = withDefaults(defineProps<NsAuthLayoutProps>(), {
  maxWidth: '440px',
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

.ns-auth-layout__container
  width: 100%
  margin: 0 auto

.ns-auth-layout__branding
  text-align: center
  margin-bottom: var(--ns-space-6)

.ns-auth-layout__card
  width: 100%
</style>

<template>
  <footer class="ns-site-footer">
    <div class="ns-site-footer__inner">
      <span v-if="label" class="ns-site-footer__label">{{ label }}</span>
      <div v-if="socialLinks?.length" class="ns-site-footer__social">
        <a
          v-for="link in socialLinks"
          :key="link.href"
          :href="link.href"
          :aria-label="link.label"
          class="ns-site-footer__social-link"
          target="_blank"
          rel="noopener"
        >
          <img :src="link.icon" class="ns-site-footer__social-icon" :alt="link.label" />
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
export interface NsSiteFooterSocialLink {
  href: string
  icon: string
  label: string
}

export interface NsSiteFooterProps {
  label?: string
  socialLinks?: NsSiteFooterSocialLink[]
}

withDefaults(defineProps<NsSiteFooterProps>(), {
  label: undefined,
  socialLinks: () => [],
})
</script>

<style lang="scss" scoped>
.ns-site-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 125px;
  padding: var(--ns-space-10) var(--ns-space-12);
  background: var(--ns-color-status-accent);

  &__inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: 100%;
    font-family: var(--ns-font-family-text);
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.25;
    color: var(--ns-color-text-primary);
    text-align: center;
  }

  &__social {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__social-icon {
    width: 32px;
    height: 32px;
    display: block;
  }
}
</style>

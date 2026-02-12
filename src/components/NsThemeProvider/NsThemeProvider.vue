<template>
  <slot />
</template>

<script setup lang="ts">
import type { NsLocaleMessages } from '../../locale/NsLocaleMessages'
import { nsLocaleEnCA } from '../../locale/en-CA'
import { provideNsLocale } from '../../composables/useNsLocale'

/**
 * NsThemeProvider — Renderless wrapper that provides locale context
 * to a subtree of Ns components.
 *
 * Useful for:
 * - Micro-frontends embedding Ns components in a section
 * - Overriding locale for a specific part of the page
 * - Testing components with different locales
 *
 * @example
 * ```vue
 * <NsThemeProvider :locale="frCA">
 *   <NsButton>{{ $t('checkout') }}</NsButton>
 * </NsThemeProvider>
 * ```
 */

export interface NsThemeProviderProps {
  /** Locale messages to provide to descendant Ns components */
  locale?: NsLocaleMessages
}

const props = withDefaults(defineProps<NsThemeProviderProps>(), {
  locale: () => nsLocaleEnCA,
})

provideNsLocale(props.locale)
</script>

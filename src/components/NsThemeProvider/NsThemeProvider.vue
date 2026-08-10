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

<!--
  Deliberately UNSCOPED (not `scoped`). A scoped block compiles `:root { ... }`
  to `:root[data-v-xxxxxx] { ... }`, which never matches anything — Vue only
  stamps that attribute on elements the component itself renders, and this
  component renders none but its slot. An unscoped block emits the literal
  `:root` rule this needs.

  This is not visual. It exists purely as a detectable sentinel: if a
  consumer's page resolves `--ns-styles-loaded`, `@nonsuch/component-library
  /style.css` was loaded; if it doesn't, nothing else in this file's built CSS
  did either. `createNonsuch()` reads it once, on install, and warns if it's
  missing — see useNsStylesheetWarning.ts and componentLibrary-07u. Measured:
  before this, dist/nonsuch-components.css defined zero custom properties, so
  there was nothing to probe for.
-->
<style>
:root {
  --ns-styles-loaded: 1;
}
</style>

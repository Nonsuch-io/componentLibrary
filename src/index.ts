// @nonsuch/component-library
// Custom components built on top of Quasar

// Components
export { default as NsButton } from './components/NsButton/NsButton.vue'
export { default as NsSkeleton } from './components/NsSkeleton/NsSkeleton.vue'
export type {
  NsSkeletonProps,
  NsSkeletonType,
  NsSkeletonAnimation,
} from './components/NsSkeleton/NsSkeleton.vue'
export { default as NsThemeProvider } from './components/NsThemeProvider/NsThemeProvider.vue'
export { default as NsInput } from './components/NsInput/NsInput.vue'
export { default as NsCard } from './components/NsCard/NsCard.vue'

// Plugin
export { createNonsuch } from './plugin'
export type { NsPluginOptions } from './plugin'

// Quasar config helper
export { createQuasarConfig } from './quasarConfig'
export type { QuasarConfigOverrides, QuasarBrandColors } from './quasarConfig'

// Locale
export type { NsLocaleMessages } from './locale/NsLocaleMessages'
export { nsLocaleEnCA } from './locale/en-CA'
export { nsLocaleFrCA } from './locale/fr-CA'

// Composables
export { provideNsLocale, useNsLocale, NsLocaleKey } from './composables/useNsLocale'
export { useNsDefault } from './composables/useNsDefaults'
export { useNsDarkMode } from './composables/useNsDarkMode'
export type { UseNsDarkModeReturn } from './composables/useNsDarkMode'

// Tokens
export type { NsToken } from './tokens'
export { getToken } from './tokens'

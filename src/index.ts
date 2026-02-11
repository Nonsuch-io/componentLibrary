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

// Locale
export type { NsLocaleMessages } from './locale/NsLocaleMessages'
export { nsLocaleEnCA } from './locale/en-CA'
export { nsLocaleFrCA } from './locale/fr-CA'

// Composables
export { provideNsLocale, useNsLocale, NsLocaleKey } from './composables/useNsLocale'
export { useNsDefault } from './composables/useNsDefaults'

// Tokens
export type { NsToken } from './tokens'
export { getToken } from './tokens'

import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

/**
 * The library's desktop breakpoint — Quasar's `md`, 1024px — as the SAME
 * media query the stylesheets switch on, so a component that must choose a
 * prop by breakpoint (NsButton's md on desktop / lg on mobile, the footer's
 * pairing) cannot disagree with its own layout.
 *
 * Why not `$q.screen`: it lagged the viewport in the story runner —
 * NsHoursOfOperation measured an md button inside a 320px iframe — which is
 * a disagreement of exactly the kind this exists to prevent. Reading the
 * query directly, with a change listener, tracks what CSS sees.
 *
 * `true` until mounted: no window on the server, and desktop is the shape a
 * server render should carry. The listener is removed on unmount.
 */
export const NS_DESKTOP_QUERY = '(min-width: 1024px)'

export function useNsIsDesktop(): Ref<boolean> {
  const isDesktop = ref(true)
  let mediaQuery: MediaQueryList | null = null
  const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
    isDesktop.value = e.matches
  }
  onMounted(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    mediaQuery = window.matchMedia(NS_DESKTOP_QUERY)
    onChange(mediaQuery)
    mediaQuery.addEventListener('change', onChange)
  })
  onBeforeUnmount(() => mediaQuery?.removeEventListener('change', onChange))
  return isDesktop
}

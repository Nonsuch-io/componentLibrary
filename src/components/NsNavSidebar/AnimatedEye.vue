<template>
  <span ref="eyeRef" class="ns-eye" :class="stateClass" aria-hidden="true">
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <!-- Open eye: almond outline + pupil that follows the cursor -->
      <g class="ns-eye__content">
        <path
          class="ns-eye__shape"
          d="M12 5 C 5 5, 1.5 12, 1.5 12 S 5 19, 12 19 C 19 19, 22.5 12, 22.5 12 S 19 5, 12 5 Z"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle
          class="ns-eye__pupil"
          cx="12"
          cy="12"
          r="2.4"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
        />
      </g>
      <!-- Closed eye: gentle downward curve with three eyelashes below -->
      <g class="ns-eye__lid">
        <path
          d="M2.5 11 C 7 16, 17 16, 21.5 11"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <!--
          Lashes start on the closed-eye curve and extend along its outward
          normal at each anchor — the outer two angle out, the middle drops
          straight down. Each is ~4 units long.
        -->
        <line
          x1="5"
          y1="13"
          x2="2.8"
          y2="16.5"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
        />
        <line
          x1="12"
          y1="15"
          x2="12"
          y2="19"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
        />
        <line
          x1="19"
          y1="13"
          x2="21.2"
          y2="16.5"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
        />
      </g>
    </svg>
  </span>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  /** When true, the eye is open (sidebar expanded). When false, the eye is closed. */
  open: boolean
  /**
   * Compresses the peek interval to 3-8 s instead of 20-30 min.
   * Intended for Storybook / manual testing only — not part of the public API
   * surface (this component is internal to NsNavSidebar).
   */
  debugPeek?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  debugPeek: false,
})

const eyeRef = ref<HTMLElement | null>(null)
const isBlinking = ref(false)
const isPeeking = ref(false)

const stateClass = computed(() => ({
  'ns-eye--open': props.open,
  'ns-eye--closed': !props.open,
  'ns-eye--blinking': isBlinking.value,
  'ns-eye--peeking': isPeeking.value,
}))

// ---- Cursor tracking ----
// The pupil is translated via CSS variables. Updates are rAF-throttled so a
// hot mousemove only does work once per frame.
let rafId: number | null = null
let pendingClientX = 0
let pendingClientY = 0

function onMouseMove(e: MouseEvent) {
  pendingClientX = e.clientX
  pendingClientY = e.clientY
  if (rafId !== null) return
  rafId = requestAnimationFrame(applyPupil)
}

function applyPupil() {
  rafId = null
  const el = eyeRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const dx = pendingClientX - cx
  const dy = pendingClientY - cy
  const distance = Math.sqrt(dx * dx + dy * dy)
  // Pupil stays inside the eye almond; the viewBox is 24 wide, so ~2.5 units
  // of travel keeps the pupil visually within the eye outline.
  const maxOffset = 2.5
  const angle = Math.atan2(dy, dx)
  // Normalise: cursors within ~80px of the eye centre give a near-linear
  // response; farther cursors saturate at maxOffset so the pupil never
  // visibly clips the eye outline.
  const r = Math.min(distance / 80, 1) * maxOffset
  el.style.setProperty('--pupil-x', `${Math.cos(angle) * r}px`)
  el.style.setProperty('--pupil-y', `${Math.sin(angle) * r}px`)
}

// ---- Blink (5–30s) when eye is open ----
let blinkTimer: ReturnType<typeof setTimeout> | null = null
function scheduleBlink() {
  clearBlinkTimer()
  const delay = 5_000 + Math.random() * 25_000
  blinkTimer = setTimeout(() => {
    isBlinking.value = true
    setTimeout(() => {
      isBlinking.value = false
      if (props.open) scheduleBlink()
    }, 220)
  }, delay)
}
function clearBlinkTimer() {
  if (blinkTimer) {
    clearTimeout(blinkTimer)
    blinkTimer = null
  }
}

// ---- Peek (20–30 min, or 3–8 s in debug mode) when eye is closed ----
let peekTimer: ReturnType<typeof setTimeout> | null = null
function schedulePeek() {
  clearPeekTimer()
  const delay = props.debugPeek
    ? 3_000 + Math.random() * 5_000
    : 20 * 60_000 + Math.random() * 10 * 60_000
  peekTimer = setTimeout(() => {
    isPeeking.value = true
    setTimeout(() => {
      isPeeking.value = false
      if (!props.open) schedulePeek()
    }, 2600)
  }, delay)
}
function clearPeekTimer() {
  if (peekTimer) {
    clearTimeout(peekTimer)
    peekTimer = null
  }
}

// ---- Mousemove listener lifecycle ----
// Only attached while the pupil is actually visible (eye open, or briefly
// during a peek). Saves CPU when the eye is closed and idle.
let listenerAttached = false
function ensureListener(shouldTrack: boolean) {
  if (typeof window === 'undefined') return
  if (shouldTrack && !listenerAttached) {
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    listenerAttached = true
  } else if (!shouldTrack && listenerAttached) {
    window.removeEventListener('mousemove', onMouseMove)
    listenerAttached = false
  }
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

watch([() => props.open, isPeeking], ([open, peeking]) => {
  ensureListener(open || peeking)
})

watch(
  () => props.open,
  (open) => {
    isBlinking.value = false
    isPeeking.value = false
    clearBlinkTimer()
    clearPeekTimer()
    if (prefersReducedMotion()) return
    if (open) scheduleBlink()
    else schedulePeek()
  },
)

onMounted(() => {
  if (prefersReducedMotion()) return
  ensureListener(props.open)
  if (props.open) scheduleBlink()
  else schedulePeek()
})

onUnmounted(() => {
  ensureListener(false)
  if (rafId !== null) cancelAnimationFrame(rafId)
  clearBlinkTimer()
  clearPeekTimer()
})
</script>

<style lang="scss" scoped>
.ns-eye {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  --pupil-x: 0px;
  --pupil-y: 0px;

  svg {
    width: 100%;
    height: 100%;
    display: block;
    overflow: visible;
  }
}

.ns-eye__content {
  transform-origin: center;
  transition:
    transform 180ms cubic-bezier(0.4, 0, 0.2, 1),
    opacity 180ms ease;
}

.ns-eye__pupil {
  transform: translate(var(--pupil-x), var(--pupil-y));
  transition: transform 80ms linear;
}

.ns-eye__lid {
  transform-origin: center;
  transition:
    opacity 180ms ease,
    transform 180ms cubic-bezier(0.4, 0, 0.2, 1);
}

// ---- Static states ----
.ns-eye--open {
  .ns-eye__content {
    transform: scaleY(1);
    opacity: 1;
  }
  .ns-eye__lid {
    opacity: 0;
    transform: scaleY(0.6);
  }
}

.ns-eye--closed {
  .ns-eye__content {
    transform: scaleY(0);
    opacity: 0;
  }
  .ns-eye__lid {
    opacity: 1;
    transform: scaleY(1);
  }
}

// ---- Blink (eye open → briefly closed → open) ----
.ns-eye--blinking {
  .ns-eye__content {
    animation: ns-eye-blink-content 220ms ease-in-out;
  }
  .ns-eye__lid {
    animation: ns-eye-blink-lid 220ms ease-in-out;
  }
}

@keyframes ns-eye-blink-content {
  0%,
  100% {
    transform: scaleY(1);
    opacity: 1;
  }
  45%,
  55% {
    transform: scaleY(0);
    opacity: 0;
  }
}

@keyframes ns-eye-blink-lid {
  0%,
  100% {
    opacity: 0;
    transform: scaleY(0.6);
  }
  45%,
  55% {
    opacity: 1;
    transform: scaleY(1);
  }
}

// ---- Peek (eye closed → briefly half-open → closed) ----
.ns-eye--peeking {
  .ns-eye__content {
    animation: ns-eye-peek-content 2600ms ease-in-out;
  }
  .ns-eye__lid {
    animation: ns-eye-peek-lid 2600ms ease-in-out;
  }
}

@keyframes ns-eye-peek-content {
  0%,
  100% {
    transform: scaleY(0);
    opacity: 0;
  }
  15%,
  85% {
    transform: scaleY(0.7);
    opacity: 1;
  }
}

@keyframes ns-eye-peek-lid {
  0%,
  100% {
    opacity: 1;
    transform: scaleY(1);
  }
  15%,
  85% {
    opacity: 0.25;
    transform: scaleY(0.8);
  }
}

// ---- Accessibility: respect reduced motion ----
@media (prefers-reduced-motion: reduce) {
  .ns-eye__content,
  .ns-eye__pupil,
  .ns-eye__lid {
    transition: none !important;
    animation: none !important;
  }
}
</style>

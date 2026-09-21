import { onBeforeUnmount, onMounted, onUpdated, useId, watch, type Ref } from 'vue'

/**
 * Names a QField-based control from a label rendered ABOVE the box, and
 * describes it by Quasar's hint — by writing the attributes onto the native
 * control element itself. Internal to NsInput/NsSelect `labelPlacement="above"`.
 *
 * Why the DOM and not a template binding: butiq measured on 0.53.0 (quasar
 * 2.18.6, inside our `^2.17.0` peer range) that `:aria-labelledby` bound on
 * <QSelect> lands on the `.q-field__native` DIV — in 2.18.6 a select without
 * `use-input` spreads the consumer's attrs there and gives the focus-target
 * input only its own combobox attrs; from 2.30 they land on the input, which is
 * why the grj.3 test and the Chromium measurement were clean. Left unnamed, the
 * input's name is computed from EVERY <label> that claims it, and QField's root
 * is a <label> wrapping the hint and the selected value: combobox "Language
 * English (Canada)", combobox "Shop Category We'll use this to help you…"
 * (componentLibrary-0og, -2z7). Setting the attribute on the element is
 * independent of which element Quasar routes attrs to.
 *
 * The hint: neither Quasar version describes it (2.32 ids `.q-field__messages`
 * only while an error shows), so once the name is the label alone the hint
 * would reach a screen reader nowhere. It gets an id and rides in
 * aria-describedby while the messages block is ours — when Quasar puts its own
 * error id on the block, the block is Quasar's and the hint token is dropped.
 *
 * Why a MutationObserver and not only the wrapper's lifecycle hooks: Quasar
 * validates on `debounce(validate, 0)`, so an error appears and clears in a
 * macrotask AFTER our onUpdated. When it clears, 2.32 re-creates the messages
 * block without an id and its vnode patch removes the control's
 * aria-describedby outright — review (fable) reproduced the hint description
 * silently gone on the most ordinary path, submit → error → user fixes it.
 * The observer sees the block change and re-applies. It watches childList
 * ONLY: every case that needs a re-apply re-creates or adds the block in the
 * same render that drops the attribute, and an observer that also watched
 * attributes would be re-triggered by our own writes — a mutant without the
 * token filter livelocked the unit suite for 26 minutes in a microtask storm
 * no test timeout could interrupt. Writes are still change-guarded.
 */
export function useNsAboveLabelName(options: {
  root: Ref<{ $el?: unknown } | null | undefined>
  active: () => boolean
  label: () => string | undefined
}) {
  const labelId = useId()
  const hintId = useId()

  /**
   * `control` is for the caller that already found it — NsSelect's dialog mode
   * moves the combobox into a teleported dialog, outside the field's subtree.
   * Not looked up in the document here: a disabled QSelect renders no combobox
   * (componentLibrary-w0c) and a document-wide query would name someone else's.
   */
  function applyAboveLabelName(control?: HTMLElement | null) {
    const host = options.root.value?.$el
    if (!(host instanceof Element)) return
    const el =
      control ??
      host.querySelector<HTMLElement>(
        '[role="combobox"], input.q-field__native, textarea.q-field__native',
      )
    if (!el) return
    const active = options.active()

    // Ours to set, and ours to take back when the label goes: a dangling IDREF
    // fails axe and accname falls back to the polluted two-label computation.
    if (active && options.label()?.trim()) {
      if (el.getAttribute('aria-labelledby') !== labelId)
        el.setAttribute('aria-labelledby', labelId)
    } else if (el.getAttribute('aria-labelledby') === labelId) {
      el.removeAttribute('aria-labelledby')
    }

    // With a hint (prop or #hint slot) the block has text; with only `rules`
    // it exists and is empty until an error shows.
    const messages = host.querySelector<HTMLElement>('.q-field__messages')
    if (active && messages && !messages.id && messages.textContent?.trim()) messages.id = hintId
    const describedByHint = active && messages?.id === hintId
    const tokens = (el.getAttribute('aria-describedby') ?? '')
      .split(/\s+/)
      .filter((t) => t && t !== hintId)
    if (describedByHint) tokens.push(hintId)
    const next = tokens.join(' ')
    if (next !== (el.getAttribute('aria-describedby') ?? '')) {
      if (next) el.setAttribute('aria-describedby', next)
      else el.removeAttribute('aria-describedby')
    }
  }

  let observer: MutationObserver | undefined
  watch(
    () => options.root.value?.$el,
    (host) => {
      observer?.disconnect()
      observer = undefined
      if (!(host instanceof Element)) return
      applyAboveLabelName()
      if (typeof MutationObserver === 'undefined') return
      observer = new MutationObserver(() => applyAboveLabelName())
      observer.observe(host, { childList: true, subtree: true })
    },
    { immediate: true, flush: 'post' },
  )
  // Mounted: named before the first paint, not a post-flush later. Updated:
  // the label lives OUTSIDE the field root (a sibling in the wrapper), so its
  // coming and going is only visible from our own render.
  onMounted(() => applyAboveLabelName())
  onUpdated(() => applyAboveLabelName())
  onBeforeUnmount(() => observer?.disconnect())

  return { labelId, applyAboveLabelName }
}

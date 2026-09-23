import { onBeforeUnmount, onMounted, onUpdated, useId, watch, type Ref } from 'vue'

/**
 * Names a QField-based control from a label rendered ABOVE the box, and
 * describes it by Quasar's hint — by writing the attributes onto the native
 * control element itself. Internal to NsInput/NsSelect `labelPlacement="above"`.
 *
 * Why the DOM and not a template binding: butiq measured on 0.53.0 (quasar
 * 2.18.6 — inside the `^2.17.0` range we declared at the time; the floor is
 * `^2.32.0` since componentLibrary-u5v) that `:aria-labelledby` bound on
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
/**
 * `instanceof Element` THROWS on a server, it does not return false: `Element`
 * is not a binding there at all, so the reference itself is a ReferenceError.
 * 0.53.1 shipped the bare form and 500'd butiq's Nuxt homepage on EVERY route
 * — the watch below is `immediate`, so it runs during setup, on the server too
 * (componentLibrary-2cp). The DOM globals this composable needs must all
 * be reached through `typeof`, the way MutationObserver already was.
 */
function isElement(value: unknown): value is Element {
  return typeof Element !== 'undefined' && value instanceof Element
}

export function useNsControlName(options: {
  root: Ref<{ $el?: unknown } | null | undefined>
  /** True while the label is rendered ABOVE the box and must name the control. */
  labelAbove: () => boolean
  label: () => string | undefined
  /**
   * A consumer's own `aria-label`, for components where Quasar does not
   * reliably route it to the native control. QSelect on 2.18.6 spreads consumer
   * attrs onto `.q-field__native` when `use-input` is false, so
   * `<NsSelect aria-label="…">` with no `label` has NO accessible name there
   * and, with both, the `label` wins although the documented contract is that
   * a consumer's aria-label beats it (componentLibrary-5ng). QInput routes
   * attrs to the input on both versions, so NsInput does not pass this — an
   * unused option would be an untested branch.
   */
  ariaLabel?: () => string | undefined
}) {
  const labelId = useId()
  const hintId = useId()

  /**
   * `control` is for the caller that already found it — NsSelect's dialog mode
   * moves the combobox into a teleported dialog, outside the field's subtree.
   * Not looked up in the document here: a disabled QSelect renders no combobox
   * (componentLibrary-w0c) and a document-wide query would name someone else's.
   */
  /**
   * What we last wrote as `aria-label`, so it can be taken back. Unlike the
   * unreachable flag a previous review rejected, this one is REACHABLE and
   * tested: a consumer binding `:aria-label="err ? 'Fix this' : undefined"`
   * leaves a stale, wrong NAME on the control forever otherwise, because
   * `active()` goes false and nothing revisits the element. Review (sonnet)
   * executed that. On 2.32 Vue's own attrs diffing happens to clear it for
   * us — on 2.18.6 that diffing lands on `.q-field__native`, the wrong
   * element, which is the entire reason this composable exists.
   */
  let appliedAriaLabel: string | null = null

  /** Anything to write — or anything of ours still to take back. */
  function active(): boolean {
    return (
      options.labelAbove() ||
      (options.ariaLabel?.()?.trim() ?? '') !== '' ||
      appliedAriaLabel !== null
    )
  }

  function applyControlName(control?: HTMLElement | null) {
    // Inactive: nothing to do, not even the lookups — `root` sits on the
    // default-placement branch too, and review (sonnet) measured every
    // inside-placement select paying two querySelectors per re-render for
    // no-ops. Nothing of ours to take back either: both consumers render the
    // placements as v-if/v-else, so a flip recreates the field and the new
    // control carries none of our attributes (review, fable, measured).
    if (!active()) return
    const host = options.root.value?.$el
    if (!isElement(host)) return
    const el =
      control ??
      host.querySelector<HTMLElement>(
        '[role="combobox"], input.q-field__native, textarea.q-field__native',
      )
    if (!el) return

    // The consumer's aria-label, written onto the ELEMENT for the same reason
    // as the labelledby below: on 2.18.6 a bound attr lands on a role-less div.
    // Quasar's own precedence has a consumer's aria-label beat `label`, and
    // NsSelect's listbox naming reads the combobox's name back, so this must
    // land BEFORE that read (componentLibrary-5ng).
    const consumerLabel = options.ariaLabel?.()?.trim()
    if (consumerLabel) {
      if (el.getAttribute('aria-label') !== consumerLabel) {
        el.setAttribute('aria-label', consumerLabel)
      }
      appliedAriaLabel = consumerLabel
    } else if (appliedAriaLabel !== null) {
      // PUT BACK THE NAME THE CONTROL WOULD HAVE HAD, do not just delete.
      // Review (fable) ran this on real 2.18.6: Quasar writes `aria-label =
      // label` onto the focus-target input itself there (QSelect.js:294), so
      // the value we overwrote was QUASAR'S, and removing it left the combobox
      // with no name and the listbox unnamed again — the axe
      // aria-input-field-name failure componentLibrary-2e7 fixed, back after
      // one toggle. 2.32 ends up equally unnamed by a different route (an
      // `undefined` in Quasar's attr spread overrides `label`), so this is not
      // restoring parity with the newer version — it is fixing both.
      //
      // Read from `label` rather than remembering the displaced string: a
      // remembered value goes stale the moment `label` changes while the
      // consumer's own label is set.
      const current = el.getAttribute('aria-label')
      // `null` too: on 2.32 Vue's patch has already removed the consumer's
      // attribute before this post-flush pass, so the guard would otherwise
      // skip and leave the control unnamed on the newer version only.
      if (current === appliedAriaLabel || current === null) {
        const fallback = options.labelAbove() ? undefined : options.label()?.trim()
        if (fallback) {
          if (current !== fallback) el.setAttribute('aria-label', fallback)
        } else el.removeAttribute('aria-label')
        appliedAriaLabel = fallback ?? null
      } else {
        // Someone else owns it now; leave it and stop tracking.
        appliedAriaLabel = null
      }
    }

    // Ours to set, and ours to take back when the label goes: a dangling IDREF
    // fails axe and accname falls back to the polluted two-label computation.
    if (options.labelAbove() && options.label()?.trim() && !consumerLabel) {
      if (el.getAttribute('aria-labelledby') !== labelId)
        el.setAttribute('aria-labelledby', labelId)
    } else if (el.getAttribute('aria-labelledby') === labelId) {
      el.removeAttribute('aria-labelledby')
    }

    // With a hint (prop or #hint slot) the block has text; with only `rules`
    // it exists and is empty until an error shows.
    const messages = options.labelAbove()
      ? host.querySelector<HTMLElement>('.q-field__messages')
      : null
    if (messages && !messages.id && messages.textContent?.trim()) messages.id = hintId
    const describedByHint = messages?.id === hintId
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

  // Observed only while active: the source is undefined for an inside
  // placement, so the common case creates no observer at all. A runtime flip
  // of the placement swaps the host (v-if/v-else); the old observer goes with
  // the old element.
  let observer: MutationObserver | undefined

  /** The host we are currently observing, so a re-run does not re-observe it. */
  let observedHost: Element | undefined

  /**
   * OBSERVER STATE AS A FUNCTION OF THE WORLD, re-derived on every pass rather
   * than driven by a watch. The watch could only see REACTIVE sources, and
   * `appliedAriaLabel` is a plain `let`: review (sonnet) measured the observer
   * disconnecting on the first idle transition and never coming BACK when the
   * consumer re-added their aria-label, because the watch ran before
   * onUpdated's cleanup and so never saw the idle edge at all. A previous
   * round had already patched the disconnect side the same way; two halves of
   * one condition living in different places is what made the asymmetry easy
   * to miss, so both now happen here.
   *
   * The "inside placement creates no observer" invariant still holds: nothing
   * is created while `active()` is false.
   */
  function syncObserver() {
    const host = options.root.value?.$el
    if (!active() || !isElement(host) || typeof MutationObserver === 'undefined') {
      observer?.disconnect()
      observer = undefined
      observedHost = undefined
      return
    }
    if (observer && observedHost === host) return
    observer?.disconnect()
    observer = new MutationObserver(() => applyControlName())
    observer.observe(host, { childList: true, subtree: true })
    observedHost = host
  }

  // Mounted: named before the first paint, not a post-flush later. Updated:
  // the label lives OUTSIDE the field root (a sibling in the wrapper), so its
  // coming and going is only visible from our own render. The host can also be
  // swapped without either firing (NsSelect's v-if/v-else), hence the watch.
  watch(
    () => options.root.value?.$el,
    () => {
      applyControlName()
      syncObserver()
    },
    { immediate: true, flush: 'post' },
  )
  onMounted(() => {
    applyControlName()
    syncObserver()
  })
  onUpdated(() => {
    applyControlName()
    syncObserver()
  })
  onBeforeUnmount(() => observer?.disconnect())

  return { labelId, applyControlName }
}

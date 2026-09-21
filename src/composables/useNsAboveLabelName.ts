import { onMounted, onUpdated, useId, type Ref } from 'vue'

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
    if (!options.active()) return
    const host = options.root.value?.$el
    if (!(host instanceof Element)) return
    const el =
      control ??
      host.querySelector<HTMLElement>(
        '[role="combobox"], input.q-field__native, textarea.q-field__native',
      )
    if (!el) return

    if (options.label()?.trim()) el.setAttribute('aria-labelledby', labelId)

    // With a hint (prop or #hint slot) the block has text; with only `rules`
    // it exists and is empty until an error shows.
    const messages = host.querySelector<HTMLElement>('.q-field__messages')
    if (messages && !messages.id && messages.textContent?.trim()) messages.id = hintId
    const describedByHint = messages?.id === hintId
    const tokens = (el.getAttribute('aria-describedby') ?? '')
      .split(/\s+/)
      .filter((t) => t && t !== hintId)
    if (describedByHint) tokens.push(hintId)
    if (tokens.length > 0) el.setAttribute('aria-describedby', tokens.join(' '))
    else el.removeAttribute('aria-describedby')
  }

  onMounted(() => applyAboveLabelName())
  onUpdated(() => applyAboveLabelName())

  return { labelId, applyAboveLabelName }
}

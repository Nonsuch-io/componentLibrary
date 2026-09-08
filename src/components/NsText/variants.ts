/**
 * THE SINGLE SOURCE for NsText's vocabulary. The component, its tests and its
 * stories all import from here, and the TypeScript unions are DERIVED from
 * these arrays rather than written beside them.
 *
 * Why it is a module and not three consts in the SFC: an independent review
 * proved the drift. With a hand-written union next to a hand-written runtime
 * array, adding `heading-3xl` to the union and to typography.css — but not to
 * the array — left all 34 tests passing while every use of that perfectly
 * valid variant warned at the consumer. There were four copies of the same 21
 * names (union, component array, test array, stories array) with nothing
 * holding them together. Now there is one, and the omission cannot be
 * expressed. Story: componentLibrary-lrw.8.
 */

/**
 * Each entry MUST have a matching `.ns-{variant}` rule in
 * `tokens/typography.css`. NsText.test.ts reads that file and asserts it — a
 * variant with no rule renders at the browser default, silently.
 */
export const KNOWN_VARIANTS = [
  'caption',
  'overline',
  'overline-lg',
  'overline-md',
  'overline-md-bold',
  'body-sm',
  'body-md',
  'label-xs',
  'label-sm',
  'label-md',
  'heading-sm',
  'heading-sm-regular',
  'heading-md',
  'heading-md-regular',
  'heading-lg',
  'heading-lg-regular',
  'heading-xl',
  'heading-xl-regular',
  'heading-2xl',
  'heading-2xl-regular',
  'display',
] as const

/**
 * Semantic text colours, resolved to `var(--ns-color-text-{tone})`. Each entry
 * MUST have a matching `--ns-color-text-{tone}` declaration in
 * `tokens/tokens.css`; NsText.test.ts reads that file and asserts it.
 *
 * A "known" tone with no token behind it is WORSE than an unknown one: it
 * passes the component's guard, emits no warning, produces a `var()` that
 * resolves to nothing, and silently inherits the parent's colour. That is the
 * syntactically-present-but-semantically-dead failure this repo keeps hitting.
 */
export const KNOWN_TONES = [
  'primary',
  'secondary',
  'tertiary',
  'brand',
  'accent',
  'inverse',
  'positive',
  'negative',
  'warning',
  'info',
  'disabled',
  'link',
] as const

/**
 * Text elements only. `<component :is>` renders whatever string it is handed,
 * so an open `string` would let `as="script"` through.
 *
 * `label` and `legend` associate with their control through ordinary attribute
 * fallthrough: NsText has a single root and does not set `inheritAttrs: false`,
 * so `<NsText as="label" for="email">` puts `for` onto the rendered `<label>`.
 * There is deliberately no `for` prop — it would duplicate what Vue already
 * does correctly.
 */
export const KNOWN_ELEMENTS = [
  'span',
  'p',
  'div',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'label',
  'legend',
  'figcaption',
  'strong',
  'em',
  'small',
] as const

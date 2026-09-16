<template>
  <q-menu ref="menuRef" v-bind="$attrs" class="ns-menu">
    <slot />
  </q-menu>
</template>

<script setup lang="ts">
/**
 * NsMenu — A styled wrapper around Quasar's QMenu.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QMenu props and events are forwarded via $attrs.
 *
 * NsMenu IS DELIBERATELY ROLELESS: the rendered popup carries no ARIA role
 * of its own, so a screen reader announces it as plain content, not a menu.
 * MEASURED on quasar@2.25.0 (QMenu.js:516): Quasar itself stopped setting
 * role="menu" here, because a popup hosts arbitrary content while
 * role="menu" only permits menuitem* children — the same argument
 * componentLibrary-cfo makes about our own NsNavSidebar.
 *
 * A button hosting NsMenu already gets aria-expanded from Quasar, plus focus
 * on open and Escape to close. That is a complete disclosure pattern, and it
 * is honest: NsMenu provides no arrow-key, Home/End or type-ahead navigation,
 * so announcing "menu" would promise keyboard behaviour that does not exist.
 *
 * IF YOU DO NEED MENU SEMANTICS, PUT THE ROLE ON THE LIST, NOT ON NsMenu:
 *
 *     <NsMenu><NsList role="menu"><NsItem clickable>…
 *
 * QItem then derives role="menuitem" from the list context (QItem.js:66-75),
 * which is the migration Quasar's own 2.25.0 notes prescribe. Putting the role
 * on NsMenu instead yields menu > list > button — an aria-required-children
 * violation, because NsList still renders role="list" inside it. Measured;
 * review caught an earlier version of this comment recommending exactly that.
 *
 * Passing `role` to NsMenu is still a real contract — Quasar reads it to decide
 * whether to write aria-haspopup on the anchor (QMenu.js:150-152) — but it is
 * not the way to make a menu. And either way, the keyboard navigation is yours
 * to build. See componentLibrary-nb7.
 *
 * `show()`, `hide()` and `toggle()` are QMenu's own, exposed so content INSIDE
 * the popup can close it without a v-model: a bare `update:modelValue` emit
 * from a child goes nowhere when nobody is bound, and only QMenu's own
 * `hide()` drives its internal state — the path Escape and click-outside
 * already use. Review found NsTooltipDetails' Close button inert that way
 * (componentLibrary-605).
 */
import { ref } from 'vue'
import type { QMenu } from 'quasar'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsMenuProps {}

defineProps<NsMenuProps>()

const menuRef = ref<QMenu | null>(null)

defineExpose({
  show: (evt?: Event) => menuRef.value?.show(evt),
  hide: (evt?: Event) => menuRef.value?.hide(evt),
  toggle: (evt?: Event) => menuRef.value?.toggle(evt),
})
</script>

<style lang="sass">
// NOT SCOPED: QMenu is teleported to a body-level portal, and Vue does not stamp
// a scope attribute onto a teleported root — measured, the live element carries
// the ns-menu class but no data-v-*. So `.ns-menu[data-v-xxxx]` matched nothing
// and this font-family never applied. Same defect as NsTooltip; the trade-off is
// the same too, a global selector a consumer could collide with.
// Story: componentLibrary-3sy.
.ns-menu
  font-family: var(--ns-font-family-text)
</style>

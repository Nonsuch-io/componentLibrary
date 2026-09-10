<template>
  <div class="ns-form-footer">
    <div class="ns-form-footer__actions">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * NsFormFooter — the action row at the foot of a form.
 *
 * 72 uses across the flow, the most-used component after NsPageHeading, and
 * this bead's own description said "read the frames rather than assuming". So:
 * measured, sample size 3 instances expanded by id, covering all THREE distinct
 * shapes among the 42 in the SIGN UP section.
 *
 *   1440x68  x23  DESKTOP        65:3657
 *       form actions x=1157 y=16 251x36   RIGHT-ALIGNED
 *         NsButton 119.5x36  x=0
 *         NsButton 119.5x36  x=131.5      12px gap
 *
 *   350x110  x4   MOBILE, two    83:8002
 *       Actions 350x102
 *         NsButton 350x45  y=0
 *         NsButton 350x45  y=57           12px gap
 *
 *   350x53   x15  MOBILE, one    253:40942
 *       Actions 350x45
 *         NsButton 350x45  y=0
 *         NsButton 350x45  y=57  hidden=true
 *
 * IT REFLOWS, IT DOES NOT RESCALE, and that is the whole component. Desktop is
 * a RIGHT-ALIGNED ROW of auto-width buttons; mobile is a VERTICAL STACK of
 * FULL-WIDTH ones. Scaling a desktop row down gives you two cramped buttons
 * side by side, which is what this is built to not do.
 *
 * THE SECOND ACTION IS OPTIONAL, evidenced by the `hidden="true"` sibling on
 * the one-action variant — the same signature that proved NsFormSection's
 * eleven named variants are one component. 15 of 42 instances ship one action.
 * Nothing here enforces a count: the slot takes what it is given.
 *
 * WHAT THIS COMPONENT DOES NOT DO, deliberately: set the size of the buttons
 * inside it. The design uses 36px tall on desktop and 45px on mobile, which are
 * NsButton's `md` and `lg` (36 = 8px padding + 14px text, 45 = 12px + 16px —
 * checked against NsButton's own paddingMap rather than assumed). A footer that
 * reached in and set its children's size would be overriding a decision the
 * consumer owns. WIDTH is different and is layout: full-bleed on mobile is what
 * makes the stack usable, so this does set that.
 * Story: componentLibrary-lrw.1.
 */

defineSlots<{
  /** The actions. Typically one or two NsButton; the component imposes no count. */
  default?: () => unknown
}>()
</script>

<style lang="scss" scoped>
.ns-form-footer {
  width: 100%;
  // Mobile first, because the mobile shape is the one that breaks if it is
  // treated as a scaled desktop. 8px vertical, none horizontal: measured at
  // 53 - 45 and 110 - 102, with the footer sitting inside a container that
  // already carries the page's own margins.
  padding: var(--ns-space-2) 0;

  &__actions {
    display: flex;
    // 12px in BOTH orientations: 131.5 - 119.5 on desktop, 57 - 45 on mobile.
    gap: var(--ns-space-3);
    flex-direction: column;

    // NO EXPLICIT WIDTH RULE HERE, AND THAT IS DELIBERATE. Full-bleed children
    // on mobile is what makes the stack read as a set of choices rather than a
    // ragged list — but `align-items` already defaults to `stretch`, and in a
    // column flex container the cross axis is horizontal, so the children fill
    // the width without being told to. A `> * { width: 100% }` here (and the
    // `width: auto` that undid it below the breakpoint) was measured as DEAD:
    // removing both changed nothing in Chromium. Same shape as the
    // `.q-btn__wrapper` rule deleted in componentLibrary-cqy — a declaration
    // that looks load-bearing and owns nothing.
    //
    // The behaviour is guarded by LayoutIsRealOnMobile, which asserts the
    // rendered WIDTH rather than the rule. Verified: adding an unscoped
    // `align-items: center` — the realistic way someone breaks this while
    // centring the desktop row — fails that story with "expected 64 to be close
    // to 320". So the protection does not depend on the rule existing.
  }

  // 1024px is this library's only breakpoint — 22 components already use it and
  // nothing else comes close, so this follows rather than inventing a second.
  @media (min-width: 1024px) {
    // 16px vertical (68 = 16 + 36 + 16) and 32px on the right (1440 - 1408).
    padding: var(--ns-space-4) var(--ns-space-8) var(--ns-space-4) 0;

    &__actions {
      flex-direction: row;
      // RIGHT-ALIGNED: form actions began at x=1157 of 1440 in every desktop
      // instance measured.
      justify-content: flex-end;
    }
  }
}
</style>

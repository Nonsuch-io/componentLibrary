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
 * inside it. A footer that reached in and set its children's size would be
 * overriding a decision the consumer owns — and NsButton's `padding` prop lands
 * as an inline style, so CSS here could not override it without `!important`
 * anyway. WIDTH is different and is layout, which is why the reflow is this
 * component's business and the height is not.
 *
 * THE DESIGN'S BUTTON HEIGHTS ARE NOT REACHABLE WITH TODAY'S NsButton, and an
 * earlier version of this comment said they were. It claimed 36px = `md`
 * because 8px padding + 14px text = 36 — which ignores that Quasar's `.q-btn`
 * carries `line-height: 1.715em`, making the line box 24px. MEASURED in
 * Chromium: `md` renders 40px and `lg` about 51px, against the design's 36 and
 * 45. Computing a height from padding and font-size is not measuring it.
 * Filed as componentLibrary-4l2; it is NsButton's gap, not the footer's.
 * Until it is settled, a consumer wanting the design exactly needs
 * `:size="$q.screen.lt.md ? 'lg' : 'md'"` — $q.screen is Quasar core, no
 * plugin needed.
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
  // treated as a scaled desktop.
  //
  // 8px BELOW ONLY, not 8px each side. The Actions child sits at y=0 in both
  // mobile frames (253:40942 350x53 over a 45 child, 83:8002 350x110 over 102),
  // so 53 - 45 is the TOTAL vertical padding and all of it is underneath. An
  // earlier version read that difference as a per-side value and rendered the
  // footer 8px too tall — caught in review, and the desktop arithmetic three
  // rules down (68 = 16 + 36 + 16) had it right all along.
  //
  // No horizontal padding here: on mobile the footer is placed INSIDE the
  // page's own gutters (the instance sits at x=20 in a 390 device), so it is
  // already inset. Desktop is the opposite — see below.
  padding: 0 0 var(--ns-space-2);

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
    // "Changed nothing" is true only for auto-width children, and the
    // difference is worth knowing: the scoped rule compiled to (0,2,0) and so
    // BEAT a consumer setting a width on their own button, where `stretch`
    // yields to any explicit cross-size. Removing it stopped the footer
    // overriding a child's own width, which is the right side to be on.
    //
    // The behaviour is guarded by LayoutIsRealOnMobile, which asserts the
    // rendered WIDTH rather than the rule. Verified: adding an unscoped
    // `align-items: center` — the realistic way someone breaks this while
    // centring the desktop row — fails that story with "expected 64 to be close
    // to 320". So the protection does not depend on the rule existing.
  }

  // 1024px is nsBreakpoints.md from src/breakpoints/index.ts — the library
  // defines seven breakpoints and this is the desktop one, used by a dozen
  // components. Chosen for consistency with that boundary, NOT because two
  // buttons stop fitting: 251px of actions fits far below 1024. An earlier
  // comment called 1024 "this library's only breakpoint", which was wrong on
  // both counts.
  @media (min-width: 1024px) {
    // 16px vertical: 68 = 16 + 36 + 16 on 65:3657.
    //
    // NO HORIZONTAL PADDING, and this changed after a review measured the
    // codebase's own WithFooter story: a section card ending at x=1200 over a
    // footer button ending at 1168, a 32px misalignment in the most natural
    // composition. The 32 came from the design — but from the design's PAGE.
    // In the 1440 frame the footer is x=0 w=1440 and its bottom edge is the
    // page's bottom edge (y 1726 + 68 = 1794 = page height): a full-bleed bar
    // at the foot of the viewport, with its actions 32px from the VIEWPORT.
    // That is placement, which the page owns, not layout, which this does.
    // The same line this component draws for button size: it lays out its
    // children and does not decide where it sits.
    //
    // A consumer placing it full-bleed, as the design does, adds the gutter
    // themselves — `style="padding-inline: var(--ns-space-8)"` reproduces the
    // measured 32. Placed inline after form sections it now aligns with them.
    padding: var(--ns-space-4) 0;

    &__actions {
      flex-direction: row;
      // RIGHT-ALIGNED: form actions began at x=1157 of 1440 in every desktop
      // instance measured.
      justify-content: flex-end;
    }
  }
}
</style>

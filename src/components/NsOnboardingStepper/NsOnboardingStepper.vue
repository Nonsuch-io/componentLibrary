<template>
  <nav class="ns-onboarding-stepper" :aria-label="label?.trim() || locale.stepper.progress">
    <!-- `?.trim() ||` on the name: a blank landmark name is no name; t() before load hands over '' (componentLibrary-d13). -->
    <!--
      role="list" restated: WebKit drops list semantics from a list-style:
      none <ol>, and "2 of 6" is the whole point of a stepper. Same rule and
      the same lint exception as NsChecklistBanner.
    -->
    <!-- eslint-disable-next-line vuejs-accessibility/no-redundant-roles -->
    <ol class="ns-onboarding-stepper__steps" role="list">
      <li
        v-for="(step, index) in resolved"
        :key="step.id"
        class="ns-onboarding-stepper__step"
        :class="`ns-onboarding-stepper__step--${step.state}`"
        :aria-current="step.state === 'current' ? 'step' : undefined"
      >
        <NsStepNumber :number="index + 1" :variant="VARIANT[step.state]" :size="28" />
        <span class="ns-onboarding-stepper__label" :class="labelClass(step.state)">
          {{ step.label }}
          <span v-if="step.state === 'complete'" class="ns-onboarding-stepper__sr">
            ({{ locale.stepper.completed }})
          </span>
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
/**
 * NsOnboardingStepper — where you are in a multi-step flow (design
 * `NsOnboardingStepper`, 2440:379010 desktop / 2440:379011 mobile; 25
 * instances in the SIGN UP section at 700x28 and 350x28, componentLibrary-
 * lrw.6). A row of NsStep — a 28px NsStepNumber and a 12px label at an 8px
 * gap — joined by 1px brand lines that share the remaining width equally.
 *
 * CHROME OURS, STEP GRAPH THEIRS (componentLibrary-jas): the steps and the
 * current one come in as props; nothing here knows what "Contact" means or
 * whether it can be skipped. Steps before the current one are shown
 * complete unless a step says otherwise (`complete: false` on a skipped
 * one, `complete: true` on one done out of order). Not interactive — the
 * design has no click target and going back is the consumer's flow.
 *
 * MEASURED (I189:15062, 700 wide): complete = check circle + "Small body
 * text" 12/400/18 label; current = numbered brand circle + "Small label"
 * 12/600/16.8 label (the one bold label is how the eye finds the current
 * step); upcoming = outlined circle + 12/400 label. Both connector assets
 * are the same 1px #D56307 line (fetched and compared) — there is no
 * past/future difference on the line. Mobile (2440:379011, 350): the same
 * row with `label=false` on every step; here the labels stay in the DOM,
 * visually hidden, so a screen reader still hears them.
 *
 * ACCESSIBILITY: a <nav> named "Progress" (or `label`), an <ol> so the
 * numbers are structural (the circle is aria-hidden), `aria-current="step"`
 * on the current item, and "(Completed)" visually hidden after a complete
 * step's label.
 */
import { computed } from 'vue'
import NsStepNumber, { type NsStepNumberVariant } from '../NsStepNumber/NsStepNumber.vue'
import { useNsLocale } from '../../composables/useNsLocale'

export interface NsOnboardingStep {
  id: string
  label: string
  /** Overrides the default — steps before `current` are complete, the rest are not. */
  complete?: boolean
}

export interface NsOnboardingStepperProps {
  steps: readonly NsOnboardingStep[]
  /** The id of the current step. Unknown or omitted → no step is current. */
  current?: string
  /** Accessible name of the nav; blank or omitted → "Progress" from the locale. */
  label?: string
}

const props = withDefaults(defineProps<NsOnboardingStepperProps>(), {
  current: undefined,
  label: undefined,
})

const locale = useNsLocale()

type StepState = 'complete' | 'current' | 'upcoming'
const VARIANT: Record<StepState, NsStepNumberVariant> = {
  complete: 'check',
  current: 'filled',
  upcoming: 'outlined',
}

const resolved = computed(() => {
  const currentIndex = props.steps.findIndex((s) => s.id === props.current)
  return props.steps.map((step, index) => {
    let state: StepState = 'upcoming'
    if (index === currentIndex) state = 'current'
    else if (step.complete ?? (currentIndex >= 0 && index < currentIndex)) state = 'complete'
    return { ...step, state }
  })
})

const labelClass = (state: StepState) => (state === 'current' ? 'ns-label-sm' : 'ns-body-sm')
</script>

<style lang="scss" scoped>
.ns-onboarding-stepper {
  &__steps {
    display: flex;
    align-items: center;
    gap: var(--ns-space-2);
    margin: 0;
    padding: 0;
    list-style: none;
    color: var(--ns-color-text-primary);
  }

  &__step {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: var(--ns-space-2);

    // The connector: a 1px brand line taking the remaining width equally
    // between steps (the design's `flex: 1 0 0` line frames, 8px from each
    // neighbour, which the list gap supplies).
    & + &::before {
      content: '';
      display: block;
      flex: 1 1 0;
      width: 0;
      min-width: 1px;
      border-top: 1px solid var(--ns-color-border-primary);
    }

    // `auto` basis, not 0: with basis 0 every step got the same TOTAL width
    // and the line inside absorbed whatever its label did not take, so lines
    // differed by label width (measured 1px apart in review of this file's
    // own story). With auto, the leftover is shared on top of each step's
    // content, which is the design's equal `flex: 1 0 0` line frames.
    // No `min-width: 0`: below the content's natural width the row now
    // OVERFLOWS rather than letting labels paint over the next circle
    // (review measured labels 10px into the neighbour with ten steps at
    // 700). The minimum width is the sum of circles, labels and 8px gaps;
    // a consumer narrower than that at desktop wants fewer steps or the
    // mobile shape.
    & + & {
      flex: 1 1 auto;
    }
  }

  // Mobile first (2440:379011): circles and lines only; the labels stay in
  // the DOM for assistive technology. Desktop un-hides them at the same
  // `min-width: 1024px` every other block and useNsIsDesktop use — a
  // `max-width: 1023px` twin leaves a fractional viewport (zoomed browsers)
  // matching neither.
  &__label {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    border: 0;
    white-space: nowrap;
  }

  &__sr {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  }
}

@media (min-width: 1024px) {
  .ns-onboarding-stepper__label {
    position: static;
    width: auto;
    height: auto;
    margin: 0;
    overflow: visible;
    clip: auto;
  }
}
</style>

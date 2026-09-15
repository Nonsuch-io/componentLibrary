<template>
  <section
    class="ns-checklist-banner"
    :class="{ 'ns-checklist-banner--collapsed': !isExpanded }"
    :aria-labelledby="titleId"
  >
    <div class="ns-checklist-banner__heading">
      <div class="ns-checklist-banner__titles">
        <component :is="headingTag" :id="titleId" class="ns-checklist-banner__title ns-heading-sm">
          {{ title }}
        </component>
        <p
          v-if="isExpanded && subtitle?.trim()"
          class="ns-checklist-banner__subtitle ns-heading-sm-regular"
        >
          {{ subtitle }}
        </p>
      </div>

      <!--
        With NO TASKS there is nothing to count and nothing to disclose, so
        neither the badge nor the toggle renders — and the whole row goes
        with them, because an empty flex child still takes the heading's gap
        (8px of nothing above the title, measured in review; the hours
        editor's phantom middle-row class). The same rule hides the empty
        <ol> below (12px). A toggle over a permanently hidden list would
        flip aria-expanded on nothing — review reached that state by
        dismissing every task — which is why the toggle needs tasks too.
      -->
      <div v-if="tasks.length > 0" class="ns-checklist-banner__tag">
        <NsBadge
          class="ns-checklist-banner__badge"
          :class="{ 'ns-checklist-banner__badge--complete': remaining === 0 }"
        >
          <PhCheckCircle v-if="remaining === 0" :size="16" weight="regular" aria-hidden="true" />
          <PhWarningCircle v-else :size="16" weight="regular" aria-hidden="true" />
          {{ badgeText }}
        </NsBadge>

        <NsButton
          v-if="collapsible"
          variant="tertiary"
          size="md"
          class="ns-checklist-banner__toggle"
          :aria-expanded="isExpanded"
          :aria-controls="listId"
          @click="setExpanded(!isExpanded)"
        >
          <PhCaretUp v-if="isExpanded" :size="20" weight="regular" aria-hidden="true" />
          <PhCaretDown v-else :size="20" weight="regular" aria-hidden="true" />
          {{ isExpanded ? locale.checklist.hide : locale.checklist.show }}
        </NsButton>
      </div>
    </div>

    <!--
      role="list" restated on a list, which the lint rule rightly calls
      redundant everywhere except the one place it matters: WebKit drops list
      semantics from a `list-style: none` <ol>, and the aria-hidden step
      number leans on the list to carry the position.
    -->
    <!-- eslint-disable-next-line vuejs-accessibility/no-redundant-roles -->
    <ol
      v-show="isExpanded && tasks.length > 0"
      :id="listId"
      class="ns-checklist-banner__tasks"
      role="list"
    >
      <li
        v-for="(task, index) in tasks"
        :key="task.id"
        class="ns-checklist-banner__task"
        :class="{ 'ns-checklist-banner__task--complete': task.complete }"
      >
        <div class="ns-checklist-banner__task-main">
          <!-- The number is decoration: the list is ordered and the state is read out in text. -->
          <span class="ns-checklist-banner__step" aria-hidden="true">{{ index + 1 }}</span>
          <p :id="`${listId}-${task.id}-text`" class="ns-checklist-banner__task-text ns-body-md">
            <span class="ns-checklist-banner__sr">
              {{ task.complete ? locale.checklist.complete : locale.checklist.notComplete }},
            </span>
            <slot :name="`task-${task.id}`" :task="task">
              <strong class="ns-checklist-banner__task-title">{{ task.title }}</strong>
              <template v-if="task.description">{{ ' ' + task.description }}</template>
            </slot>
          </p>
        </div>

        <div v-if="hasAction(task) || task.dismissable" class="ns-checklist-banner__task-actions">
          <NsButton
            v-if="hasAction(task)"
            variant="secondary"
            size="md"
            class="ns-checklist-banner__task-action"
            :aria-describedby="`${listId}-${task.id}-text`"
            @click="$emit('action', task)"
          >
            {{ task.actionLabel }}
          </NsButton>
          <NsButton
            v-if="task.dismissable"
            variant="tertiary"
            size="md"
            class="ns-checklist-banner__task-dismiss"
            :aria-label="fill(locale.checklist.dismissTask, { title: task.title })"
            @click="$emit('dismiss', task)"
          >
            {{ locale.checklist.dismiss }}
          </NsButton>
        </div>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
/**
 * NsChecklistBanner — the design's `NsShopSetUpChecklistBanner`
 * (componentLibrary-lrw.4; main component 2440:237169 / 237171 / 237172,
 * instances 206:29274, 248:35337, 258:17085): a soft card with a heading,
 * a progress badge, an optional Hide/Show toggle, and an ordered list of
 * tasks, each with a step number, a sentence, and optional per-task
 * actions. Named for what it is rather than for the one instance the design
 * shows; "Shop Set Up Checklist" is the `title` prop.
 *
 * MEASURED (2026-09-14, by id): container bg-subtle, 1px border, radius 8,
 * padding 20, column gap 12. Heading is title (Small heading) + subtitle
 * (Small heading regular) at an 8px gap, with the badge and toggle on the
 * right; collapsed (248:35337, 68 tall) keeps the title and the tag row and
 * drops the subtitle. Tasks (58 tall) are surface cards, border-default,
 * radius 8, padding 8/20, row gap 12: a 20px step circle, the text block at
 * a FIXED 42px, then secondary + tertiary actions. Mobile (258:17085): the
 * tag row moves ABOVE the title, right-aligned; each task goes column with
 * a full-width actions row whose two buttons share the width equally.
 *
 * INFERRED, because the design's instances show no completed task: the
 * 20px step circle fills with bg-primary and white text when complete (the
 * design's NsStepNumber has that variant at 28px only), and the badge turns
 * to a positive tone with "All tasks complete" once nothing remains.
 *
 * TERTIARY BUTTONS render 36 tall where the design's are 28 (4px padding
 * around 14px text). No library size produces 28; componentLibrary-ksg owns
 * that decision and this is the third component to meet it. The collapsed
 * banner is therefore 76 rather than 68 until it is settled, and the story
 * pins what renders, not the design's number.
 *
 * ACCESSIBILITY. A `<section>` named by its own title; the tasks are an
 * `<ol>` so the numbering is structural and the step circle is decoration;
 * each task's text starts with visually hidden "Complete," / "Not complete,"
 * so the state is read before the sentence; the toggle carries aria-expanded
 * and aria-controls; the dismiss button's accessible name includes the task
 * title, because four identical "Dismiss" buttons are four identical
 * announcements otherwise.
 *
 * `expanded` is a v-model (`update:expanded`) with an uncontrolled fallback,
 * like NsHoursOfOperation's value. Actions and dismissals are EMITTED, not
 * handled: which route "Go to Vendors" opens and whether a dismissed task
 * comes back are the consumer's.
 */
import { computed, ref, useId, watch } from 'vue'
import { PhCaretDown, PhCaretUp, PhCheckCircle, PhWarningCircle } from '@phosphor-icons/vue'
import NsBadge from '../NsBadge/NsBadge.vue'
import NsButton from '../NsButton/NsButton.vue'
import { useNsLocale } from '../../composables/useNsLocale'
import { fill } from '../../locale/fill'

export interface NsChecklistTask {
  /** Stable key; also names the per-task slot `task-{id}`. */
  id: string
  /** The emphasised phrase of the sentence — "Add vendors". */
  title: string
  /** The rest of the sentence — "so you can easily order and track item restock." */
  description?: string
  complete?: boolean
  /** Renders the secondary action button with this label; omitted = no button. */
  actionLabel?: string
  /** Renders the tertiary Dismiss button. */
  dismissable?: boolean
}

export interface NsChecklistBannerProps {
  title: string
  subtitle?: string
  tasks: NsChecklistTask[]
  /** v-model:expanded. Omitted → starts expanded and toggles on its own. */
  expanded?: boolean
  /** Show the Hide/Show toggle. */
  collapsible?: boolean
  /**
   * Heading level of the title. 2 by default: the banner sits under a page's
   * h1. Bind it (`:level="3"`), as NsPageTitle's; clamped to 1–6 at runtime.
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6
}

const props = withDefaults(defineProps<NsChecklistBannerProps>(), {
  subtitle: undefined,
  expanded: undefined,
  collapsible: true,
  level: 2,
})

const emit = defineEmits<{
  'update:expanded': [value: boolean]
  action: [task: NsChecklistTask]
  dismiss: [task: NsChecklistTask]
}>()

const locale = useNsLocale()
const titleId = useId()
const listId = useId()

const fallbackExpanded = ref(true)
watch(
  () => props.expanded,
  (next, previous) => {
    if (next == null && previous != null) fallbackExpanded.value = previous
  },
)
const isExpanded = computed(() => props.expanded ?? fallbackExpanded.value)

function setExpanded(next: boolean) {
  if (props.expanded == null) fallbackExpanded.value = next
  emit('update:expanded', next)
}

const headingTag = computed(() => {
  // A string ("3" from an unbound `level="3"`) is not finite and falls to
  // h2; Vue's prop type check warns about it in dev, as it does for
  // NsPageTitle. Fractions round, out-of-range clamps.
  const level = Number.isFinite(props.level) ? Math.round(props.level) : 2
  return `h${Math.min(6, Math.max(1, level))}`
})

/** A whitespace label would render a 36px button with no accessible name (axe: button-name). */
const hasAction = (task: NsChecklistTask) => Boolean(task.actionLabel?.trim())

const remaining = computed(() => props.tasks.filter((t) => !t.complete).length)

const badgeText = computed(() => {
  if (remaining.value === 0) return locale.checklist.allComplete
  if (remaining.value === 1) return locale.checklist.taskToComplete
  return fill(locale.checklist.tasksToComplete, { count: String(remaining.value) })
})
</script>

<style lang="scss" scoped>
.ns-checklist-banner {
  display: flex;
  flex-direction: column;
  gap: var(--ns-space-3);
  // 19 + the 1px border = the design's 20px inset. Figma draws a stroke over
  // the frame without taking layout space; a CSS border takes it, and with
  // padding 20 the task rows measured 1176 against the design's 1178.
  padding: calc(var(--ns-space-5) - 1px);
  border: 1px solid var(--ns-color-border-primary-subtle);
  // The design says `radius-sm` and means 8px; the library's --ns-radius-sm
  // is 4px and its --ns-radius-md is 8 (the names are one step apart between
  // Figma and the tokens — componentLibrary-56l). 8 is what is rendered.
  border-radius: var(--ns-radius-md);
  background: var(--ns-color-bg-subtle);
  color: var(--ns-color-text-primary);

  // Mobile first (2440:237172): the tag row sits ABOVE the titles, pushed to
  // the right; the titles take the full width beneath it.
  &__heading {
    display: flex;
    flex-direction: column;
    gap: var(--ns-space-2);
  }

  &__titles {
    display: flex;
    flex-direction: column;
    gap: var(--ns-space-2);
    min-width: 0;
    order: 2;
  }

  &__title,
  &__subtitle {
    margin: 0;
  }

  &__tag {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--ns-space-3);
    order: 1;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    gap: var(--ns-space-1);
    padding: var(--ns-space-0) var(--ns-space-2);
    border-radius: var(--ns-radius-sm);
    background: var(--ns-color-bg-warning);
    color: var(--ns-color-text-on-bg-warning);
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1.4;

    &--complete {
      background: var(--ns-color-bg-positive);
      color: var(--ns-color-text-on-bg-positive);
    }
  }

  &__tasks {
    display: flex;
    flex-direction: column;
    gap: var(--ns-space-3);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  // The task card (I2440:237183;6295:24041): surface, border, 8/20 padding.
  // Mobile: a column — [step + text] then the actions row.
  &__task {
    display: flex;
    flex-direction: column;
    gap: var(--ns-space-3);
    // Same border arithmetic as the container: the design's 8/20 inset
    // includes its stroke, so 7/19 + 1px is what renders 58 tall and 1178
    // wide (measured 60 and 1176 with the padding at face value).
    padding: calc(var(--ns-space-2) - 1px) calc(var(--ns-space-5) - 1px);
    border: 1px solid var(--ns-color-border-default);
    border-radius: var(--ns-radius-md); // 8, see the container
    background: var(--ns-color-bg-surface);
  }

  &__task-main {
    display: flex;
    align-items: center;
    gap: var(--ns-space-3);
    min-width: 0;
  }

  // NsStepNumber, 20px, Not Completed (2440:237127): surface with a brand
  // border and a brand 12/600 number. Completed is INFERRED from the 28px
  // variant (2440:237124): brand fill, white number.
  &__step {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 20px;
    height: 20px;
    border: 1px solid var(--ns-color-border-primary);
    border-radius: var(--ns-radius-full);
    background: var(--ns-color-bg-surface);
    color: var(--ns-color-text-brand);
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1;

    .ns-checklist-banner__task--complete & {
      background: var(--ns-color-bg-primary);
      color: var(--ns-color-text-on-brand);
    }
  }

  &__task-text {
    flex: 1 1 auto;
    min-width: 0;
    margin: 0;
  }

  &__task-title {
    font-weight: 600;
  }

  &__task-actions {
    display: flex;
    align-items: center;
    gap: var(--ns-space-3);

    // Mobile (I2440:237221;6356:27506): both buttons share the row equally.
    > * {
      flex: 1 1 0;
    }
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

// Desktop (2440:237169/237171): heading is one row, titles left, tag right;
// each task is one row with the text block a FIXED 42px (the design's
// Task Name frame, which is what makes every row 58) and the actions at
// their content width on the right.
@media (min-width: 1024px) {
  .ns-checklist-banner {
    &__heading {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: var(--ns-space-3);
    }

    &__titles {
      flex: 1 1 0;
      order: 1;
    }

    &__tag {
      flex: 0 0 auto;
      order: 2;
    }

    &__task {
      flex-direction: row;
      align-items: center;
    }

    // The design's Task Name frame is a FIXED 42 (what makes every row 58);
    // here it is a min-height on the row's main cell, which already centres
    // its children, so the paragraph stays a paragraph. An earlier version
    // put `display: flex` on the <p> itself to centre it — which blockified
    // the <strong> and the text run into two flex items: the word space
    // between them vanished on every row and a wrapping sentence became two
    // columns. Review measured both; nothing that asserts box sizes could.
    &__task-main {
      flex: 1 1 0;
      min-height: 42px;
    }

    &__task-actions {
      flex: 0 0 auto;

      > * {
        flex: 0 0 auto;
      }
    }
  }
}
</style>

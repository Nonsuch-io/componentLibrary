<template>
  <div
    v-bind="attrsWithoutDisabled"
    ref="rootEl"
    class="ns-follow-up-question"
    role="group"
    :aria-labelledby="questionId"
    :aria-disabled="resolvedDisable || undefined"
    tabindex="-1"
  >
    <div class="ns-follow-up-question__header">
      <p :id="questionId" class="ns-follow-up-question__question ns-heading-sm-regular">
        {{ question }}
      </p>
      <NsBadge v-if="resolvedTag" class="ns-follow-up-question__tag">
        <PhInfo :size="16" weight="regular" aria-hidden="true" />
        {{ resolvedTag }}
      </NsBadge>
    </div>

    <div class="ns-follow-up-question__options">
      <NsCheckbox
        v-for="option in options"
        :key="option.id"
        :model-value="modelValue.includes(option.id)"
        :label="option.label"
        :disable="resolvedDisable"
        dense
        class="ns-follow-up-question__option"
        @update:model-value="toggle(option.id, $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * NsFollowUpQuestion — the design's `NsShopCategoryFollowUp`
 * (componentLibrary-yst): a question revealed by an earlier answer, with a
 * tag saying it is extra and a row of checkboxes — "Do you group your items
 * by gender? Check as many as you'd like, or none." over Men's / Women's /
 * Kids' / Unisex. Named for what it is rather than for the one question
 * the design shows; which categories have a follow-up, and what it asks,
 * is butiq's taxonomy (their words: a Follow Up axis on 7 of 51 types).
 *
 * MEASURED (2026-09-16): 2 of 4 desktop SignUpBusinessDetails instances
 * carry it (165:11339 yes at 870x93, 165:10767 no) — so it is CONDITIONAL,
 * and the consumer shows it. A surface-alt card, 1px border-default,
 * radius 8, padding 20 (incl. the stroke), gap 12: a header row with the
 * question ("Small heading regular" 16/400, flex 1) and an info badge
 * ("Additional Options", 12/600 white on text-info #0069b4, 16px icon, 72
 * wide), then the checkboxes at a 32px gap (NsCheckbox 18px box, 14/400
 * label). Mobile (684:62462): 310x292 — the row becomes a column and the
 * header stacks; INFERRED from the height, the mobile internals could not
 * be read without a selection.
 *
 * DISCLOSURE IS WHERE THIS GOES WRONG, and the bead said so. Showing the
 * card is the consumer's (a `v-if` on the category), which means the
 * announcement and focus are theirs too — a card that appears under the
 * select with no signal is invisible to a screen reader user who has moved
 * on. The card helps: its root is focusable by script (`tabindex="-1"`)
 * and `focus()` is exposed, so a consumer can call it after the reveal;
 * the group is named by the question, so focusing it reads the question
 * first. (A `<fieldset>` was the first draft; a legend that is not the
 * fieldset's first child is not a legend to assistive technology, and the
 * header row needs the badge beside the question.) The RevealedByASelect
 * story shows the pattern.
 *
 * `modelValue` is the checked option ids; a multi-select, as the design's
 * copy says ("as many as you'd like, or none").
 */
import { computed, ref, useId } from 'vue'
import { PhInfo } from '@phosphor-icons/vue'
import NsBadge from '../NsBadge/NsBadge.vue'
import NsCheckbox from '../NsCheckbox/NsCheckbox.vue'
import { useNsDisabled } from '../../composables/useNsDisabled'
import { useNsLocale } from '../../composables/useNsLocale'

export interface NsFollowUpOption {
  id: string
  label: string
}

export interface NsFollowUpQuestionProps {
  question: string
  options: readonly NsFollowUpOption[]
  /** Checked option ids. */
  modelValue?: readonly string[]
  /** The badge's text; "Additional Options" from the locale by default. Empty → no badge. */
  tag?: string
  disable?: boolean
}

const props = withDefaults(defineProps<NsFollowUpQuestionProps>(), {
  modelValue: () => [],
  tag: undefined,
  disable: false,
})

const emit = defineEmits<{
  'update:modelValue': [ids: string[]]
}>()

defineOptions({ inheritAttrs: false })

const locale = useNsLocale()
const questionId = useId()
const rootEl = ref<HTMLElement | null>(null)
const { resolvedDisable, attrsWithoutDisabled } = useNsDisabled(
  'NsFollowUpQuestion',
  () => props.disable,
)

const resolvedTag = computed(() => {
  const tag = props.tag === undefined ? locale.followUp.additionalOptions : props.tag
  return tag.trim() || null
})

function toggle(id: string, checked: boolean) {
  const next = props.modelValue.filter((v) => v !== id)
  if (checked) next.push(id)
  emit('update:modelValue', next)
}

/** For the consumer's reveal: move focus here so the question is read first. */
function focus() {
  rootEl.value?.focus()
}

defineExpose({ focus })
</script>

<style lang="scss" scoped>
.ns-follow-up-question {
  display: flex;
  flex-direction: column;
  gap: var(--ns-space-3);
  // 19 + the 1px border = the design's 20 inset (a Figma stroke takes no layout space).
  padding: calc(var(--ns-space-5) - 1px);
  border: 1px solid var(--ns-color-border-default);
  border-radius: var(--ns-radius-md);
  background: var(--ns-color-bg-surface-alt);
  color: var(--ns-color-text-primary);

  &:focus-visible {
    outline: 2px solid var(--ns-color-border-primary);
    outline-offset: 2px;
  }

  // Mobile first: the header stacks and the options go to a column.
  &__header {
    display: flex;
    flex-direction: column;
    gap: var(--ns-space-3);
  }

  &__question {
    margin: 0;
    min-width: 0;
  }

  &__tag {
    display: inline-flex;
    align-items: center;
    gap: var(--ns-space-1);
    align-self: flex-start;
    padding: var(--ns-space-0) var(--ns-space-2);
    border-radius: var(--ns-radius-md);
    // The design fills the badge with `color-text-info` (#0069b4) — a TEXT
    // token used as a surface. In dark that token becomes a pale blue meant
    // for text on dark and white on it is 2.53:1 (the contrast gate caught
    // it). `--ns-color-status-info` is the same #0069b4 in every theme under
    // the right class: white on it is 5.71:1 light and dark.
    background: var(--ns-color-status-info);
    color: var(--ns-color-text-on-info);
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1.4;
    white-space: nowrap;
  }

  &__options {
    display: flex;
    flex-direction: column;
    gap: var(--ns-space-3);
  }
}

@media (min-width: 1024px) {
  .ns-follow-up-question {
    &__header {
      flex-direction: row;
      align-items: center;
      gap: var(--ns-space-5);
    }

    &__question {
      flex: 1 1 0;
    }

    &__options {
      flex-direction: row;
      flex-wrap: wrap;
      gap: var(--ns-space-8); // 32 between checkboxes (I165:11339;6259:20129;6259:16711)
    }
  }
}
</style>

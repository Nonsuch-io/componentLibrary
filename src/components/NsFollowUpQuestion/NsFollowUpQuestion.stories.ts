import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor } from 'storybook/test'
import { nextTick, ref } from 'vue'
import NsFollowUpQuestion from './NsFollowUpQuestion.vue'
import NsSelect from '../NsSelect/NsSelect.vue'

/** The design's instance (I165:11339;6259:20129), word for word. */
const gender = {
  question: 'Do you group your items by gender? Check as many as you’d like, or none.',
  options: [
    { id: 'mens', label: 'Men’s' },
    { id: 'womens', label: 'Women’s' },
    { id: 'kids', label: 'Kids’' },
    { id: 'unisex', label: 'Unisex' },
  ],
}

const meta: Meta<typeof NsFollowUpQuestion> = {
  title: 'Components/NsFollowUpQuestion',
  component: NsFollowUpQuestion,
  tags: ['autodocs'],
  args: { ...gender, modelValue: ['mens', 'womens'] },
}

export default meta
type Story = StoryObj<typeof meta>

const fontsReady = () => document.fonts.ready

const controlled = (initial: string[] = ['mens', 'womens'], width = '870px') => ({
  components: { NsFollowUpQuestion },
  setup: () => ({ value: ref(initial), gender }),
  template: `<div style="width: ${width}"><NsFollowUpQuestion v-bind="gender" v-model="value" /></div>`,
})

export const Default: Story = { render: () => controlled() }

export const NothingChecked: Story = { render: () => controlled([]) }

export const NoTag: Story = { args: { tag: '' } }

export const Disabled: Story = { args: { disable: true } }

/**
 * THE REVEAL, which is the consumer's and where a disclosure goes wrong:
 * the card appears under the select on a category with a follow-up, and
 * the consumer moves focus to it so a screen reader hears the question.
 */
export const RevealedByASelect: Story = {
  render: () => ({
    components: { NsFollowUpQuestion, NsSelect },
    setup: () => {
      const category = ref<string | null>(null)
      const value = ref<string[]>([])
      const followUp = ref<InstanceType<typeof NsFollowUpQuestion> | null>(null)
      const hasFollowUp = () => category.value === 'clothing'
      const onCategory = async (next: string) => {
        category.value = next
        await nextTick()
        followUp.value?.focus()
      }
      return { category, value, followUp, hasFollowUp, onCategory, gender }
    },
    template: `
      <div style="max-width: 870px; display: flex; flex-direction: column; gap: 20px">
        <NsSelect
          label="Shop Category"
          :model-value="category"
          :options="[{ label: 'Clothing/Fashion Retail', value: 'clothing' }, { label: 'Groceries', value: 'groceries' }]"
          emit-value
          map-options
          @update:model-value="onCategory"
        />
        <NsFollowUpQuestion v-if="hasFollowUp()" ref="followUp" v-bind="gender" v-model="value" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('.ns-follow-up-question')).toBeNull()
    const select = canvasElement.querySelector('[role="combobox"]') as HTMLElement
    await userEvent.click(select)
    const option = await waitFor(() => {
      const el = [...document.querySelectorAll<HTMLElement>('.q-item')].find((e) =>
        e.textContent?.includes('Clothing'),
      )
      expect(el).toBeTruthy()
      return el!
    })
    await userEvent.click(option)
    // The menu leaves the DOM after a transition; axe runs when the play
    // returns and QSelect's listbox has no accessible name (its own gap,
    // componentLibrary-2e7), so wait for it to be gone.
    await waitFor(() => expect(document.querySelector('[role="listbox"]')).toBeNull())
    const card = await waitFor(() => {
      const el = canvasElement.querySelector('.ns-follow-up-question') as HTMLElement
      expect(el).not.toBeNull()
      return el
    })
    // Focus moved onto the group, whose name is the question.
    await waitFor(() => expect(document.activeElement).toBe(card))
    await expect(card.getAttribute('role')).toBe('group')
    await expect(
      document.getElementById(card.getAttribute('aria-labelledby')!)!.textContent?.trim(),
    ).toBe(gender.question)
  },
}

/**
 * DESKTOP GEOMETRY IS REAL — I165:11339;6259:20129 at 870x93: the question
 * and badge on one row, the checkboxes on one row 32px apart.
 */
export const LayoutIsRealOnDesktop: Story = {
  render: () => controlled(),
  play: async ({ canvasElement }) => {
    await fontsReady()
    await expect(window.innerWidth).toBeGreaterThanOrEqual(1024)
    const card = canvasElement.querySelector('.ns-follow-up-question') as HTMLElement
    const rect = card.getBoundingClientRect()
    await expect(rect.width).toBe(870)
    // 20 + 20.8 (question) + 12 + (checkbox row) + 20. MEASURED, with the
    // design's 93 being the same per-row rounding as elsewhere.
    await expect(rect.height).toBeCloseTo(93.8, 0) // dense NsCheckbox rows: 20 + 20.8 + 12 + 21 + 20
    await expect(getComputedStyle(card).backgroundColor).toBe('rgb(253, 253, 249)')

    const question = card.querySelector('.ns-follow-up-question__question')!.getBoundingClientRect()
    const tag = card.querySelector('.ns-follow-up-question__tag') as HTMLElement
    await expect(tag.getBoundingClientRect().left).toBeGreaterThan(question.right)
    await expect(getComputedStyle(tag).backgroundColor).toBe('rgb(0, 105, 180)')
    await expect(getComputedStyle(tag).color).toBe('rgb(255, 255, 255)')

    const boxes = [...card.querySelectorAll<HTMLElement>('.ns-follow-up-question__option')]
    await expect(boxes.length).toBe(4)
    for (let i = 1; i < boxes.length; i++) {
      await expect(boxes[i].getBoundingClientRect().top).toBe(boxes[0].getBoundingClientRect().top)
      await expect(
        boxes[i].getBoundingClientRect().left - boxes[i - 1].getBoundingClientRect().right,
      ).toBe(32)
    }
  },
}

/**
 * MOBILE — 684:62462 at 310: the header stacks and the options go to a
 * column. INFERRED from the 292 height; the internals were not readable.
 */
export const LayoutIsRealOnMobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => controlled(['mens', 'womens'], '310px'),
  play: async ({ canvasElement }) => {
    await fontsReady()
    await expect(window.innerWidth).toBeLessThan(1024)
    const card = canvasElement.querySelector('.ns-follow-up-question') as HTMLElement
    await expect(card.getBoundingClientRect().width).toBe(310)
    const question = card.querySelector('.ns-follow-up-question__question')!.getBoundingClientRect()
    const tag = card.querySelector('.ns-follow-up-question__tag')!.getBoundingClientRect()
    await expect(tag.top).toBeGreaterThanOrEqual(question.bottom)
    const boxes = [...card.querySelectorAll<HTMLElement>('.ns-follow-up-question__option')]
    for (let i = 1; i < boxes.length; i++) {
      await expect(boxes[i].getBoundingClientRect().top).toBeGreaterThanOrEqual(
        boxes[i - 1].getBoundingClientRect().bottom,
      )
    }
  },
}

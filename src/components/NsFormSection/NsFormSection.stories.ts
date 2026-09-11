import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect } from 'storybook/test'
import NsFormSection from './NsFormSection.vue'
import NsFormFooter from '../NsFormFooter/NsFormFooter.vue'
import NsInput from '../NsInput/NsInput.vue'
import NsBanner from '../NsBanner/NsBanner.vue'
import NsButton from '../NsButton/NsButton.vue'

const meta: Meta<typeof NsFormSection> = {
  title: 'Components/NsFormSection',
  component: NsFormSection,
  tags: ['autodocs'],
  argTypes: { level: { control: 'select', options: [2, 3, 4, 5, 6] } },
  args: {
    title: 'Your profile',
    description: 'This is how you will appear to customers.',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsFormSection, NsInput },
    setup: () => ({ args }),
    template: `
      <NsFormSection v-bind="args">
        <NsInput label="First name" />
        <NsInput label="Last name" />
      </NsFormSection>
    `,
  }),
}

/**
 * TITLE AND DESCRIPTION ARE INDEPENDENTLY OPTIONAL.
 *
 * PlanCheckOutPaymentMethod (185:10738) has a title and no description — the
 * instance that disproved the "one optional pair" reading after three earlier
 * variants all happened to carry both. A paired model ships an empty descender
 * or a collapsed heading, and it survives screenshot review looking fine.
 */
export const HeadingCombinations: Story = {
  render: () => ({
    components: { NsFormSection, NsInput },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1.5rem">
        <NsFormSection title="Title only"><NsInput label="Field" /></NsFormSection>
        <NsFormSection description="Description only, no title."><NsInput label="Field" /></NsFormSection>
        <NsFormSection title="Both" description="A title and a description."><NsInput label="Field" /></NsFormSection>
        <NsFormSection><NsInput label="Neither — no heading block at all" /></NsFormSection>
      </div>
    `,
  }),
}

/**
 * THE `notice` SLOT IS SECTION-SCOPED AND SEVERITY-NEUTRAL.
 *
 * It sits above the fields and speaks for the whole section — verification
 * refused, a plan downgrade that disabled a field, a validation summary. It is
 * NOT the place for a message about one input: that belongs to whatever
 * occupies that row, because its scope is the field beside it. The two look
 * identical in a screenshot and differ in the DOM order a screen reader walks,
 * which is why there is deliberately no row-level slot here.
 */
export const WithNotice: Story = {
  render: (args) => ({
    components: { NsFormSection, NsInput, NsBanner },
    setup: () => ({ args }),
    template: `
      <NsFormSection v-bind="args" title="Business details">
        <template #notice>
          <NsBanner color="warning">We could not verify this GST/HST number. You can continue and we will retry.</NsBanner>
        </template>
        <NsInput label="Legal business name" />
        <NsInput label="GST/HST number" />
      </NsFormSection>
    `,
  }),
}

/**
 * THE FIELDS SLOT TAKES A WHOLE COMPONENT, not only rows of inputs.
 *
 * ShopHours (198:21794) puts an entire NsHoursOfOperation in here, and ShopPhoto
 * (194:15745) puts an NsImageUpload and nothing else. Genericity is the design
 * constraint: eleven bespoke sections would make a GST/HST label change a
 * library release.
 */
export const ArbitraryFieldsContent: Story = {
  render: () => ({
    components: { NsFormSection },
    template: `
      <NsFormSection title="Shop hours">
        <div style="border: 1px dashed var(--ns-color-border-default); padding: 2rem; text-align: center; border-radius: 8px">
          A whole component lives here — NsHoursOfOperation in the design.
        </div>
      </NsFormSection>
    `,
  }),
}

/**
 * The pair, as a form actually composes: sections above, one footer below.
 *
 * ASSERTS ALIGNMENT IN A REAL BROWSER. A review measured this exact story with
 * the section card ending at x=1200 and the footer's trailing button at 1168 —
 * a 32px misalignment, because the footer then carried a gutter that belongs
 * to the page. It carries none now, and this pins that the trailing action
 * lines up with the card edge above it.
 */
export const WithFooter: Story = {
  render: () => ({
    components: { NsFormSection, NsFormFooter, NsInput, NsButton },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1.25rem">
        <NsFormSection title="Your profile" description="How you appear to customers.">
          <NsInput label="First name" />
          <NsInput label="Last name" />
        </NsFormSection>
        <NsFormSection title="Contact">
          <NsInput label="Email" />
        </NsFormSection>
        <NsFormFooter>
          <NsButton variant="tertiary">Back</NsButton>
          <NsButton variant="primary" data-testid="continue">Continue</NsButton>
        </NsFormFooter>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('.ns-form-section') as HTMLElement
    const next = canvasElement.querySelector('[data-testid="continue"]') as HTMLElement
    await expect(next.getBoundingClientRect().right).toBeCloseTo(
      card.getBoundingClientRect().right,
      0,
    )
  },
}

/** `level` sets the element, never the type — the page heading owns the h1. */
export const HeadingLevels: Story = {
  args: { level: 3 },
  render: (args) => ({
    components: { NsFormSection, NsInput },
    setup: () => ({ args }),
    template: `<NsFormSection v-bind="args"><NsInput label="Field" /></NsFormSection>`,
  }),
}

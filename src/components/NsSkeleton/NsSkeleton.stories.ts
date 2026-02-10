import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsSkeleton from './NsSkeleton.vue'

const meta = {
  title: 'Components/NsSkeleton',
  component: NsSkeleton,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: [
        'text',
        'rect',
        'circle',
        'QBtn',
        'QBadge',
        'QChip',
        'QToolbar',
        'QCheckbox',
        'QRadio',
        'QToggle',
        'QSlider',
        'QRange',
        'QInput',
        'QAvatar',
      ],
      description: 'Shape type — use component names for accurate matching',
    },
    animation: {
      control: 'select',
      options: ['wave', 'pulse', 'pulse-x', 'pulse-y', 'fade', 'blink', 'none'],
      description: 'Animation style',
    },
    square: {
      control: 'boolean',
      description: 'Remove border-radius',
    },
    bordered: {
      control: 'boolean',
      description: 'Add a border',
    },
    width: {
      control: 'text',
      description: 'Custom width (CSS value)',
    },
    height: {
      control: 'text',
      description: 'Custom height (CSS value)',
    },
  },
} satisfies Meta<typeof NsSkeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    type: 'rect',
    width: '200px',
    height: '100px',
  },
}

export const Types: Story = {
  render: () => ({
    components: { NsSkeleton },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div>
          <div style="margin-bottom: 4px; font-size: 12px; color: #888;">text</div>
          <NsSkeleton type="text" />
        </div>
        <div>
          <div style="margin-bottom: 4px; font-size: 12px; color: #888;">rect</div>
          <NsSkeleton type="rect" width="200px" height="100px" />
        </div>
        <div>
          <div style="margin-bottom: 4px; font-size: 12px; color: #888;">circle</div>
          <NsSkeleton type="circle" />
        </div>
        <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
          <div>
            <div style="margin-bottom: 4px; font-size: 12px; color: #888;">QBtn</div>
            <NsSkeleton type="QBtn" />
          </div>
          <div>
            <div style="margin-bottom: 4px; font-size: 12px; color: #888;">QBadge</div>
            <NsSkeleton type="QBadge" />
          </div>
          <div>
            <div style="margin-bottom: 4px; font-size: 12px; color: #888;">QChip</div>
            <NsSkeleton type="QChip" />
          </div>
          <div>
            <div style="margin-bottom: 4px; font-size: 12px; color: #888;">QAvatar</div>
            <NsSkeleton type="QAvatar" />
          </div>
        </div>
        <div>
          <div style="margin-bottom: 4px; font-size: 12px; color: #888;">QInput</div>
          <NsSkeleton type="QInput" />
        </div>
        <div>
          <div style="margin-bottom: 4px; font-size: 12px; color: #888;">QToolbar</div>
          <NsSkeleton type="QToolbar" />
        </div>
      </div>
    `,
  }),
}

export const Animations: Story = {
  render: () => ({
    components: { NsSkeleton },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div v-for="anim in ['wave', 'pulse', 'pulse-x', 'pulse-y', 'fade', 'blink', 'none']" :key="anim">
          <div style="margin-bottom: 4px; font-size: 12px; color: #888;">{{ anim }}</div>
          <NsSkeleton type="rect" :animation="anim" width="200px" height="40px" />
        </div>
      </div>
    `,
  }),
}

export const CardPlaceholder: Story = {
  name: 'Recipe: Card',
  render: () => ({
    components: { NsSkeleton },
    template: `
      <div style="width: 300px; padding: 16px; border: 1px solid #e0e0e0; border-radius: 12px;">
        <NsSkeleton type="rect" height="180px" style="margin-bottom: 12px;" />
        <NsSkeleton type="text" style="margin-bottom: 8px;" />
        <NsSkeleton type="text" width="60%" style="margin-bottom: 16px;" />
        <div style="display: flex; gap: 8px;">
          <NsSkeleton type="QBtn" />
          <NsSkeleton type="QBtn" />
        </div>
      </div>
    `,
  }),
}

export const ListPlaceholder: Story = {
  name: 'Recipe: List',
  render: () => ({
    components: { NsSkeleton },
    template: `
      <div style="width: 400px; display: flex; flex-direction: column; gap: 12px;">
        <div v-for="i in 4" :key="i" style="display: flex; gap: 12px; align-items: center;">
          <NsSkeleton type="QAvatar" />
          <div style="flex: 1;">
            <NsSkeleton type="text" style="margin-bottom: 6px;" />
            <NsSkeleton type="text" width="60%" />
          </div>
        </div>
      </div>
    `,
  }),
}

export const FormPlaceholder: Story = {
  name: 'Recipe: Form',
  render: () => ({
    components: { NsSkeleton },
    template: `
      <div style="width: 350px; display: flex; flex-direction: column; gap: 16px;">
        <NsSkeleton type="QInput" />
        <NsSkeleton type="QInput" />
        <NsSkeleton type="QInput" />
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <NsSkeleton type="QBtn" />
          <NsSkeleton type="QBtn" />
        </div>
      </div>
    `,
  }),
}

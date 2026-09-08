<template>
  <div class="typography-page">
    <h1 class="page-title">Typography Scale</h1>
    <p class="page-subtitle">
      Semantic token layer — use <code>@extend %&lt;token&gt;</code> in your component's
      <code>&lt;style lang="scss"&gt;</code>.
    </p>

    <table class="type-table">
      <thead>
        <tr>
          <th>Token</th>
          <th>Preview</th>
          <th>Properties</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.token">
          <td>
            <code class="token-name">%{{ row.token }}</code>
          </td>
          <td>
            <span :class="`ns-${row.token}`">{{ row.sample }}</span>
          </td>
          <td>
            <code class="props">{{ row.props }}</code>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
/**
 * THE ROW LIST IS DERIVED, NOT HAND-MAINTAINED. This table was a fifth copy of
 * NsText's vocabulary and had already drifted — it was missing overline-lg,
 * overline-md, overline-md-bold and display, so four shipped type styles were
 * absent from the page documenting the type scale, silently. Found by review;
 * see componentLibrary-lrw.8.
 *
 * Now it iterates KNOWN_VARIANTS, so a new variant appears here automatically
 * and a missing DETAILS entry is caught by TypographyScale.test.ts rather than
 * quietly rendering a blank cell.
 */
import { KNOWN_VARIANTS } from '../components/NsText/variants'

const DETAILS: Record<string, { sample: string; props: string }> = {
  caption: { sample: 'Caption text', props: '10px · regular · lh 1.6' },
  overline: { sample: 'Overline label', props: '10px · medium · uppercase · ls 0.08em' },
  'overline-lg': { sample: 'Large overline', props: '28px · regular · uppercase · lh 1.1' },
  'overline-md': { sample: 'Medium overline', props: '14px · medium · uppercase · lh 1.28' },
  'overline-md-bold': { sample: 'Medium overline', props: '14px · bold · uppercase · lh 1.28' },
  'body-sm': { sample: 'Small body text', props: '12px · regular · lh 1.5' },
  'body-md': { sample: 'Medium body text', props: '14px · regular · lh 1.5' },
  'label-xs': { sample: 'Extra small label', props: '10px · semibold · lh 1.6' },
  'label-sm': { sample: 'Small label', props: '12px · semibold · lh 1.4' },
  'label-md': { sample: 'Medium label', props: '14px · semibold · lh 1.4' },
  'heading-sm': { sample: 'Small heading', props: '16px · semibold · lh 1.3' },
  'heading-sm-regular': { sample: 'Small heading', props: '16px · regular · lh 1.3' },
  'heading-md': { sample: 'Medium heading', props: '20px · semibold · lh 1.25' },
  'heading-md-regular': { sample: 'Medium heading', props: '20px · regular · lh 1.25' },
  'heading-lg': { sample: 'Large heading', props: '24px · semibold · lh 1.2' },
  'heading-lg-regular': { sample: 'Large heading', props: '24px · regular · lh 1.2' },
  'heading-xl': { sample: 'XL heading', props: '32px · semibold · lh 1.15' },
  'heading-xl-regular': { sample: 'XL heading', props: '32px · regular · lh 1.15' },
  'heading-2xl': { sample: '2XL heading', props: '48px · semibold · lh 1.1' },
  'heading-2xl-regular': { sample: '2XL heading', props: '48px · regular · lh 1.1' },
  display: { sample: 'Display', props: '92px · semibold · italic · lh 1.1' },
}

const rows = KNOWN_VARIANTS.map((token) => ({ token, ...DETAILS[token] }))
</script>

<style scoped>
.typography-page {
  max-width: 900px;
  padding: 2rem;
  font-family: var(--ns-font-family-text, 'Fixel Text', sans-serif);
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: var(--ns-color-text-secondary, #757575);
  margin-bottom: 2rem;
  font-size: 0.875rem;
}

.type-table {
  width: 100%;
  border-collapse: collapse;
}

.type-table th {
  text-align: left;
  padding: 0.5rem 1rem;
  border-bottom: 2px solid var(--ns-color-border-default, #e5e7eb);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ns-color-text-tertiary, #9ca3af);
}

.type-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--ns-color-border-default, #e5e7eb);
  vertical-align: middle;
}

.token-name {
  font-size: 0.8rem;
  color: var(--ns-color-bg-brand-active, #c05400);
  white-space: nowrap;
}

.props {
  font-size: 0.75rem;
  color: var(--ns-color-text-tertiary, #9ca3af);
}
</style>

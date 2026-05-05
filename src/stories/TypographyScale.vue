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
const rows = [
  { token: 'caption', sample: 'Caption text', props: '10px · regular · lh 1.6' },
  { token: 'overline', sample: 'Overline label', props: '10px · medium · uppercase · ls 0.08em' },
  { token: 'body-sm', sample: 'Small body text', props: '12px · regular · lh 1.5' },
  { token: 'body-md', sample: 'Medium body text', props: '14px · regular · lh 1.5' },
  { token: 'label-xs', sample: 'Extra small label', props: '10px · semibold · lh 1.6' },
  { token: 'label-sm', sample: 'Small label', props: '12px · semibold · lh 1.4' },
  { token: 'label-md', sample: 'Medium label', props: '14px · semibold · lh 1.4' },
  { token: 'heading-sm', sample: 'Small heading', props: '16px · semibold · lh 1.3' },
  { token: 'heading-sm-regular', sample: 'Small heading', props: '16px · regular · lh 1.3' },
  { token: 'heading-md', sample: 'Medium heading', props: '20px · semibold · lh 1.25' },
  { token: 'heading-md-regular', sample: 'Medium heading', props: '20px · regular · lh 1.25' },
  { token: 'heading-lg', sample: 'Large heading', props: '24px · semibold · lh 1.2' },
  { token: 'heading-lg-regular', sample: 'Large heading', props: '24px · regular · lh 1.2' },
  { token: 'heading-xl', sample: 'XL heading', props: '32px · semibold · lh 1.15' },
  { token: 'heading-xl-regular', sample: 'XL heading', props: '32px · regular · lh 1.15' },
  { token: 'heading-2xl', sample: '2XL heading', props: '48px · semibold · lh 1.1' },
  { token: 'heading-2xl-regular', sample: '2XL heading', props: '48px · regular · lh 1.1' },
]
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
  color: var(--ns-color-neutral-600, #475569);
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
  border-bottom: 2px solid var(--ns-color-neutral-200, #e2e8f0);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ns-color-neutral-500, #64748b);
}

.type-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--ns-color-neutral-100, #f1f5f9);
  vertical-align: middle;
}

.token-name {
  font-size: 0.8rem;
  color: var(--ns-color-primary, #cc3c00);
  white-space: nowrap;
}

.props {
  font-size: 0.75rem;
  color: var(--ns-color-neutral-500, #64748b);
}
</style>

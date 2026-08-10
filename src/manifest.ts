/**
 * Component manifest — maps Quasar component names to their Nonsuch equivalents.
 *
 * Consuming apps can use this manifest to:
 * 1. Generate ESLint rules that ban raw Quasar usage when an Ns wrapper exists
 * 2. Run CI checks to detect drift between the app and the library
 * 3. Power migration codemods
 */
export const nsComponentManifest: Record<string, string> = {
  // Existing (fully styled) components
  QAvatar: 'NsAvatar',
  QBanner: 'NsBanner',
  QBtn: 'NsButton',
  QCard: 'NsCard',
  QCheckbox: 'NsCheckbox',
  QChip: 'NsChip',
  QDialog: 'NsDialog',
  QForm: 'NsForm',
  QInput: 'NsInput',
  QList: 'NsList',
  QRadio: 'NsRadio',
  QOptionGroup: 'NsRadioButtons',
  QSelect: 'NsSelect',
  QSkeleton: 'NsSkeleton',
  QToggle: 'NsToggle',
  QTooltip: 'NsTooltip',

  // Placeholder wrapper components
  QBadge: 'NsBadge',
  QDrawer: 'NsDrawer',
  QExpansionItem: 'NsExpansionItem',
  QBreadcrumbs: 'NsBreadcrumbs',
  QBreadcrumbsEl: 'NsBreadcrumbElement',
  QBtnToggle: 'NsButtonToggle',
  QCardActions: 'NsCardActions',
  QCardSection: 'NsCardSection',
  QFooter: 'NsFooter',
  QHeader: 'NsHeader',
  QIcon: 'NsIcon',
  QImg: 'NsImage',
  QInnerLoading: 'NsInnerLoading',
  QItem: 'NsItem',
  QItemLabel: 'NsItemLabel',
  QItemSection: 'NsItemSection',
  QLayout: 'NsLayout',
  QLinearProgress: 'NsLinearProgress',
  QMenu: 'NsMenu',
  QPage: 'NsPage',
  QPageContainer: 'NsPageContainer',
  QPagination: 'NsPagination',
  QSeparator: 'NsSeparator',
  QSpace: 'NsSpace',
  QSpinner: 'NsSpinner',
  QSpinnerDots: 'NsSpinnerDots',
  QTab: 'NsTab',
  QTable: 'NsTable',
  QTabPanel: 'NsTabPanel',
  QTabPanels: 'NsTabPanels',
  QTabs: 'NsTabs',
  QTd: 'NsTableCell',
  QTimeline: 'NsTimeline',
  QTimelineEntry: 'NsTimelineEntry',
  QToolbar: 'NsToolbar',
  QToolbarTitle: 'NsToolbarTitle',
} as const

/**
 * Quasar kebab-case tag → Ns kebab-case tag.
 * Useful for template-level ESLint rules (vue/no-restricted-html-elements).
 */
export const nsTemplateTagManifest: Record<string, string> = Object.fromEntries(
  Object.entries(nsComponentManifest).map(([q, ns]) => [
    q
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, ''),
    ns
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, ''),
  ]),
)

/**
 * Generate an ESLint `vue/no-restricted-html-elements` rule config
 * that bans raw Quasar tags when an Ns wrapper exists.
 *
 * Usage in consuming app's eslint.config.js:
 *   import { generateQuasarBanRules } from '@nonsuch/components/manifest'
 *   rules: { 'vue/no-restricted-html-elements': ['error', ...generateQuasarBanRules()] }
 */
export function generateQuasarBanRules(): Array<{ element: string; message: string }> {
  return Object.entries(nsTemplateTagManifest).map(([quasarTag, nsTag]) => ({
    element: quasarTag,
    message: `Use <${nsTag}> from @nonsuch/components instead of <${quasarTag}>.`,
  }))
}

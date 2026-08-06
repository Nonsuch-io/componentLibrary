/**
 * Global component type augmentation for `@nonsuch/component-library`.
 *
 * OPT-IN, imported from a dedicated subpath (`@nonsuch/component-library/global`)
 * rather than shipped automatically from the package root. Reasoning:
 * `createNonsuch()` registers every Ns* component globally at RUNTIME by
 * default (see plugin.ts) — but a consumer who imports individual
 * components directly and never installs the plugin should not have
 * TypeScript silently claim `<ns-banner>` resolves anywhere in their app.
 * That would turn a loud dev-time "Failed to resolve component" warning
 * into a type-approved lie, which is the exact bug this file exists to
 * prevent (see componentLibrary-wer).
 *
 * NOTE ON FILE EXTENSION: this is a `.ts` file, not a `.d.ts` file, even
 * though its only content is a type augmentation. Hand-written `.d.ts`
 * sources are treated by `tsc`/`vue-tsc` as already-compiled output — with
 * `emitDeclarationOnly`, they are NOT copied into `declarationDir`, so a
 * `.d.ts` source here would type-check locally but silently vanish from
 * `dist/` (the exact "nk3" failure mode: a guard/type that never reaches
 * the published package). Naming it `.ts` makes `vue-tsc` emit it as
 * `dist/global-components.d.ts`, which is what `package.json`'s `./global`
 * export path points at. See plugin.dist.test.ts, which asserts against
 * the built `dist/` output for this reason.
 *
 * Usage, once for the whole app, ONLY in a consumer that calls
 * `createNonsuch()`:
 *
 * ```ts
 * import type {} from '@nonsuch/component-library/global'
 * ```
 *
 * GENERATED FROM src/index.ts — every `export { default as Ns* }` there has
 * a matching declaration here. src/plugin.registry.test.ts fails if the two
 * drift apart in either direction (an export with no declaration here, or a
 * declaration here with no matching export). If a component is added to or
 * removed from index.ts, regenerate this file's import/declaration pairs
 * from index.ts's `export { default as Ns* } from '...'` lines.
 */

import type NsButton from './components/NsButton/NsButton.vue'
import type NsNavSidebar from './components/NsNavSidebar/NsNavSidebar.vue'
import type NsBottomNav from './components/NsBottomNav/NsBottomNav.vue'
import type NsSkeleton from './components/NsSkeleton/NsSkeleton.vue'
import type NsThemeProvider from './components/NsThemeProvider/NsThemeProvider.vue'
import type NsInput from './components/NsInput/NsInput.vue'
import type NsCard from './components/NsCard/NsCard.vue'
import type NsSelect from './components/NsSelect/NsSelect.vue'
import type NsCheckbox from './components/NsCheckbox/NsCheckbox.vue'
import type NsToggle from './components/NsToggle/NsToggle.vue'
import type NsForm from './components/NsForm/NsForm.vue'
import type NsDialog from './components/NsDialog/NsDialog.vue'
import type NsDrawer from './components/NsDrawer/NsDrawer.vue'
import type NsExpansionItem from './components/NsExpansionItem/NsExpansionItem.vue'
import type NsBanner from './components/NsBanner/NsBanner.vue'
import type NsAvatar from './components/NsAvatar/NsAvatar.vue'
import type NsChip from './components/NsChip/NsChip.vue'
import type NsList from './components/NsList/NsList.vue'
import type NsTooltip from './components/NsTooltip/NsTooltip.vue'
import type NsBadge from './components/NsBadge/NsBadge.vue'
import type NsBreadcrumbs from './components/NsBreadcrumbs/NsBreadcrumbs.vue'
import type NsBreadcrumbElement from './components/NsBreadcrumbElement/NsBreadcrumbElement.vue'
import type NsButtonToggle from './components/NsButtonToggle/NsButtonToggle.vue'
import type NsCardActions from './components/NsCardActions/NsCardActions.vue'
import type NsCardSection from './components/NsCardSection/NsCardSection.vue'
import type NsFooter from './components/NsFooter/NsFooter.vue'
import type NsHeader from './components/NsHeader/NsHeader.vue'
import type NsIcon from './components/NsIcon/NsIcon.vue'
import type NsImage from './components/NsImage/NsImage.vue'
import type NsInnerLoading from './components/NsInnerLoading/NsInnerLoading.vue'
import type NsItem from './components/NsItem/NsItem.vue'
import type NsItemLabel from './components/NsItemLabel/NsItemLabel.vue'
import type NsItemSection from './components/NsItemSection/NsItemSection.vue'
import type NsLayout from './components/NsLayout/NsLayout.vue'
import type NsLinearProgress from './components/NsLinearProgress/NsLinearProgress.vue'
import type NsMenu from './components/NsMenu/NsMenu.vue'
import type NsPage from './components/NsPage/NsPage.vue'
import type NsPageContainer from './components/NsPageContainer/NsPageContainer.vue'
import type NsPagination from './components/NsPagination/NsPagination.vue'
import type NsSeparator from './components/NsSeparator/NsSeparator.vue'
import type NsSpace from './components/NsSpace/NsSpace.vue'
import type NsSpinner from './components/NsSpinner/NsSpinner.vue'
import type NsSpinnerDots from './components/NsSpinnerDots/NsSpinnerDots.vue'
import type NsTab from './components/NsTab/NsTab.vue'
import type NsTable from './components/NsTable/NsTable.vue'
import type NsTableCell from './components/NsTableCell/NsTableCell.vue'
import type NsTabPanel from './components/NsTabPanel/NsTabPanel.vue'
import type NsTabPanels from './components/NsTabPanels/NsTabPanels.vue'
import type NsTabs from './components/NsTabs/NsTabs.vue'
import type NsTimeline from './components/NsTimeline/NsTimeline.vue'
import type NsTimelineEntry from './components/NsTimelineEntry/NsTimelineEntry.vue'
import type NsToolbar from './components/NsToolbar/NsToolbar.vue'
import type NsToolbarTitle from './components/NsToolbarTitle/NsToolbarTitle.vue'
import type NsAboutSection from './components/NsAboutSection/NsAboutSection.vue'
import type NsEyebrowTag from './components/NsEyebrowTag/NsEyebrowTag.vue'
import type NsExpectSection from './components/NsExpectSection/NsExpectSection.vue'
import type NsHighlightSpan from './components/NsHighlightSpan/NsHighlightSpan.vue'
import type NsHero from './components/NsHero/NsHero.vue'
import type NsNumberTile from './components/NsNumberTile/NsNumberTile.vue'
import type NsSectionEyebrow from './components/NsSectionEyebrow/NsSectionEyebrow.vue'
import type NsSiteFooter from './components/NsSiteFooter/NsSiteFooter.vue'
import type NsSiteHeader from './components/NsSiteHeader/NsSiteHeader.vue'
import type NsStepList from './components/NsStepList/NsStepList.vue'
import type NsStepRow from './components/NsStepRow/NsStepRow.vue'
import type NsTrustBar from './components/NsTrustBar/NsTrustBar.vue'
import type NsMarketingEmailCapture from './components/NsMarketingEmailCapture/NsMarketingEmailCapture.vue'
import type NsAppShell from './components/NsAppShell/NsAppShell.vue'
import type NsAuthLayout from './components/NsAuthLayout/NsAuthLayout.vue'
import type NsLandingLayout from './components/NsLandingLayout/NsLandingLayout.vue'
import type NsDashboardGrid from './components/NsDashboardGrid/NsDashboardGrid.vue'

declare module 'vue' {
  interface GlobalComponents {
    NsButton: typeof NsButton
    NsNavSidebar: typeof NsNavSidebar
    NsBottomNav: typeof NsBottomNav
    NsSkeleton: typeof NsSkeleton
    NsThemeProvider: typeof NsThemeProvider
    NsInput: typeof NsInput
    NsCard: typeof NsCard
    NsSelect: typeof NsSelect
    NsCheckbox: typeof NsCheckbox
    NsToggle: typeof NsToggle
    NsForm: typeof NsForm
    NsDialog: typeof NsDialog
    NsDrawer: typeof NsDrawer
    NsExpansionItem: typeof NsExpansionItem
    NsBanner: typeof NsBanner
    NsAvatar: typeof NsAvatar
    NsChip: typeof NsChip
    NsList: typeof NsList
    NsTooltip: typeof NsTooltip
    NsBadge: typeof NsBadge
    NsBreadcrumbs: typeof NsBreadcrumbs
    NsBreadcrumbElement: typeof NsBreadcrumbElement
    NsButtonToggle: typeof NsButtonToggle
    NsCardActions: typeof NsCardActions
    NsCardSection: typeof NsCardSection
    NsFooter: typeof NsFooter
    NsHeader: typeof NsHeader
    NsIcon: typeof NsIcon
    NsImage: typeof NsImage
    NsInnerLoading: typeof NsInnerLoading
    NsItem: typeof NsItem
    NsItemLabel: typeof NsItemLabel
    NsItemSection: typeof NsItemSection
    NsLayout: typeof NsLayout
    NsLinearProgress: typeof NsLinearProgress
    NsMenu: typeof NsMenu
    NsPage: typeof NsPage
    NsPageContainer: typeof NsPageContainer
    NsPagination: typeof NsPagination
    NsSeparator: typeof NsSeparator
    NsSpace: typeof NsSpace
    NsSpinner: typeof NsSpinner
    NsSpinnerDots: typeof NsSpinnerDots
    NsTab: typeof NsTab
    NsTable: typeof NsTable
    NsTableCell: typeof NsTableCell
    NsTabPanel: typeof NsTabPanel
    NsTabPanels: typeof NsTabPanels
    NsTabs: typeof NsTabs
    NsTimeline: typeof NsTimeline
    NsTimelineEntry: typeof NsTimelineEntry
    NsToolbar: typeof NsToolbar
    NsToolbarTitle: typeof NsToolbarTitle
    NsAboutSection: typeof NsAboutSection
    NsEyebrowTag: typeof NsEyebrowTag
    NsExpectSection: typeof NsExpectSection
    NsHighlightSpan: typeof NsHighlightSpan
    NsHero: typeof NsHero
    NsNumberTile: typeof NsNumberTile
    NsSectionEyebrow: typeof NsSectionEyebrow
    NsSiteFooter: typeof NsSiteFooter
    NsSiteHeader: typeof NsSiteHeader
    NsStepList: typeof NsStepList
    NsStepRow: typeof NsStepRow
    NsTrustBar: typeof NsTrustBar
    NsMarketingEmailCapture: typeof NsMarketingEmailCapture
    NsAppShell: typeof NsAppShell
    NsAuthLayout: typeof NsAuthLayout
    NsLandingLayout: typeof NsLandingLayout
    NsDashboardGrid: typeof NsDashboardGrid
  }
}

export {}

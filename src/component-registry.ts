import type { Component } from 'vue'

import NsButton from './components/NsButton/NsButton.vue'
import NsNavSidebar from './components/NsNavSidebar/NsNavSidebar.vue'
import NsBottomNav from './components/NsBottomNav/NsBottomNav.vue'
import NsSkeleton from './components/NsSkeleton/NsSkeleton.vue'
import NsThemeProvider from './components/NsThemeProvider/NsThemeProvider.vue'
import NsInput from './components/NsInput/NsInput.vue'
import NsCard from './components/NsCard/NsCard.vue'
import NsSelect from './components/NsSelect/NsSelect.vue'
import NsCheckbox from './components/NsCheckbox/NsCheckbox.vue'
import NsToggle from './components/NsToggle/NsToggle.vue'
import NsForm from './components/NsForm/NsForm.vue'
import NsDialog from './components/NsDialog/NsDialog.vue'
import NsDrawer from './components/NsDrawer/NsDrawer.vue'
import NsExpansionItem from './components/NsExpansionItem/NsExpansionItem.vue'
import NsBanner from './components/NsBanner/NsBanner.vue'
import NsAvatar from './components/NsAvatar/NsAvatar.vue'
import NsChip from './components/NsChip/NsChip.vue'
import NsList from './components/NsList/NsList.vue'
import NsTooltip from './components/NsTooltip/NsTooltip.vue'
import NsBadge from './components/NsBadge/NsBadge.vue'
import NsBreadcrumbs from './components/NsBreadcrumbs/NsBreadcrumbs.vue'
import NsBreadcrumbElement from './components/NsBreadcrumbElement/NsBreadcrumbElement.vue'
import NsButtonToggle from './components/NsButtonToggle/NsButtonToggle.vue'
import NsCardActions from './components/NsCardActions/NsCardActions.vue'
import NsCardSection from './components/NsCardSection/NsCardSection.vue'
import NsFooter from './components/NsFooter/NsFooter.vue'
import NsHeader from './components/NsHeader/NsHeader.vue'
import NsIcon from './components/NsIcon/NsIcon.vue'
import NsImage from './components/NsImage/NsImage.vue'
import NsInnerLoading from './components/NsInnerLoading/NsInnerLoading.vue'
import NsItem from './components/NsItem/NsItem.vue'
import NsItemLabel from './components/NsItemLabel/NsItemLabel.vue'
import NsItemSection from './components/NsItemSection/NsItemSection.vue'
import NsLayout from './components/NsLayout/NsLayout.vue'
import NsLinearProgress from './components/NsLinearProgress/NsLinearProgress.vue'
import NsMenu from './components/NsMenu/NsMenu.vue'
import NsPage from './components/NsPage/NsPage.vue'
import NsPageContainer from './components/NsPageContainer/NsPageContainer.vue'
import NsPagination from './components/NsPagination/NsPagination.vue'
import NsSeparator from './components/NsSeparator/NsSeparator.vue'
import NsSpace from './components/NsSpace/NsSpace.vue'
import NsSpinner from './components/NsSpinner/NsSpinner.vue'
import NsSpinnerDots from './components/NsSpinnerDots/NsSpinnerDots.vue'
import NsTab from './components/NsTab/NsTab.vue'
import NsTable from './components/NsTable/NsTable.vue'
import NsTableCell from './components/NsTableCell/NsTableCell.vue'
import NsTabPanel from './components/NsTabPanel/NsTabPanel.vue'
import NsTabPanels from './components/NsTabPanels/NsTabPanels.vue'
import NsTabs from './components/NsTabs/NsTabs.vue'
import NsTimeline from './components/NsTimeline/NsTimeline.vue'
import NsTimelineEntry from './components/NsTimelineEntry/NsTimelineEntry.vue'
import NsToolbar from './components/NsToolbar/NsToolbar.vue'
import NsToolbarTitle from './components/NsToolbarTitle/NsToolbarTitle.vue'
import NsAboutSection from './components/NsAboutSection/NsAboutSection.vue'
import NsEyebrowTag from './components/NsEyebrowTag/NsEyebrowTag.vue'
import NsExpectSection from './components/NsExpectSection/NsExpectSection.vue'
import NsHighlightSpan from './components/NsHighlightSpan/NsHighlightSpan.vue'
import NsHero from './components/NsHero/NsHero.vue'
import NsNumberTile from './components/NsNumberTile/NsNumberTile.vue'
import NsSectionEyebrow from './components/NsSectionEyebrow/NsSectionEyebrow.vue'
import NsSiteFooter from './components/NsSiteFooter/NsSiteFooter.vue'
import NsSiteHeader from './components/NsSiteHeader/NsSiteHeader.vue'
import NsStepList from './components/NsStepList/NsStepList.vue'
import NsStepRow from './components/NsStepRow/NsStepRow.vue'
import NsTrustBar from './components/NsTrustBar/NsTrustBar.vue'
import NsMarketingEmailCapture from './components/NsMarketingEmailCapture/NsMarketingEmailCapture.vue'
import NsAppShell from './components/NsAppShell/NsAppShell.vue'
import NsAuthLayout from './components/NsAuthLayout/NsAuthLayout.vue'
import NsLandingLayout from './components/NsLandingLayout/NsLandingLayout.vue'
import NsDashboardGrid from './components/NsDashboardGrid/NsDashboardGrid.vue'

/**
 * Every Ns* component index.ts exports, keyed by its PascalCase export name.
 *
 * THIS LIVES IN ITS OWN MODULE SO THE COST FOLLOWS THE IMPORT, not a boolean.
 * It previously sat in plugin.ts behind a `registerComponents` flag, which was
 * illusory: the 70 imports are static, so ANY consumer calling createNonsuch()
 * paid for all of them whatever the flag said. Measured — importing only
 * `createNonsuch` went from trivial to 17.5 kB gzipped, essentially the whole
 * library, for every consumer on upgrade. butiq-agent asked for opt-in on
 * exactly that ground and was right; a flag could not deliver it.
 *
 * Now a consumer opts in by IMPORTING this, which their bundler can see:
 *
 *   import { createNonsuch, nsComponentRegistry } from '@nonsuch/component-library'
 *   import type {} from '@nonsuch/component-library/global'
 *   app.use(createNonsuch({ components: nsComponentRegistry }))
 *
 * Pair it with the `/global` types subpath. Registering without the types
 * loses the typecheck; the types without registering is a lie — the failure
 * componentLibrary-wer exists to remove.
 *
 * A plain object literal of static imports, deliberately NOT reflected over
 * index.ts's namespace at runtime: that creates an import cycle and defeats
 * tree-shaking down to a single component (it broke the size-limit guard when
 * tried). Drift from index.ts is guarded by plugin.registry.test.ts instead.
 */
export const nsComponentRegistry: Readonly<Record<string, Component>> = {
  NsButton,
  NsNavSidebar,
  NsBottomNav,
  NsSkeleton,
  NsThemeProvider,
  NsInput,
  NsCard,
  NsSelect,
  NsCheckbox,
  NsToggle,
  NsForm,
  NsDialog,
  NsDrawer,
  NsExpansionItem,
  NsBanner,
  NsAvatar,
  NsChip,
  NsList,
  NsTooltip,
  NsBadge,
  NsBreadcrumbs,
  NsBreadcrumbElement,
  NsButtonToggle,
  NsCardActions,
  NsCardSection,
  NsFooter,
  NsHeader,
  NsIcon,
  NsImage,
  NsInnerLoading,
  NsItem,
  NsItemLabel,
  NsItemSection,
  NsLayout,
  NsLinearProgress,
  NsMenu,
  NsPage,
  NsPageContainer,
  NsPagination,
  NsSeparator,
  NsSpace,
  NsSpinner,
  NsSpinnerDots,
  NsTab,
  NsTable,
  NsTableCell,
  NsTabPanel,
  NsTabPanels,
  NsTabs,
  NsTimeline,
  NsTimelineEntry,
  NsToolbar,
  NsToolbarTitle,
  NsAboutSection,
  NsEyebrowTag,
  NsExpectSection,
  NsHighlightSpan,
  NsHero,
  NsNumberTile,
  NsSectionEyebrow,
  NsSiteFooter,
  NsSiteHeader,
  NsStepList,
  NsStepRow,
  NsTrustBar,
  NsMarketingEmailCapture,
  NsAppShell,
  NsAuthLayout,
  NsLandingLayout,
  NsDashboardGrid,
}

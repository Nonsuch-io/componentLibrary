<template>
  <NsLayout class="ns-app-shell" view="hHh lpR fFf">
    <!-- Header -->
    <NsHeader class="ns-app-shell__header" elevated>
      <NsToolbar>
        <!-- Hamburger button: visible on mobile when drawer is off-canvas -->
        <NsButton
          v-if="!isDesktop"
          flat
          round
          dense
          :aria-label="drawerOpen ? 'Close menu' : 'Open menu'"
          class="ns-app-shell__menu-btn"
          @click="toggleDrawer"
        >
          <NsIcon name="menu" />
        </NsButton>

        <slot name="header-left" />

        <NsToolbarTitle />

        <!-- Search: icon-only on mobile, inline on desktop -->
        <template v-if="showSearch">
          <div v-if="isDesktop" class="ns-app-shell__search-inline">
            <NsInput
              v-model="searchQuery"
              dense
              outlined
              placeholder="Search…"
              class="ns-app-shell__search-input"
              @keyup.enter="emitSearch"
            >
              <template #prepend>
                <NsIcon name="search" />
              </template>
            </NsInput>
          </div>
          <NsButton
            v-else
            flat
            round
            dense
            aria-label="Search"
            class="ns-app-shell__search-btn"
            @click="searchExpanded = !searchExpanded"
          >
            <NsIcon name="search" />
          </NsButton>
        </template>

        <slot name="header-actions" />
      </NsToolbar>

      <!-- Expanded mobile search bar -->
      <NsToolbar v-if="showSearch && searchExpanded && !isDesktop" class="ns-app-shell__search-bar">
        <NsInput
          v-model="searchQuery"
          dense
          outlined
          placeholder="Search…"
          class="full-width"
          @keyup.enter="emitSearch"
        >
          <template #prepend>
            <NsIcon name="search" />
          </template>
          <template #append>
            <NsButton flat round dense aria-label="Close search" @click="searchExpanded = false">
              <NsIcon name="close" />
            </NsButton>
          </template>
        </NsInput>
      </NsToolbar>
    </NsHeader>

    <!-- Side drawer -->
    <NsDrawer
      v-model="drawerOpen"
      :breakpoint="drawerBreakpoint"
      :mini="shouldUseMini"
      bordered
      class="ns-app-shell__drawer"
      :behavior="isDesktop ? 'desktop' : 'mobile'"
      side="left"
      @update:model-value="onDrawerToggle"
    >
      <!-- Collapsible toggle at top of drawer -->
      <NsItem
        v-if="collapsible && isDesktop"
        clickable
        class="ns-app-shell__collapse-toggle"
        @click="toggleCollapse"
      >
        <NsItemSection avatar>
          <NsIcon :name="shouldUseMini ? 'menu' : 'chevron_left'" />
        </NsItemSection>
        <NsItemSection>
          <NsItemLabel>Hide Menu</NsItemLabel>
        </NsItemSection>
      </NsItem>

      <slot name="drawer-header" :mini="shouldUseMini" />

      <NsList v-if="drawerItems.length > 0">
        <template v-for="item in drawerItems" :key="item.name">
          <NsSeparator v-if="item.separator" />
          <NsItem :to="item.to" :active="item.active" clickable class="ns-app-shell__nav-item">
            <NsItemSection v-if="item.icon" avatar>
              <NsIcon :name="item.icon" />
            </NsItemSection>
            <NsItemSection>
              <NsItemLabel>{{ item.label }}</NsItemLabel>
            </NsItemSection>
            <NsItemSection v-if="item.children && item.children.length > 0" side>
              <NsIcon name="chevron_right" size="sm" />
            </NsItemSection>
          </NsItem>
        </template>
      </NsList>

      <slot name="drawer-footer" />
    </NsDrawer>

    <!-- Main content -->
    <NsPageContainer>
      <NsPage :class="{ 'ns-app-shell__page--has-bottom-bar': !isDesktop && tabs.length > 0 }">
        <slot />
      </NsPage>
    </NsPageContainer>

    <!-- Bottom tab bar (mobile only) -->
    <NsFooter v-if="!isDesktop && tabs.length > 0" elevated class="ns-app-shell__bottom-bar">
      <slot name="bottom-bar-above" />
      <NsTabs
        :model-value="activeTab"
        dense
        narrow-indicator
        class="ns-app-shell__bottom-tabs"
        @update:model-value="onTabChange"
      >
        <NsTab
          v-for="tab in tabs"
          :key="tab.name"
          :name="tab.name"
          :icon="tab.icon"
          :label="tab.label"
          class="ns-app-shell__bottom-tab"
        />
      </NsTabs>
    </NsFooter>
  </NsLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import type { NsAppShellTab, NsAppShellNavItem } from './types'
import NsLayout from '../NsLayout/NsLayout.vue'
import NsHeader from '../NsHeader/NsHeader.vue'
import NsToolbar from '../NsToolbar/NsToolbar.vue'
import NsToolbarTitle from '../NsToolbarTitle/NsToolbarTitle.vue'
import NsDrawer from '../NsDrawer/NsDrawer.vue'
import NsPageContainer from '../NsPageContainer/NsPageContainer.vue'
import NsPage from '../NsPage/NsPage.vue'
import NsFooter from '../NsFooter/NsFooter.vue'
import NsTabs from '../NsTabs/NsTabs.vue'
import NsTab from '../NsTab/NsTab.vue'
import NsIcon from '../NsIcon/NsIcon.vue'
import NsButton from '../NsButton/NsButton.vue'
import NsInput from '../NsInput/NsInput.vue'
import NsList from '../NsList/NsList.vue'
import NsItem from '../NsItem/NsItem.vue'
import NsItemSection from '../NsItemSection/NsItemSection.vue'
import NsItemLabel from '../NsItemLabel/NsItemLabel.vue'
import NsSeparator from '../NsSeparator/NsSeparator.vue'
import { nsBreakpoints } from '../../breakpoints'

/**
 * NsAppShell — Primary responsive app layout template.
 *
 * Handles the mobile → tablet → desktop layout transition:
 * - Mobile (xs/sm): Bottom tab bar for primary nav, hamburger opens drawer
 * - Tablet (md): Persistent mini/rail drawer (icons only), no bottom tab bar
 * - Desktop (lg+): Full persistent drawer with labels, no bottom tab bar
 *
 * Composes NsLayout, NsHeader, NsToolbar, NsDrawer, NsPageContainer,
 * NsTabs, NsTab, NsIcon, NsButton, NsFooter, and more.
 */
export interface NsAppShellProps {
  /** Tab items for mobile bottom navigation bar */
  tabs?: NsAppShellTab[]
  /** Navigation items for the side drawer */
  drawerItems?: NsAppShellNavItem[]
  /** Whether to show the search action */
  showSearch?: boolean
  /** Use mini (rail) mode for the side drawer on desktop (lg+). At tablet (md–lg) mini mode is automatic. */
  miniDrawer?: boolean
  /** Pixel breakpoint for persistent drawer (default: md = 1024) */
  drawerBreakpoint?: number
  /** Pixel breakpoint for full (non-mini) drawer (default: lg = 1440) */
  fullDrawerBreakpoint?: number
  /** Show a collapse/expand toggle at the top of the drawer */
  collapsible?: boolean
  /** Currently active tab name */
  modelValue?: string
}

const props = withDefaults(defineProps<NsAppShellProps>(), {
  tabs: () => [],
  drawerItems: () => [],
  showSearch: false,
  miniDrawer: false,
  drawerBreakpoint: () => nsBreakpoints.md,
  fullDrawerBreakpoint: () => nsBreakpoints.lg,
  collapsible: true,
  modelValue: undefined,
})

const emit = defineEmits<{
  search: [query: string]
  'tab-change': [name: string | number]
  'drawer-toggle': [open: boolean]
  'drawer-collapse': [collapsed: boolean]
  'update:modelValue': [name: string]
}>()

const $q = useQuasar()

/** True when viewport is at/above the drawer breakpoint */
const isDesktop = computed(() => $q.screen.width >= props.drawerBreakpoint)

/** True when viewport is in the tablet range (md–lg) — mini drawer auto-enabled */
const isTablet = computed(
  () => $q.screen.width >= props.drawerBreakpoint && $q.screen.width < props.fullDrawerBreakpoint,
)

/** User-toggled collapse state */
const isCollapsed = ref(false)

/** Mini mode: auto-enabled at tablet range, when collapsed, or when explicitly set via miniDrawer prop */
const shouldUseMini = computed(
  () => isDesktop.value && (isTablet.value || props.miniDrawer || isCollapsed.value),
)

const drawerOpen = ref(isDesktop.value)
const searchExpanded = ref(false)
const searchQuery = ref('')
const activeTab = ref(props.modelValue ?? (props.tabs[0]?.name || ''))

// Auto-open drawer when entering desktop, close when leaving
watch(isDesktop, (desktop) => {
  drawerOpen.value = desktop
})

function toggleDrawer() {
  drawerOpen.value = !drawerOpen.value
}

function onDrawerToggle(val: boolean) {
  emit('drawer-toggle', val)
}

function onTabChange(val: string | number) {
  activeTab.value = String(val)
  emit('tab-change', val)
  emit('update:modelValue', String(val))
}

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
  emit('drawer-collapse', isCollapsed.value)
}

function emitSearch() {
  emit('search', searchQuery.value)
}
</script>

<style lang="sass" scoped>
.ns-app-shell__menu-btn,
.ns-app-shell__search-btn
  min-width: var(--ns-touch-target)
  min-height: var(--ns-touch-target)

.ns-app-shell__search-inline
  min-width: 200px
  max-width: 320px

.ns-app-shell__search-input
  width: 100%

.ns-app-shell__drawer
  // Prevent content overflow when drawer is in mini/rail mode
  overflow: hidden

.ns-app-shell__collapse-toggle
  min-height: var(--ns-touch-target)

.ns-app-shell__nav-item
  min-height: var(--ns-touch-target)

.ns-app-shell__bottom-bar
  // Handle iOS safe area
  padding-bottom: env(safe-area-inset-bottom, 0px)

.ns-app-shell__bottom-tabs
  // Even flex distribution — all tabs share width equally
  :deep(.q-tabs__content)
    justify-content: space-around

.ns-app-shell__bottom-tab
  min-height: 56px
  min-width: var(--ns-touch-target)
  // Distribute tabs evenly across viewport width
  flex: 1 1 0
  max-width: 20%
  // Truncate long labels with ellipsis
  :deep(.q-tab__label)
    overflow: hidden
    text-overflow: ellipsis
    white-space: nowrap
    max-width: 100%

.ns-app-shell__page--has-bottom-bar
  // Extra padding at the bottom so content isn't hidden behind the tab bar
  padding-bottom: calc(56px + env(safe-area-inset-bottom, 0px))
</style>

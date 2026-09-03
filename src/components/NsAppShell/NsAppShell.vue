<template>
  <NsLayout class="ns-app-shell" view="hHh LpR fFf">
    <!-- Header -->
    <NsHeader class="ns-app-shell__header" elevated>
      <NsToolbar>
        <!-- Hamburger button: visible on mobile when drawer is off-canvas -->
        <NsButton
          v-if="!isDesktop"
          flat
          round
          dense
          :aria-label="drawerOpen ? locale.navigation.closeMenu : locale.navigation.openMenu"
          class="ns-app-shell__menu-btn"
          @click="toggleDrawer"
        >
          <PhList :size="ICON_SIZE_BUTTON" weight="regular" />
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
                <PhMagnifyingGlass :size="ICON_SIZE_INLINE" weight="regular" />
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
            <PhMagnifyingGlass :size="ICON_SIZE_BUTTON" weight="regular" />
          </NsButton>
        </template>

        <slot name="header-actions" />

        <!-- User avatar with dropdown menu -->
        <NsButton
          v-if="userInitials"
          flat
          round
          dense
          aria-label="User menu"
          class="ns-app-shell__user-btn"
        >
          <NsAvatar size="sm" color="primary" text-color="white" :aria-label="userName">
            {{ userInitials }}
          </NsAvatar>
          <NsMenu>
            <NsList>
              <NsItem v-if="userName" class="ns-app-shell__user-info">
                <NsItemSection>
                  <NsItemLabel>{{ userName }}</NsItemLabel>
                </NsItemSection>
              </NsItem>
              <NsSeparator v-if="userName && userMenuItems.length > 0" />
              <template v-for="item in userMenuItems" :key="item.name">
                <NsSeparator v-if="item.separator" />
                <NsItem
                  clickable
                  class="ns-app-shell__user-menu-item"
                  @click="onUserMenuAction(item.name)"
                >
                  <NsItemSection v-if="item.icon" avatar>
                    <NsIcon v-if="typeof item.icon === 'string'" :name="item.icon" size="20px" />
                    <component :is="item.icon" v-else :size="ICON_SIZE_INLINE" weight="regular" />
                  </NsItemSection>
                  <NsItemSection>
                    <NsItemLabel>{{ item.label }}</NsItemLabel>
                  </NsItemSection>
                </NsItem>
              </template>
            </NsList>
          </NsMenu>
        </NsButton>
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
            <PhMagnifyingGlass :size="ICON_SIZE_INLINE" weight="regular" />
          </template>
          <template #append>
            <NsButton flat round dense aria-label="Close search" @click="searchExpanded = false">
              <PhX :size="ICON_SIZE_BUTTON" weight="regular" />
            </NsButton>
          </template>
        </NsInput>
      </NsToolbar>
    </NsHeader>

    <!-- Side drawer.
         width / mini-width are sized to match NsNavSidebar's container
         widths (166 expanded / 76 mini) plus 2px to clear the bordered
         1px right border without clipping the pill ovals. -->
    <NsDrawer
      v-model="drawerOpen"
      :breakpoint="drawerBreakpoint"
      :mini="shouldUseMini"
      :width="168"
      :mini-width="78"
      bordered
      class="ns-app-shell__drawer"
      :behavior="isDesktop ? 'desktop' : 'mobile'"
      side="left"
      @update:model-value="onDrawerToggle"
    >
      <slot name="drawer-header" :mini="shouldUseMini" />

      <NsNavSidebar
        v-if="drawerItems.length > 0"
        :model-value="activeNavId"
        :items="mappedDrawerItems"
        :expanded="!shouldUseMini"
        :show-toggle="collapsible && isDesktop"
        class="ns-app-shell__nav-sidebar"
        @update:expanded="onNavExpandedChange"
      />

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
import { useNsLocale } from '../../composables/useNsLocale'
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { PhList, PhMagnifyingGlass, PhX } from '@phosphor-icons/vue'

// 24px for standalone button icons, 20px for icons inside input slots / menus
const ICON_SIZE_BUTTON = 24
const ICON_SIZE_INLINE = 20
import type { NsAppShellTab, NsAppShellNavItem, NsAppShellUserMenuItem } from './types'
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
import NsAvatar from '../NsAvatar/NsAvatar.vue'
import NsMenu from '../NsMenu/NsMenu.vue'
import NsNavSidebar from '../NsNavSidebar/NsNavSidebar.vue'
import type { NsNavItem } from '../NsNavSidebar/NsNavSidebar.vue'
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
  /**
   * Controlled collapse state for the desktop drawer (`v-model:collapsed`).
   * When provided, the app owns the value — persist it however you like (a
   * cookie for SSR so the server renders the right width with no flash, or
   * localStorage for a SPA) — and the component emits `update:collapsed`.
   * When omitted, the drawer manages its own collapse state internally.
   * Note: `miniDrawer` still force-collapses regardless of this value.
   */
  collapsed?: boolean
  /** Currently active tab name */
  modelValue?: string
  /** User display name shown in the avatar dropdown */
  userName?: string
  /** User initials rendered inside the avatar (e.g. "JD") */
  userInitials?: string
  /** Menu items for the user avatar dropdown */
  userMenuItems?: NsAppShellUserMenuItem[]
}

// The hamburger's accessible name was two hardcoded English literals. It is
// icon-only so there was never a label-in-name mismatch — purely the i18n half,
// the same gap componentLibrary-1ps closed one component over.
//
// Its own key pair rather than reusing the sidebar's: "Hide Menu" is the
// SIDEBAR's visible text and reads oddly as a hamburger's name. Measured cost of
// adopting the locale here is ~10 B, because componentLibrary-1ps already pulled
// the en-CA object into this chunk. Story: componentLibrary-2ke.
const locale = useNsLocale()

const props = withDefaults(defineProps<NsAppShellProps>(), {
  tabs: () => [],
  drawerItems: () => [],
  showSearch: false,
  miniDrawer: false,
  drawerBreakpoint: () => nsBreakpoints.md,
  fullDrawerBreakpoint: () => nsBreakpoints.lg,
  collapsible: true,
  collapsed: undefined,
  modelValue: undefined,
  userName: undefined,
  userInitials: undefined,
  userMenuItems: () => [],
})

const emit = defineEmits<{
  search: [query: string]
  'tab-change': [name: string | number]
  'drawer-toggle': [open: boolean]
  'drawer-collapse': [collapsed: boolean]
  'update:collapsed': [collapsed: boolean]
  'update:modelValue': [name: string]
  'user-menu-action': [name: string]
}>()

const $q = useQuasar()

/** True when viewport is at/above the drawer breakpoint */
const isDesktop = computed(() => $q.screen.width >= props.drawerBreakpoint)

/** True when viewport is in the tablet range (md–lg) — mini drawer auto-enabled */
const isTablet = computed(
  () => $q.screen.width >= props.drawerBreakpoint && $q.screen.width < props.fullDrawerBreakpoint,
)

/**
 * User-toggled collapse state. Controlled when the `collapsed` prop is provided
 * (`v-model:collapsed`), otherwise managed internally — mirroring the
 * controlled/uncontrolled `expanded` pattern in NsNavSidebar.
 */
const internalCollapsed = ref(props.collapsed ?? false)
const isCollapsed = computed({
  get: () => props.collapsed ?? internalCollapsed.value,
  set: (value: boolean) => {
    internalCollapsed.value = value
    emit('update:collapsed', value)
  },
})

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

/**
 * Wired from the NsNavSidebar's animated-eye toggle (replaces the old
 * collapsible chevron). When the sidebar reports its expanded state, we mirror
 * it into the collapse model (which emits `update:collapsed` for
 * `v-model:collapsed`) and keep emitting the legacy `drawer-collapse` event.
 */
function onNavExpandedChange(expanded: boolean) {
  isCollapsed.value = !expanded // emits update:collapsed via the computed setter
  emit('drawer-collapse', !expanded)
}

/**
 * id of the currently-active drawer item, derived from the consumer's
 * `active: true` flag on NsAppShellNavItem. NsNavSidebar's v-model:modelValue
 * is honored via the explicit `active` prop on each NsNavItem (added in
 * sub-task 1), so this is mostly informational — passing the id keeps the
 * v-model contract consistent.
 */
const activeNavId = computed(() => {
  const active = props.drawerItems.find((i) => i.active)
  return active?.name ?? ''
})

/**
 * Map NsAppShellNavItem → NsNavItem so NsNavSidebar can render the same items.
 * Field mapping: name → id, children → sub (objects).
 */
const mappedDrawerItems = computed<NsNavItem[]>(() =>
  props.drawerItems.map((item) => ({
    id: item.name,
    label: item.label,
    icon: item.icon,
    to: item.to,
    active: item.active,
    separator: item.separator,
    sub: item.children?.map((c) => ({
      id: c.name,
      label: c.label,
      to: c.to,
    })),
  })),
)

function emitSearch() {
  emit('search', searchQuery.value)
}

function onUserMenuAction(name: string) {
  emit('user-menu-action', name)
}
</script>

<style lang="sass" scoped>
.ns-app-shell__menu-btn,
.ns-app-shell__search-btn,
.ns-app-shell__user-btn
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

.ns-app-shell__user-menu-item
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

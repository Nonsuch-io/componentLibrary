import type { Component } from 'vue'

/** Represents a tab item for the mobile bottom navigation bar. */
export interface NsAppShellTab {
  /** Unique identifier for the tab */
  name: string
  /** Display label for the tab */
  label: string
  /** Quasar/Material icon name string (Phosphor components not supported here — rendered via q-tab) */
  icon: string
}

/** Represents an item in the user avatar dropdown menu. */
export interface NsAppShellUserMenuItem {
  /** Unique identifier for the menu item (emitted with user-menu-action) */
  name: string
  /** Display label */
  label: string
  /** Phosphor icon component or Material icon name string */
  icon?: string | Component
  /** Separator before this item */
  separator?: boolean
}

/** Represents a navigation item in the side drawer. */
export interface NsAppShellNavItem {
  /** Unique identifier for the nav item */
  name: string
  /** Display label */
  label: string
  /** Phosphor icon component or Material icon name string */
  icon?: string | Component
  /** Route path or URL */
  to?: string
  /** Whether this item is currently active */
  active?: boolean
  /** Nested children (for expandable sections) */
  children?: NsAppShellNavItem[]
  /** Separator before this item */
  separator?: boolean
}

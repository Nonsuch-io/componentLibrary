/** Represents a tab item for the mobile bottom navigation bar. */
export interface NsAppShellTab {
  /** Unique identifier for the tab */
  name: string
  /** Display label for the tab */
  label: string
  /** Material icon name */
  icon: string
}

/** Represents a navigation item in the side drawer. */
export interface NsAppShellNavItem {
  /** Unique identifier for the nav item */
  name: string
  /** Display label */
  label: string
  /** Material icon name */
  icon?: string
  /** Route path or URL */
  to?: string
  /** Whether this item is currently active */
  active?: boolean
  /** Nested children (for expandable sections) */
  children?: NsAppShellNavItem[]
  /** Separator before this item */
  separator?: boolean
}

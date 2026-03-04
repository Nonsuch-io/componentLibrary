# Changelog

All notable changes to `@nonsuch/component-library` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/) and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.8.0] — 2026-03-03

### Added

- **NsAppShell** — primary responsive app layout template
  - Mobile (xs/sm): bottom tab bar for primary nav, hamburger opens off-canvas drawer
  - Tablet+ (md+): persistent or mini (rail) side drawer, no bottom tab bar
  - Collapsible mobile search bar with inline desktop variant
  - Configurable `drawerBreakpoint`, `miniDrawer`, `showSearch`, `tabs`, `drawerItems` props
  - Named slots: `header-left`, `header-actions`, `drawer-header`, `drawer-footer`, `bottom-bar-above`
- **NsAuthLayout** — centered card layout for login, register, 2FA, and password-reset flows
  - Logo slot, default content slot, and footer slot
  - Responsive card sizing with token-based spacing
- **NsDashboardGrid** — responsive widget grid using Quasar's ascending breakpoint classes
  - Render-function component that wraps each slot child in responsive column divs
  - Configurable `columns` (per-breakpoint) and `gap` props
  - Automatic Fragment flattening and text/comment node filtering
- **`--ns-touch-target` design token** (44 px) — minimum interactive element size for mobile accessibility

### Fixed

- NsAuthLayout: replaced non-existent `--ns-spacing-md`/`--ns-spacing-lg` token references with correct `--ns-space-4`/`--ns-space-6`

## [0.7.2] — 2026-03-01

### Added

- **NsDrawer** — placeholder wrapper for `QDrawer` (side drawer within `NsLayout`)
- **NsExpansionItem** — placeholder wrapper for `QExpansionItem` (collapsible list item)
- Both components added to the component manifest for sync enforcement

## [0.7.1] — 2026-03-01

### Added

- **Breakpoints module** (`breakpoints/`) — Quasar-aligned breakpoint values and media-query helpers
  - `NsBreakpointName` type (`xs` | `sm` | `md` | `lg` | `xl` | `xxl` | `xxxl`)
  - `nsBreakpoints` object with pixel values for each breakpoint
  - `nsBreakpointNames` ordered array
  - `nsMediaUp()`, `nsMediaDown()`, `nsMediaOnly()`, `nsMediaBetween()` helpers returning `matchMedia()`-ready strings
  - Two custom breakpoints beyond Quasar defaults: `xxl` (2560 px / 1440p) and `xxxl` (3840 px / 4K)

## [0.7.0] — 2026-02-28

### Added

- **34 placeholder components** — minimal pass-through wrappers for Quasar components used in Admin and Storefront apps:
  - Layout: `NsLayout`, `NsHeader`, `NsFooter`, `NsPage`, `NsPageContainer`
  - Card sub-components: `NsCardActions`, `NsCardSection`
  - List sub-components: `NsItem`, `NsItemLabel`, `NsItemSection`
  - Tabs: `NsTabs`, `NsTab`, `NsTabPanels`, `NsTabPanel`
  - Table: `NsTable`, `NsTableCell`
  - Navigation: `NsBreadcrumbs`, `NsBreadcrumbElement`, `NsPagination`, `NsMenu`
  - Toolbar: `NsToolbar`, `NsToolbarTitle`
  - Timeline: `NsTimeline`, `NsTimelineEntry`
  - Feedback: `NsBadge`, `NsLinearProgress`, `NsInnerLoading`, `NsSpinner`, `NsSpinnerDots`
  - Standalone: `NsButtonToggle`, `NsIcon`, `NsImage`, `NsSeparator`, `NsSpace`
- **Component manifest** (`manifest.ts`) — maps Quasar component names to their Ns equivalents for sync enforcement
- **Sync enforcement guide** in CONTRIBUTING.md — ESLint rules and CI patterns for ensuring consuming apps use library components instead of raw Quasar
- `createNonsuch()` Vue plugin — single `app.use()` call to set up locale
- `useNsDarkMode()` composable — dark mode toggle with localStorage persistence and OS sync
- `createQuasarConfig()` — maps Nonsuch tokens to Quasar's runtime brand colours
- `NsThemeProvider` renderless wrapper component
- `NsInput` component wrapping QInput with Nonsuch defaults
- `NsCard` component wrapping QCard with token-based styling
- CHANGELOG.md

### Fixed

- `tsconfig.build.json` missing `"composite": true` (required by project references)

## [0.3.0] — 2026-02-11

### Added

- **Design token system** — CSS custom properties (`--ns-*`) for colours, typography, spacing, border-radius, shadows, and motion
- Light and dark mode token sets (`:root.dark`, `[data-theme="dark"]`, `.q-dark`, `prefers-color-scheme`)
- `NsToken` type union and `getToken()` runtime helper
- `./tokens.css` package export for consumer apps
- Storybook Design Tokens page with colour swatches, typography scale, spacing visualization, and dark mode toggle
- Audit process documented in `AGENTS.md`

### Changed

- Migrated hardcoded values in NsButton, NsSkeleton, and `fonts/global.css` to `var(--ns-*)` token references

## [0.2.1] — 2026-02-09

### Added

- **i18n locale system** — `NsLocaleMessages` typed interface, `en-CA` and `fr-CA` locale packs
- `provideNsLocale()` / `useNsLocale()` composable (provide/inject pattern)
- `useNsDefault()` composable — resolves prop → injected locale → built-in default
- **RTL support** — `postcss-rtlcss` for automatic `[dir=rtl]` CSS generation
- RTL Storybook stories with Arabic lang pack
- "Strings & i18n" and "RTL Support" sections in CONTRIBUTING.md

## [0.2.0] — 2026-02-09

### Added

- **Fixel brand font** — `.woff2` files for Fixel Text and Fixel Display (9 weights, both styles)
- `@font-face` declarations in `fonts/fonts.css`
- Global CSS (`fonts/global.css`) applying Fixel to body + headings
- Quasar Sass variable overrides (`fonts/_quasar-overrides.sass`)
- Three font integration options documented in README
- **Loading states** — `loading` prop on NsButton with `QSpinnerDots` default and `#loading` slot
- `NsSkeleton` component wrapping QSkeleton with all types/animations, wave default, rounded corners

## [0.1.0] — 2026-02-08

### Added

- Initial release
- **NsButton** component wrapping QBtn with opinionated defaults (unelevated, no-caps, rounded)
- Vue 3 + Quasar + Vite library mode scaffold
- Storybook 10 for component development
- Vitest unit tests with happy-dom
- ESLint 9 flat config + Prettier
- CI pipeline (GitHub Actions)
- Storybook deployed to GitHub Pages
- npm Trusted Publishing via OIDC
- CONTRIBUTING.md with step-by-step component guide

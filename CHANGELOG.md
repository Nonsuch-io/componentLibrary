# Changelog

All notable changes to `@nonsuch/component-library` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/) and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.28.5](https://github.com/Nonsuch-io/componentLibrary/compare/v0.28.4...v0.28.5) (2026-08-11)


### Bug Fixes

* **banner:** give the subtle fills their own ink — three of four failed AA (2p1) ([a4eb5c9](https://github.com/Nonsuch-io/componentLibrary/commit/a4eb5c9a2b903b924067c82f775de982d259124f))
* **tokens:** make the comment-proof claim true, and check the showcase too ([6e6669a](https://github.com/Nonsuch-io/componentLibrary/commit/6e6669a651093dd785f662bb0caf0522f680b492))
* **tokens:** widen the fallback check — its .vue-only scope had six real misses ([a5c946a](https://github.com/Nonsuch-io/componentLibrary/commit/a5c946aacfc46d5ab274ab7c933eb28fb92686ce))

## [0.28.4](https://github.com/Nonsuch-io/componentLibrary/compare/v0.28.3...v0.28.4) (2026-08-11)


### Reverts

* **test:** un-serialise story files — it fixed nothing (5wn) ([bf9c04c](https://github.com/Nonsuch-io/componentLibrary/commit/bf9c04cfdce7238b15e73301055f42fd871b0869))
* **test:** un-serialise story files — it fixed nothing (5wn) ([c76fa16](https://github.com/Nonsuch-io/componentLibrary/commit/c76fa166bbb29854f2b671cae05328c76fbcbadb))

## [0.28.3](https://github.com/Nonsuch-io/componentLibrary/compare/v0.28.2...v0.28.3) (2026-08-10)


### Bug Fixes

* **test:** run story files serially, which is what the flake was (5wn) ([2e9bf6b](https://github.com/Nonsuch-io/componentLibrary/commit/2e9bf6b31bf48dcd2f317d45d293e1d9d686c8b5))

## [0.28.2](https://github.com/Nonsuch-io/componentLibrary/compare/v0.28.1...v0.28.2) (2026-08-10)


### Bug Fixes

* **badge:** make ghost and neutral actually render (mwe) ([6d71ded](https://github.com/Nonsuch-io/componentLibrary/commit/6d71ded4ac1d0c94e36cdf22baaf9afee5dead58))

## [0.28.1](https://github.com/Nonsuch-io/componentLibrary/compare/v0.28.0...v0.28.1) (2026-08-10)


### Bug Fixes

* **button:** stop advising `iconOnly` for `round`, which is not equivalent ([a097395](https://github.com/Nonsuch-io/componentLibrary/commit/a0973952495f5395533e78298e36353b491cfc49))

## [0.28.0](https://github.com/Nonsuch-io/componentLibrary/compare/v0.27.0...v0.28.0) (2026-08-10)


### ⚠ BREAKING CHANGES

* **banner:** NsBanner's `type` values `success` and `error` are renamed to `positive` and `negative`. Consumers must migrate; the old values now render unstyled and lose their role/aria-live. 30 butiq call sites are affected.

### Bug Fixes

* **banner:** rename type values to the design system's vocabulary (whr) ([9929d2d](https://github.com/Nonsuch-io/componentLibrary/commit/9929d2d969a821d95a62d81cfd2a0af468d95053))

## [0.27.0](https://github.com/Nonsuch-io/componentLibrary/compare/v0.26.1...v0.27.0) (2026-08-10)


### Features

* **plugin:** warn when a consumer never loaded style.css (componentLibrary-07u) ([54d527f](https://github.com/Nonsuch-io/componentLibrary/commit/54d527f045cd4934912b49eca2a6c4c91c15a321))

## [0.26.1](https://github.com/Nonsuch-io/componentLibrary/compare/v0.26.0...v0.26.1) (2026-08-10)


### Bug Fixes

* **test:** unmount components after every test ([0b8c909](https://github.com/Nonsuch-io/componentLibrary/commit/0b8c909c8ab561e1350f4e991cff4f2d7b101641))
* **test:** unmount components after every test ([595f713](https://github.com/Nonsuch-io/componentLibrary/commit/595f71357ccf3dbe68d0cb343b64f7641639b138))

## [0.26.0](https://github.com/Nonsuch-io/componentLibrary/compare/v0.25.1...v0.26.0) (2026-08-10)


### Features

* **config:** export the Quasar config at a standalone subpath ([1c89463](https://github.com/Nonsuch-io/componentLibrary/commit/1c8946356166374e4b6a688fb426148c00b877ad))
* **config:** export the Quasar config at a standalone subpath ([510c06b](https://github.com/Nonsuch-io/componentLibrary/commit/510c06b1bfea92d29e9478b1ad335a3bc28e0389))
* **radio:** add NsRadio and NsRadioButtons with a real radiogroup (componentLibrary-zux) ([1795609](https://github.com/Nonsuch-io/componentLibrary/commit/17956096b9d10b3d9403b2f562387084bb971b47))
* **radio:** add NsRadio and NsRadioButtons with a real radiogroup (zux) ([63ba514](https://github.com/Nonsuch-io/componentLibrary/commit/63ba514dbe6557dc19cb6b59f9b20c3666ca3cdd))


### Bug Fixes

* **build:** pin the CSS filename, which the second lib entry silently renamed ([3a4c4bc](https://github.com/Nonsuch-io/componentLibrary/commit/3a4c4bc8da9147c473d12b4231000a99694c9620))

## [0.25.1](https://github.com/Nonsuch-io/componentLibrary/compare/v0.25.0...v0.25.1) (2026-08-07)


### Bug Fixes

* **components:** accept the `disabled` spelling, which silently did nothing (componentLibrary-ob8) ([5d3c645](https://github.com/Nonsuch-io/componentLibrary/commit/5d3c645ae220d451c0335ac00fd810b19d3d3747))
* **components:** accept the `disabled` spelling, which silently did nothing (ob8) ([eb49f4c](https://github.com/Nonsuch-io/componentLibrary/commit/eb49f4cb3a945535771424dff66af4fa4264746d))
* **components:** make the disabled warning actually reach a browser ([6a2b5a7](https://github.com/Nonsuch-io/componentLibrary/commit/6a2b5a7714446874e6b0d18e133e034b3e8dba1e))

## [0.25.0](https://github.com/Nonsuch-io/componentLibrary/compare/v0.24.6...v0.25.0) (2026-08-07)


### Features

* **dialog:** add the design system's named width scale (componentLibrary-0bw) ([ada088d](https://github.com/Nonsuch-io/componentLibrary/commit/ada088d492917d57b73e93cb32dcd5ca21795462))

## [0.24.6](https://github.com/Nonsuch-io/componentLibrary/compare/v0.24.5...v0.24.6) (2026-08-07)


### Bug Fixes

* **breadcrumbs:** add nav landmark, list semantics and aria-current (2c7) ([3db6375](https://github.com/Nonsuch-io/componentLibrary/commit/3db6375d7a9a7da0654e36c1606618749a978da2))
* **breadcrumbs:** add nav landmark, list semantics and aria-current (componentLibrary-2c7) ([bf731f5](https://github.com/Nonsuch-io/componentLibrary/commit/bf731f51cbe8b477d3101eaccdd98c0c70b75cc1))
* **breadcrumbs:** handle v-for crumbs, and stop claiming CSS content is unreadable ([4840e8c](https://github.com/Nonsuch-io/componentLibrary/commit/4840e8cf00e8f2795f4ca97ce27bc20e7db14d7d))

## [0.24.5](https://github.com/Nonsuch-io/componentLibrary/compare/v0.24.4...v0.24.5) (2026-08-07)


### Bug Fixes

* **ci:** build before test so the dist-artifact guards actually run ([f5a1f33](https://github.com/Nonsuch-io/componentLibrary/commit/f5a1f33235b70e5cbc8a11437a275080b6a59f42))
* **ci:** build before test so the dist-artifact guards actually run ([d24d1fc](https://github.com/Nonsuch-io/componentLibrary/commit/d24d1fc41784b51cb809d5cec7ccc3f2fd07d35a))
* **tooltip:** make NsTooltip reachable by keyboard and assistive tech (componentLibrary-sj1) ([899deb3](https://github.com/Nonsuch-io/componentLibrary/commit/899deb32b7abc8b17de462cc7cdb78b05e26bdca))
* **tooltip:** make NsTooltip reachable by keyboard and assistive tech (sj1) ([36a3002](https://github.com/Nonsuch-io/componentLibrary/commit/36a3002484550c3a6f957c443420e38bc6cb1713))

## [0.24.4](https://github.com/Nonsuch-io/componentLibrary/compare/v0.24.3...v0.24.4) (2026-08-05)


### Bug Fixes

* **button:** make the warning survive the library build (fable review) ([7d375cc](https://github.com/Nonsuch-io/componentLibrary/commit/7d375cc698b139025ff2a25da3fdda985cc4401a))
* **button:** warn on Quasar styling attrs, and fix marketing dark mode (componentLibrary-nk3) ([a605338](https://github.com/Nonsuch-io/componentLibrary/commit/a605338e10c9b37274a5a1a3a5b6b37039743a1a))
* **button:** warn on Quasar styling attrs, and fix marketing dark mode (componentLibrary-nk3) ([dc819b7](https://github.com/Nonsuch-io/componentLibrary/commit/dc819b72dd66227eb7e12eea25faceb44b3d8d64))

## [0.24.3](https://github.com/Nonsuch-io/componentLibrary/compare/v0.24.2...v0.24.3) (2026-07-15)


### Bug Fixes

* **NsAppShell:** pin the side nav so its tall content scrolls internally (componentLibrary-0ne) ([488c55d](https://github.com/Nonsuch-io/componentLibrary/commit/488c55d933af7f565ec577b559115c20a8009a3a))
* **NsAppShell:** pin the side nav so its tall content scrolls internally (componentLibrary-0ne) ([6545d9d](https://github.com/Nonsuch-io/componentLibrary/commit/6545d9d1b78b7f2b8271449d6de524447b8ba67f))

## [0.24.2](https://github.com/Nonsuch-io/componentLibrary/compare/v0.24.1...v0.24.2) (2026-07-07)


### Bug Fixes

* **dependabot:** use default-days cooldown for github-actions ([00400a2](https://github.com/Nonsuch-io/componentLibrary/commit/00400a2c6e50c549b6647aff7f637c48d2d53728))

## [0.24.1](https://github.com/Nonsuch-io/componentLibrary/compare/v0.24.0...v0.24.1) (2026-07-07)


### Performance Improvements

* **NsNavSidebar:** lazy-load AnimatedEye + size-limit tree-shaking guards (componentLibrary-rvs) ([f1c0208](https://github.com/Nonsuch-io/componentLibrary/commit/f1c0208fec19abce7087b88357c53f3aec1f9c07))
* **NsNavSidebar:** lazy-load AnimatedEye + size-limit tree-shaking guards (componentLibrary-rvs) ([e6f1483](https://github.com/Nonsuch-io/componentLibrary/commit/e6f1483fcc52546114b196acf7dfd43c0ab9edac))

## [0.24.0](https://github.com/Nonsuch-io/componentLibrary/compare/v0.23.0...v0.24.0) (2026-07-07)


### Features

* **NsNavSidebar:** flyout edge-flip/clamp/RTL, bottom-item support, a11y ([ee32667](https://github.com/Nonsuch-io/componentLibrary/commit/ee32667ea9885d4febabcb66d581685dec426388))
* **NsNavSidebar:** flyout edge-flip/clamp/RTL, bottom-item support, a11y ([0aeb375](https://github.com/Nonsuch-io/componentLibrary/commit/0aeb375fe3ed0fca2ec054dcccaec975f2555810))

## [0.23.0](https://github.com/Nonsuch-io/componentLibrary/compare/v0.22.2...v0.23.0) (2026-07-06)


### Features

* **NsAppShell:** add v-model:collapsed for persistable drawer collapse ([ac809e4](https://github.com/Nonsuch-io/componentLibrary/commit/ac809e4703e966fa986d962b15a9f24ae189b8c7))
* **NsAppShell:** add v-model:collapsed for persistable drawer collapse ([fb9dbd5](https://github.com/Nonsuch-io/componentLibrary/commit/fb9dbd541d763110bcaab87fa150a13430da9f57))

## [0.22.2](https://github.com/Nonsuch-io/componentLibrary/compare/v0.22.1...v0.22.2) (2026-07-03)


### Bug Fixes

* **NsNavSidebar:** teleport sub-menu flyout to escape drawer overflow clipping ([8e027e4](https://github.com/Nonsuch-io/componentLibrary/commit/8e027e4c15dffa6b8ee17e5696e480490034d112))
* **NsNavSidebar:** teleport sub-menu flyout to escape drawer overflow clipping ([05f58f0](https://github.com/Nonsuch-io/componentLibrary/commit/05f58f0a8e291177dab2854e512bb835cdc25832))

## [0.22.1](https://github.com/Nonsuch-io/componentLibrary/compare/v0.22.0...v0.22.1) (2026-07-01)


### Bug Fixes

* **exports:** point ./style.css at emitted nonsuch-components.css ([0236946](https://github.com/Nonsuch-io/componentLibrary/commit/02369468177cd98a941c93136d552fc9f06d98f1))
* **exports:** point ./style.css at emitted nonsuch-components.css ([2941778](https://github.com/Nonsuch-io/componentLibrary/commit/2941778ad71c59fe6cdea577fa7436f27c5e3a6c))

## [0.22.0](https://github.com/Nonsuch-io/componentLibrary/compare/v0.21.0...v0.22.0) (2026-06-03)


### Features

* **NsTab:** accept Phosphor icon components alongside string names ([36ef0bf](https://github.com/Nonsuch-io/componentLibrary/commit/36ef0bf685bec6ef772d73120aeb1ac7423708b4))
* **NsTab:** accept Phosphor icon components alongside string names ([3dcd70a](https://github.com/Nonsuch-io/componentLibrary/commit/3dcd70aa8564d0d1ad4029bac20d236ddaff39cd))

## [0.21.0](https://github.com/Nonsuch-io/componentLibrary/compare/v0.20.0...v0.21.0) (2026-06-02)


### Features

* **icons:** add Phosphor Icons as default icon library ([7553281](https://github.com/Nonsuch-io/componentLibrary/commit/755328162e33e851be137da446833c143c4e1a40))


### Bug Fixes

* **icons:** address PR 131 review feedback ([f45fd35](https://github.com/Nonsuch-io/componentLibrary/commit/f45fd350fe315d58fbad76e94232c9e195ef8a7e))

## [0.20.0](https://github.com/Nonsuch-io/componentLibrary/compare/v0.19.0...v0.20.0) (2026-06-02)


### Features

* marketing landing page component suite + Figma token rename ([7cc0949](https://github.com/Nonsuch-io/componentLibrary/commit/7cc0949e306df3ada1b86fe810f2285e7399a0cc))
* **marketing:** locale-aware aria-label + small NsHero polish ([1ea5c4e](https://github.com/Nonsuch-io/componentLibrary/commit/1ea5c4e68765634129b232b9391b749bce28e920))
* **NsLandingLayout:** extract marketing landing page scaffold into a component ([4327570](https://github.com/Nonsuch-io/componentLibrary/commit/4327570cae0efcecb8a40c14caddcd1a9eaa3b9e))


### Bug Fixes

* **marketing:** replace broken icon URLs and wire up full landing page ([e540d79](https://github.com/Nonsuch-io/componentLibrary/commit/e540d79efd111b8cb40b1509edc8c5b17d9e14ae))
* **NsHero:** hoist doodle styles out of scoped block to fix desktop layout ([d9928d7](https://github.com/Nonsuch-io/componentLibrary/commit/d9928d7620f4ac6a5fa30d7581a4ca4ce17c0f50))
* **tokens:** align [@media](https://github.com/media) dark text-disabled + enforce parity in tests ([21be554](https://github.com/Nonsuch-io/componentLibrary/commit/21be5540fab97a8fdc87452918b1b0496e16b46a))

## [0.19.0](https://github.com/Nonsuch-io/componentLibrary/compare/v0.18.0...v0.19.0) (2026-05-30)


### Features

* **NsAppShell:** swap drawer internals to NsNavSidebar ([75807d8](https://github.com/Nonsuch-io/componentLibrary/commit/75807d81d544586ac84567238c8fedd2178b4ebc))


### Bug Fixes

* **NsAppShell:** size drawer to fit NsNavSidebar without clipping ovals ([47ff93f](https://github.com/Nonsuch-io/componentLibrary/commit/47ff93f9e49891e6c9b95d8e61f9ee013e695d19))

## [0.18.0](https://github.com/Nonsuch-io/componentLibrary/compare/v0.17.0...v0.18.0) (2026-05-29)


### Features

* **NsNavSidebar:** quasar-aligned API (separator/active/to/disable/string-icon/sub-objects) ([94e8cb8](https://github.com/Nonsuch-io/componentLibrary/commit/94e8cb868a4114efa673cf858dd0d4606d9ca6a8))
* **NsNavSidebar:** quasar-aligned API (separator/active/to/disable/string-icon/sub-objects) ([4052d2c](https://github.com/Nonsuch-io/componentLibrary/commit/4052d2c8a600a45e2f7cae83ae57f08a9984d874))


### Bug Fixes

* **NsNavSidebar:** button type, unmount timer leak, exported sub-item type ([f024023](https://github.com/Nonsuch-io/componentLibrary/commit/f02402336a80c4c02ba5c83f9f9e2ef40ed4c7d0))

## [0.17.0](https://github.com/Nonsuch-io/componentLibrary/compare/v0.16.0...v0.17.0) (2026-05-25)


### Features

* **AnimatedEye:** clip pupil to visible eye almond ([2ae06cd](https://github.com/Nonsuch-io/componentLibrary/commit/2ae06cd372578de2a8ed0986e9d0062fe4d42ecd))
* **AnimatedEye:** keep pupil round in peek state, bump radius to 4 ([22159fc](https://github.com/Nonsuch-io/componentLibrary/commit/22159fc80ed455680edf748ebbe3370bb7d78f4e))
* **AnimatedEye:** nudge peek lashes onto eyelid, bigger pupil ([5e414ea](https://github.com/Nonsuch-io/componentLibrary/commit/5e414ea8bcdd22db8274956dadf71b389ff25eb6))
* **AnimatedEye:** peek shows upper lashes, fix debugPeek reactivity ([d15bfdc](https://github.com/Nonsuch-io/componentLibrary/commit/d15bfdc3d51eeade45f39b96cda37b99f582be6b))
* **AnimatedEye:** unfilled pupil, three eyelashes on closed eye ([2b0493d](https://github.com/Nonsuch-io/componentLibrary/commit/2b0493dc819c080ffd12e85eed3f0d7987a50f30))
* **NsNavSidebar:** animated eye toggle with blink, peek, and cursor tracking ([fa8f210](https://github.com/Nonsuch-io/componentLibrary/commit/fa8f2103e442d369b1d0cf734d169511b19d545b))
* **NsNavSidebar:** animated eye toggle with blink, peek, and cursor tracking ([4f05979](https://github.com/Nonsuch-io/componentLibrary/commit/4f0597934454d9e7ec77b34c3fb64054e5283750))
* **NsNavSidebar:** left-align contents in both states, add eye peek-debug story ([236f95b](https://github.com/Nonsuch-io/componentLibrary/commit/236f95b437597e27e1eb89d1d263f790990a8ca3))
* **NsNavSidebar:** tune eyelash angles, recenter icons when collapsed ([9cdf181](https://github.com/Nonsuch-io/componentLibrary/commit/9cdf181412a1f12bd346627570c4aaac0ca08365))


### Bug Fixes

* **AnimatedEye:** track inner reset timers; address Sonnet review ([5aede06](https://github.com/Nonsuch-io/componentLibrary/commit/5aede0659ab1b836cc57aa84322c08dbeb4fed88))

## [0.16.0](https://github.com/Nonsuch-io/componentLibrary/compare/v0.15.0...v0.16.0) (2026-05-15)


### Features

* add build:watch script for live-link development ([5ec5c77](https://github.com/Nonsuch-io/componentLibrary/commit/5ec5c777150272a1aebd71055b118cbaad69e0ed))
* add build:watch script for live-link DX ([4e9efdd](https://github.com/Nonsuch-io/componentLibrary/commit/4e9efdd8525160b1f33e1fa549c223e5b1571592))

## [0.15.0](https://github.com/Nonsuch-io/componentLibrary/compare/v0.14.0...v0.15.0) (2026-05-04)


### Features

* **typography:** add label-xs (extra small label) style ([caa6b8b](https://github.com/Nonsuch-io/componentLibrary/commit/caa6b8b32485369e8f9dc071c605d9b4f7a8e6b8))

## [0.14.0](https://github.com/Nonsuch-io/componentLibrary/compare/v0.13.0...v0.14.0) (2026-05-02)


### Features

* **button:** restyle NsButton to match Figma design system ([b86b60e](https://github.com/Nonsuch-io/componentLibrary/commit/b86b60e95590f0f7d42745d9e6ff3c92bad48e71))
* **nav:** add NsNavSidebar and NsBottomNav components ([433063d](https://github.com/Nonsuch-io/componentLibrary/commit/433063d2c3fdf7164b6649e08266008b1deecc6b))
* **tokens:** add two-layer SCSS typography token system ([1af19b9](https://github.com/Nonsuch-io/componentLibrary/commit/1af19b9806c8cb77a86b2cb0ff1c524e71acdb7b))
* **tokens:** add two-layer SCSS typography token system ([0c9a41f](https://github.com/Nonsuch-io/componentLibrary/commit/0c9a41f131ad044a2c7b8aeb1bd994553499bcf3))
* **tokens:** expand semantic colour tokens from Figma design system ([2c9f96d](https://github.com/Nonsuch-io/componentLibrary/commit/2c9f96d127a23c62c2737811ad3c5b4a7c29c47c))


### Bug Fixes

* **deps:** align vitest packages to 4.1.5 to fix CI ([2447e2a](https://github.com/Nonsuch-io/componentLibrary/commit/2447e2ad041909f67699ecf3a508da520248caee))
* **tokens,components:** resolve PR [#78](https://github.com/Nonsuch-io/componentLibrary/issues/78) review feedback ([1af8b01](https://github.com/Nonsuch-io/componentLibrary/commit/1af8b0131c27ff91e3ff4c18043b59497e7a150c))

## [0.13.0](https://github.com/Nonsuch-io/componentLibrary/compare/v0.12.2...v0.13.0) (2026-04-16)


### Features

* surface NsTable types (NsTableColumn, NsTableProps, slot scope) ([4f67821](https://github.com/Nonsuch-io/componentLibrary/commit/4f6782197b02df3189f9b8c106c8292c33a73c2a))
* surface NsTable types so consumers drop raw Quasar imports ([d6baca6](https://github.com/Nonsuch-io/componentLibrary/commit/d6baca643a3e43fe8a6f48c8b0232e0239a23f94))

## [0.12.2](https://github.com/Nonsuch-io/componentLibrary/compare/v0.12.1...v0.12.2) (2026-04-04)


### Bug Fixes

* remove deprecated baseUrl from tsconfig files for TS7 compat ([a56a90a](https://github.com/Nonsuch-io/componentLibrary/commit/a56a90aed78bde010f8e2698727764dd29e9d23d))

## [0.12.1](https://github.com/Nonsuch-io/componentLibrary/compare/v0.12.0...v0.12.1) (2026-03-24)


### Bug Fixes

* scope test scripts to unit project so Playwright is not required locally (componentLibrary-9ky) ([#50](https://github.com/Nonsuch-io/componentLibrary/issues/50)) ([d92aead](https://github.com/Nonsuch-io/componentLibrary/commit/d92aeadef40957913e050b5019733e7a2169e691))

## [0.12.0](https://github.com/Nonsuch-io/componentLibrary/compare/v0.11.0...v0.12.0) (2026-03-14)


### Features

* **NsAppShell:** add user avatar dropdown menu & complete Storybook setup ([#36](https://github.com/Nonsuch-io/componentLibrary/issues/36)) ([3c072a8](https://github.com/Nonsuch-io/componentLibrary/commit/3c072a8a6d4548fb39b3de3acd3967b8aec7ea53))

## [0.11.0](https://github.com/Nonsuch-io/componentLibrary/compare/v0.10.1...v0.11.0) (2026-03-08)


### Features

* add bundle size tracking with size-limit ([bbd1f4b](https://github.com/Nonsuch-io/componentLibrary/commit/bbd1f4b3a267a3c28a19b2bbe8b6d1d6f0bdebf8))

## [0.10.1](https://github.com/Nonsuch-io/componentLibrary/compare/v0.10.0...v0.10.1) (2026-03-05)


### Bug Fixes

* drawer auto-open, icon font, gutter classes, mini avatar overlap ([ea0373d](https://github.com/Nonsuch-io/componentLibrary/commit/ea0373de2b619470ef481151f335190790a7109d))

## [0.10.0](https://github.com/Nonsuch-io/componentLibrary/compare/v0.9.0...v0.10.0) (2026-03-05)


### Features

* tablet landscape UI — auto mini drawer at md, 4-col grid ([6cf36ee](https://github.com/Nonsuch-io/componentLibrary/commit/6cf36ee6a8baa3281c30a7af54ae50d5177c22a5))


### Bug Fixes

* mobile bottom nav overflow — even flex tabs with ellipsis truncation ([55247d7](https://github.com/Nonsuch-io/componentLibrary/commit/55247d74c24031ee0f3a1f15a0242a5325a8470f))
* use plain v* tags in release-please config ([9095ba4](https://github.com/Nonsuch-io/componentLibrary/commit/9095ba43d8a13a146637c841fc0ef77a028cd959))

## [0.9.0](https://github.com/Nonsuch-io/componentLibrary/compare/component-library-v0.8.0...component-library-v0.9.0) (2026-03-04)


### ⚠ BREAKING CHANGES

* bumps version to 0.8.0

### Features

* **a11y:** add ARIA attributes and accessibility tests across all components ([4e033a8](https://github.com/Nonsuch-io/componentLibrary/commit/4e033a862fac14eca06b0ab4f192d8e5765caf07))
* add 10 placeholder component wrappers ([9be7ee2](https://github.com/Nonsuch-io/componentLibrary/commit/9be7ee26f1a8569a17f70590e7f97d1dddcbfe32))
* add 34 placeholder components, manifest, and sync tooling ([0bdf836](https://github.com/Nonsuch-io/componentLibrary/commit/0bdf8368ba50cb144a4054abb1329ed5db6b8d03))
* add all Fixel weights + global.css and Quasar sass overrides ([4e70c3d](https://github.com/Nonsuch-io/componentLibrary/commit/4e70c3d49d6f562df1b7107f02b3b0b6c6317066))
* add App Shell Template system (NsAppShell, NsAuthLayout, NsDashboardGrid) ([814027d](https://github.com/Nonsuch-io/componentLibrary/commit/814027da58452afe3e2144a29c4baed5a3273f04))
* add breakpoints module with Quasar defaults and media query helpers ([a573245](https://github.com/Nonsuch-io/componentLibrary/commit/a5732459d39b2459fe5218959db894801a64a47e))
* add CSS custom property design token system ([cfccefe](https://github.com/Nonsuch-io/componentLibrary/commit/cfccefe277715f6919718bd9781e3d05310206c8))
* add ESLint + Prettier for code quality (componentLibrary-91i) ([1aafa4e](https://github.com/Nonsuch-io/componentLibrary/commit/1aafa4e1f6583b0264df32ff6424b3b352290cc6))
* add Fixel font structure with [@font-face](https://github.com/font-face) CSS and Roboto fallback ([799bd9f](https://github.com/Nonsuch-io/componentLibrary/commit/799bd9fc4fd727296fb2fc69630688b7e23f9213))
* add i18n locale system, string-prop composables, and RTL support ([402cbd1](https://github.com/Nonsuch-io/componentLibrary/commit/402cbd1fcec05a34c0d6c03eebfd76bab4dc80b4))
* add loading states and NsSkeleton component ([f4eb643](https://github.com/Nonsuch-io/componentLibrary/commit/f4eb6434022d9febfdff2574041f8225126e1a77))
* add NsDrawer and NsExpansionItem placeholder components ([6e4d241](https://github.com/Nonsuch-io/componentLibrary/commit/6e4d241aa187cbc722ac8ba8d3e631df96e35c5a))
* add test coverage thresholds with @vitest/coverage-v8 ([36c3031](https://github.com/Nonsuch-io/componentLibrary/commit/36c3031c26939977c6f936bb32baf498d53732d4))
* configure npm publishing + CI/CD (componentLibrary-a9h) ([702b657](https://github.com/Nonsuch-io/componentLibrary/commit/702b6575a7900f4bf2dafd226e21fcec8bf51081))
* MLP features — plugin, dark mode, theme provider, quasar config, NsInput, NsCard ([c963d04](https://github.com/Nonsuch-io/componentLibrary/commit/c963d048e7f0f339327d38fdcd447882b824b214))
* scaffold component library ([995a57e](https://github.com/Nonsuch-io/componentLibrary/commit/995a57e3939d249079695c6c8a136322846197e0))


### Bug Fixes

* add --provenance flag for npm Trusted Publishing ([856620d](https://github.com/Nonsuch-io/componentLibrary/commit/856620d2fa1720def80ad52007406578e0371e22))
* **ci:** remove packageManager field conflicting with pnpm/action-setup@v4 ([8dafa0d](https://github.com/Nonsuch-io/componentLibrary/commit/8dafa0d5aa0ba640ec4a8d3aa3d5d7eabe6515a7))
* **ci:** replace pnpm/action-setup with corepack enable ([f97d2cc](https://github.com/Nonsuch-io/componentLibrary/commit/f97d2ccca687af054e246ad52c5b9ce79aa33759))
* clear setup-node auth token for Trusted Publishing OIDC ([289e42b](https://github.com/Nonsuch-io/componentLibrary/commit/289e42bb2881e279e4ec29ff9d1dad62bf96b8c4))
* correct repository URL to Nonsuch-io org ([98434a1](https://github.com/Nonsuch-io/componentLibrary/commit/98434a1ad9d39cb263fbdaebcd2fa68314f37932))
* explicit OIDC token exchange for npm Trusted Publishing ([72e19d9](https://github.com/Nonsuch-io/componentLibrary/commit/72e19d9eb88791c030db39d8ee86d4a71a1c39eb))
* export all component Props interfaces and helper types ([aabc3c9](https://github.com/Nonsuch-io/componentLibrary/commit/aabc3c985e467d3bfd723a52666d2c5153c63fd0))
* load Material Icons in Storybook, add typecheck script ([cad4e07](https://github.com/Nonsuch-io/componentLibrary/commit/cad4e07e6f422ce4085dc3251e637561776cd48f))
* lower branch coverage threshold to 70% ([7b73400](https://github.com/Nonsuch-io/componentLibrary/commit/7b734009e9c5b23d602a2c7e7056c7f2aa57c652))
* **publish:** use npm CLI built-in Trusted Publishing OIDC ([f6f7d74](https://github.com/Nonsuch-io/componentLibrary/commit/f6f7d74f16b4687491b55a53d8147b1e45ab479c))
* raise function coverage to 92% to meet CI threshold ([6c330a2](https://github.com/Nonsuch-io/componentLibrary/commit/6c330a2e9b9cca08c6ad96050852788b9c5759ed))
* remove registry-url to let Trusted Publishing handle auth via OIDC ([40b09a6](https://github.com/Nonsuch-io/componentLibrary/commit/40b09a656e1e0ca3e162fd378e8a79aa6b43b12b))
* resolve type errors and add type-check to quality gates ([1cfb2e6](https://github.com/Nonsuch-io/componentLibrary/commit/1cfb2e6070e545d80c2e004267bfe5cfa6ee2104))
* restore registry-url for npm OIDC auth ([e0f0a0b](https://github.com/Nonsuch-io/componentLibrary/commit/e0f0a0b556f3f1794eb60821465a4b6d1da20ae8))
* restore Trusted Publishing workflow with OIDC ([dcc2872](https://github.com/Nonsuch-io/componentLibrary/commit/dcc28728a3288bc958ee9f12cf9dc76d0e2d9a5a))
* simplify publish workflow for Trusted Publishing ([f50127f](https://github.com/Nonsuch-io/componentLibrary/commit/f50127f699c3150aea31e30425eab44623d99e2b))
* use npm publish for Trusted Publishing OIDC support ([d51bca2](https://github.com/Nonsuch-io/componentLibrary/commit/d51bca2ce16e20ec47b5dd6ffc5125728648946a))
* use npm Trusted Publishing (OIDC) instead of token ([49c8da9](https://github.com/Nonsuch-io/componentLibrary/commit/49c8da9dc644fbb1fe0e85f5acfcf5828c5204f7))

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

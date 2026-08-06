# ADR 0001 — No global component registration

- **Status:** Accepted
- **Date:** 2026-08-06
- **Bead:** `componentLibrary-wer` (closed as won't-do)
- **Supersedes:** PR #216, closed unmerged
- **Related:** `componentLibrary-1iz` (styling layer vs curated API), `butiq-xp9i`

## Context

`@nonsuch/component-library` calls `app.component()` zero times. `createNonsuch()`
provides locale messages and nothing else. Consumers import each component they use.

This surfaced as a bug report. butiq has no auto-import resolver and no
`components.d.ts`, so a file that uses `<ns-banner>` without importing `NsBanner`
resolves to nothing — Vue renders a bare unknown element. butiq measured **163
unresolved `<ns-*>` tags across six files**, including three routed, live portal
pages that import no Ns component while using them heavily:

| file                     | unresolved tags |
| ------------------------ | --------------- |
| `PaymentDetailPage.vue`  | 83              |
| `AutoPromotionsPage.vue` | 44              |
| `PaymentsPage.vue`       | 22              |

Those pages were missing every button, input, select and banner. One line carried
three independent faults, none of which typechecked:

```vue
<ns-banner v-if="store.error" type="negative" :message="$t(store.error)" />
```

the component is unresolved; `type="negative"` is not a valid `NsBannerType`; and
`:message` is not a prop at all — `NsBanner` takes content via its default slot.
The banner also lost the `role="alert"` / `aria-live="assertive"` that `NsBanner`
derives from `type`, so an error that should interrupt a screen reader did not.

butiq-agent initially asked the library to augment Vue's `GlobalComponents`
interface so `vue-tsc` would type these tags. That was declined — see
_Alternatives_ — and the counter-proposal became global registration plus a
truthful augmentation, built as PR #216.

## Decision

**The library does not register components globally, and does not ship a
`GlobalComponents` type augmentation.** Consumers import every component they use.

PR #216 is closed unmerged and its branch deleted.

### Why

**An import list is a per-file manifest.** Reading a `.vue` file's imports tells you
what it depends on. Global registration deletes that signal, and deletes it
**one-way**: once an app registers globally, nothing needs importing, usage drifts
toward global everywhere, and reverting means re-finding every tag in the codebase.

**It would delete the diagnostic that found this bug.** Vue's
`"Failed to resolve component"` warning is the only reason 163 tags were
discoverable at all. Registration silences it for forgotten imports — which is the
feature, and also the cost. Both signals that made the outage findable would be gone.

**Tree-shaking cannot survive it.** `app.component(name, value)` takes a runtime
value, so a bundler cannot know which `<ns-*>` tags a template uses and must retain
all 70 components. This is inherent to global registration, not an implementation
gap. Measured against the built package:

| usage                               | gzipped      |
| ----------------------------------- | ------------ |
| `NsButton` only                     | 2,447 B      |
| three components                    | 2,893 B      |
| `createNonsuch`, not opted in       | 1,966 B      |
| **`createNonsuch` + full registry** | **15,954 B** |
| partial map of three components     | 3,408 B      |

About 13 kB gzipped per app, across three apps, to solve a problem that has a
cheaper fix.

**Nobody would have used it.** butiq is the library's only consumer. Building an
opt-in capability the sole consumer intends to decline is dead code in the design
authority, and it would have to be maintained — 70 static imports and a 70-entry
type augmentation, both hand-maintained and guarded by drift tests.

### The actual fix lives in the consumer

Two changes, both butiq's, both strictly better than the library-side one:

1. **Add the missing imports.** Mechanical, no bundle cost, restores the manifest.
2. **Fail the test run on Vue resolution warnings.** A test-setup file that treats
   `"Failed to resolve component"` as a failure closes this class permanently, covers
   **every** component including Quasar's, and would have caught all 163 on the day
   they were written.

The second is the durable one. The library cannot provide it, and no library-side
change would have covered Quasar's components.

## Consequences

- Consumers import every Ns component they use. No `<ns-*>` tag resolves without one.
- A forgotten import fails **loudly** at runtime in dev, and — once butiq's guard
  lands — fails the test suite.
- `createNonsuch()` stays small: 1,966 B gzipped, locale only.
- The library ships no ambient type augmentation, so it cannot make a claim about
  a consumer's app that the consumer's runtime does not honour.
- **If a future consumer genuinely needs global registration**, revisit this ADR
  rather than reaching for a workaround. The measurements above are the input; the
  reversal cost is one PR. Note that `createNonsuch({ components })` taking a **map**
  rather than a boolean would allow partial registration (3,408 B for three
  components), which is the shape to revive if it ever comes back.

## Alternatives considered

**Ship the `GlobalComponents` augmentation only, without registering anything** —
the original request. Rejected outright: declaring that `<ns-banner>` exists while
nothing registers it tells TypeScript a lie that is currently a loud runtime
warning. It converts a visible failure into a silent, type-approved no-op — strictly
worse than the bug it was meant to fix. butiq-agent withdrew the ask on this basis.

**`registerComponents: boolean`, defaulting true** — the first design. Abandoned on
measurement: `plugin.ts` held 70 _static_ imports, so `import { createNonsuch }` cost
17,510 B gzipped **whatever the boolean said**. The flag gated only the
`app.component()` calls, not the bytes. A knob that appears to control cost and does
not is worse than no knob.

**Global registration, opt-in via an explicit component map** — PR #216, built and
reviewed before being closed. Technically sound and the reviews were clean after
fixes, but it fails the question that mattered: the sole consumer would not use it.

## Notes

Two findings from PR #216 are worth keeping independently of the decision, and were
landed separately:

- **CI ran `Test` before `Build`** with `dist/` gitignored, so every `*.dist.test.ts`
  in the repo silently skipped in the gate and reported green — including
  `useNsAttrConflictWarning.dist.test.ts`, a no-op since it was written.
- **`plugin.dist.test.ts` used `existsSync` of the file under test as its skip
  sentinel**, so the regression it existed to catch would have skipped and passed.

Both are instances of the failure class this codebase tracks (`switchboard-87q`): a
check that cannot fail, reporting success while measuring nothing.

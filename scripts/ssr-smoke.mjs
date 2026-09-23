/**
 * SERVER-RENDER EVERY EXPORTED COMPONENT, in the environment consumers
 * actually deploy into (componentLibrary-zfw).
 *
 * WHY A NODE SCRIPT AND NOT A VITEST PROJECT. Importing `quasar` under Vitest
 * loads `dist/quasar.client.js`, which touches `window` at module scope —
 * whatever `resolve.conditions` or `server.deps.inline` the project sets
 * (measured both ways). Plain node resolves quasar's `node` export condition
 * to the SERVER build, which is what a Nitro/Nuxt server gets. So the only way
 * to render components the way a consumer's server does is to leave Vitest out
 * of it.
 *
 * WHAT IT CATCHES: a bare DOM global reached during setup — `Element`,
 * `document`, `window` — which is a ReferenceError on a server and takes down
 * the whole request, not just the component. 0.53.1 shipped one and 500'd
 * butiq's Nuxt homepage on EVERY route while 1554 unit tests and 297 Chromium
 * stories stayed green, because happy-dom and Chromium both define those
 * globals (componentLibrary-2cp). `src/ssr.ssr-test.ts` covers the composable
 * layer; this covers the components, which is the half that was missing.
 *
 * THE FOUR FLAGS below are what a bundler defines for Quasar's server build.
 * Without them the import itself throws `__QUASAR_SSR_SERVER__ is not defined`.
 * They must be set BEFORE quasar or the library is imported, which is why this
 * file uses dynamic imports throughout.
 */
globalThis.__QUASAR_SSR__ = true
globalThis.__QUASAR_SSR_SERVER__ = true
globalThis.__QUASAR_SSR_CLIENT__ = false
globalThis.__QUASAR_SSR_PWA__ = false

const { createSSRApp, h } = await import('vue')
const { renderToString } = await import('vue/server-renderer')
const { Quasar } = await import('quasar')
const lib = await import('../dist/nonsuch-components.js')

/**
 * Quasar's server build refuses to install without an ssrContext — a real SSR
 * server passes the request through it, and Platform reads the user-agent off
 * `req.headers`. This is the smallest shape that satisfies it.
 */
const ssrContext = () => ({
  req: { headers: { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64)' } },
  res: { setHeader() {} },
  _modules: [],
  onRendered() {},
})

/**
 * MINIMAL PROPS, not a skip list — deliberately. A component that throws for a
 * missing required prop has not been exercised at all, so skipping it would
 * leave exactly the gap this script exists to close. Every entry here is the
 * least data that gets the component to render; if a new component needs one,
 * add it rather than excluding the component.
 */
const PROPS = {
  NsChecklistBanner: { title: 'T', tasks: [{ id: 'a', title: 'One' }] },
  NsOnboardingStepper: { steps: [{ label: 'One' }], modelValue: 0 },
  NsOrderSummaryTotals: {
    lines: [{ id: 'a', label: 'Subtotal', value: '$0.00' }],
    total: { value: '$0.00' },
  },
  NsPlanBuilder: {
    title: 'T',
    base: { name: 'Base' },
    categories: [{ id: 'a', label: 'A', name: 'A', options: [] }],
    total: { price: '$0' },
  },
  NsPlanFeatures: { features: ['One'] },
  NsPlanHighlights: { highlights: ['One'] },
  NsTrustBar: { items: [{ label: 'One' }] },
  // Not required props — these silence dev warnings that fire ONLY because a
  // gate renders things bare. A green run should be quiet so a red one reads.
  NsBrandLogo: { src: 'x.svg', ratio: 2.62 },
  NsImage: { src: 'x.svg', alt: 'x' },
  NsDialog: { title: 'T' },
  NsRadioButtons: { label: 'L', options: [{ label: 'A', value: 'a' }] },
}

/**
 * EXTRA RENDERS THAT REACH CODE THE DEFAULT PROPS DO NOT.
 *
 * Found by restoring the real componentLibrary-2cp bug and watching this
 * script: it failed ONE component, NsHoursOfOperation, and only because that
 * component happens to use a select with the label above. A bare NsSelect
 * never reaches the guard, because the composable's work is gated on being
 * active. So the harness would have caught 2cp by luck rather than by design,
 * and would have missed it entirely if that one component did not exist.
 *
 * Each entry renders the component a SECOND time with props that turn on a
 * path the defaults leave cold. Add one whenever a component has a mode whose
 * setup code differs — that is where a DOM global hides.
 */
const VARIANTS = {
  NsSelect: [
    { label: 'L', labelPlacement: 'above', options: ['a'] },
    { 'aria-label': 'L', options: ['a'] },
  ],
  NsInput: [{ label: 'L', labelPlacement: 'above' }],
}

/**
 * COMPONENTS QUASAR REFUSES TO RENDER WITHOUT A PARENT, wrapped so their setup
 * actually runs. QHeader and friends `inject(layoutKey, emptyRenderFn)` and
 * return an empty render when there is no QLayout above them, so these six
 * rendered `<!---->` and the gate could not tell "this component is SSR-safe"
 * from "Quasar declined to render it" — review (fable) dumped the HTML and
 * found seven characters. The Ns wrapper's own setup did still run, so nothing
 * library-owned was uncovered; what was uncovered is the Quasar-side setup,
 * which is exactly what the peer-floor job exists to exercise on the oldest
 * supported version.
 *
 * Not replaced by a blanket "must not render <!---->" assertion: NsDialog,
 * NsMenu and NsTooltip legitimately render an empty comment while closed, and
 * their setup IS exercised.
 */
const inLayout = (comp, props = {}) => h(lib.NsLayout, () => h(comp, props, () => 'x'))

const PARENTS = {
  NsTab: (comp) => h(lib.NsTabs, { modelValue: 'a' }, () => h(comp, { name: 'a', label: 'A' })),
  NsHeader: (comp) => inLayout(comp),
  NsFooter: (comp) => inLayout(comp),
  NsDrawer: (comp) => inLayout(comp, { modelValue: true }),
  // QPage wants a QPageContainer, not merely a layout.
  NsPage: (comp) => h(lib.NsLayout, () => h(lib.NsPageContainer, () => h(comp, {}, () => 'x'))),
  NsPageContainer: (comp) => inLayout(comp),
  NsTimelineEntry: (comp) => h(lib.NsTimeline, () => h(comp, { title: 'T' })),
}

async function renderOne(name, props) {
  const comp = lib[name]
  const node = PARENTS[name] ? PARENTS[name](comp) : h(comp, props)
  const app = createSSRApp({ render: () => node })
  app.use(Quasar, {}, ssrContext())
  // THE PLUGIN EVERY SSR CONSUMER INSTALLS, on every request. Its `install`
  // runs warnIfNsStylesheetMissing(), which guards `typeof document` today —
  // but nothing exercised that path, so anything added to install() reaching
  // the DOM unguarded would 500 every request BEFORE a component rendered,
  // with this gate green (review, fable).
  app.use(lib.createNonsuch())
  return renderToString(app)
}

const names = Object.keys(lib).filter((n) => /^Ns[A-Z]/.test(n) && typeof lib[n] === 'object')
if (names.length === 0) {
  console.error('ssr-smoke: found no Ns* components in dist — did the build run?')
  process.exit(1)
}

const failures = []
let renders = 0
for (const name of names) {
  const propSets = [PROPS[name] ?? {}, ...(VARIANTS[name] ?? [])]
  for (const [index, props] of propSets.entries()) {
    const label = index === 0 ? name : `${name} (variant ${index})`
    try {
      await renderOne(name, props)
      renders++
    } catch (error) {
      failures.push([label, `${error.constructor.name}: ${error.message}`])
    }
  }
}

if (failures.length > 0) {
  console.error(
    `\nssr-smoke: ${failures.length} of ${renders + failures.length} renders failed ` +
      `(${new Set(failures.map(([l]) => l.split(' (')[0])).size} of ${names.length} components):\n`,
  )
  for (const [name, message] of failures) console.error(`  ${name}: ${message}`)
  console.error(
    '\nA ReferenceError for a DOM global means code reached `document`/`window`/`Element` ' +
      'during setup. Guard it with `typeof`, or move it into onMounted — it is a 500 on ' +
      'every route of a consumer SSR app, not just this component (componentLibrary-2cp).\n',
  )
  process.exit(1)
}

console.log(`ssr-smoke: ${names.length} components server-rendered (${renders} renders)`)

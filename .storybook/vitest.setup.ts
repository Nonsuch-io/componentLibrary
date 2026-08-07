import { afterEach, beforeEach } from 'vitest'
import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview'
import { setProjectAnnotations } from '@storybook/vue3-vite'
import * as projectAnnotations from './preview'

// This is an important step to apply the right configuration when testing your stories.
// More info at: https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest#setprojectannotations
setProjectAnnotations([a11yAddonAnnotations, projectAnnotations])

// The portable-stories runner above mounts every story, but mounting alone
// does not fail the test if the story renders wrong — a template referencing
// a variable missing from setup()'s return, a prop that no longer exists, or
// a failed prop type check all mount "successfully" while Vue logs a dev
// warning to the console (see componentLibrary-mpi, where exactly this
// shipped green: a broken `:src` binding, 47/47 tests passing). Vue routes
// every one of those cases through its internal warn(), which in dev builds
// always calls `console.warn` with a message prefixed "[Vue warn]:". Treat
// such a warning as a failure of the story that produced it, so this whole
// class of bug is caught rather than the one instance found by accident.
//
// SCOPE, STATED HONESTLY: this catches warnings emitted while the test is
// still running — initial render (the bug this was built for, which warns
// synchronously during mount) and anything a play() function awaits. It does
// NOT catch fire-and-forget work the test never waits on: a stray setTimeout
// or un-awaited promise that warns after the story's test has finished lands
// in no bucket and is LOST, not misattributed. Demonstrated in review with a
// 400ms un-awaited timeout. The afterEach below yields twice first, which
// recovers same-tick and next-tick stragglers; genuinely delayed ones are a
// harder problem and deliberately out of scope. Do not read a green run as
// proof that no story warns asynchronously.
let vueWarningsDuringStory: string[] = []

const isVueWarning = (args: unknown[]): boolean =>
  typeof args[0] === 'string' && args[0].startsWith('[Vue warn]:')

const originalConsoleWarn = console.warn
console.warn = (...args: unknown[]) => {
  if (isVueWarning(args)) {
    vueWarningsDuringStory.push(args.map(String).join(' '))
  }
  originalConsoleWarn(...args)
}

beforeEach(() => {
  vueWarningsDuringStory = []
})

afterEach(async () => {
  // Yield twice before reading the bucket: once for pending microtasks
  // (promise continuations, Vue's scheduler) and once for the macrotask queue.
  // Without this, a warning emitted from work that settles immediately after
  // the test body — but before the next story starts — is dropped silently.
  await Promise.resolve()
  await new Promise((resolve) => setTimeout(resolve, 0))

  if (vueWarningsDuringStory.length === 0) return
  const messages = vueWarningsDuringStory.join('\n\n')
  vueWarningsDuringStory = []
  throw new Error(`Story rendered with Vue warning(s):\n\n${messages}`)
})

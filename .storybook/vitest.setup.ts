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
// any such warning during a story's render as a failure, so this whole class
// of bug is caught rather than the one instance that was found by accident.
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

afterEach(() => {
  if (vueWarningsDuringStory.length === 0) return
  const messages = vueWarningsDuringStory.join('\n\n')
  vueWarningsDuringStory = []
  throw new Error(`Story rendered with Vue warning(s):\n\n${messages}`)
})

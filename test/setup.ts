import { config, enableAutoUnmount } from '@vue/test-utils'
import { afterEach } from 'vitest'
import { Quasar, Screen } from 'quasar'

// Register Quasar as a global plugin for all tests
config.global.plugins = [[Quasar, {}]]

// NO DEBOUNCE ON SCREEN RESIZE. Quasar's Screen plugin defaults to a 16ms
// debounced resize handler (quasar.client.js:509), which is a setTimeout. When a
// file ends with one pending, it fires after jsdom has torn down `window` and
// throws `ReferenceError: window is not defined` from getSize() — attributed to
// whichever test file happened to be running, not the one that scheduled it.
//
// `setDebounce(0)` makes the handler synchronous: `delay > 0 ? debounce(...) : fn`
// (:530), so no timer is ever created. Set at module scope, so install() picks it
// up via its own setDebounce(updateDebounce) call.
//
// NOT REPRODUCED LOCALLY, and that is worth stating: it needs the timer pending
// at the exact moment of teardown, which is timing-dependent. CI hit it twice on
// quasar 2.24.0. The mechanism above is read from that version's source, not
// inferred. If this recurs, the fix is wrong and the real cause is elsewhere.
Screen.setDebounce(0)

/**
 * UNMOUNT EVERY COMPONENT AFTER EACH TEST.
 *
 * 69 of our test files call `mount()` and never unmount. A mounted Quasar
 * component leaves timers and observers running, and when the environment tears
 * down a pending one throws:
 *
 *     ReferenceError: window is not defined
 *       at getSize (quasar/dist/quasar.client.js)
 *       at Timeout.later
 *
 * vitest reports that as an unhandled error and EXITS NON-ZERO while printing
 * "898 passed | 0 failed" — so the summary line says success and the run fails.
 * That is how it reached CI on PR #242: the test output looked green, and I had
 * been grepping the summary rather than checking the exit code.
 *
 * It is a race, not a deterministic failure — it never reproduced locally across
 * three full runs. The trigger is load: more mounted components means more
 * pending timers at teardown, so adding tests anywhere can tip an unrelated file
 * over. Fixing it at the source means every test file, not the one that happened
 * to be running when the timer fired.
 */
enableAutoUnmount(afterEach)

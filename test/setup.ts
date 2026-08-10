import { config, enableAutoUnmount } from '@vue/test-utils'
import { afterEach } from 'vitest'
import { Quasar } from 'quasar'

// Register Quasar as a global plugin for all tests
config.global.plugins = [[Quasar, {}]]

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

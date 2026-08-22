/**
 * The built bundle has no types at typecheck time — CI runs `typecheck` BEFORE
 * `build`, and `dist/` is gitignored, so `dist/*.d.ts` is absent on a clean
 * checkout. Without this the dist tests fail to compile on the very machine
 * that is supposed to be checking them.
 *
 * Typed as `unknown` members ON PURPOSE. These tests exist to observe the
 * SHIPPED artefact — that a guard survived minification, that `import.meta.env`
 * was inlined away. Borrowing source types here would mean asserting against
 * what we intended to build rather than what we built, which is the failure the
 * file was written to catch. Story: componentLibrary-9ka.
 */
declare module '*/dist/nonsuch-components.js' {
  const members: Record<string, unknown>
  export = members
}

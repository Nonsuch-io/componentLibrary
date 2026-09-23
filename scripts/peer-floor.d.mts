/**
 * Hand-written declarations for the CI helper. The script stays .mjs because
 * CI runs it with plain `node`, and a .ts file would need a build step or a
 * flag to do that — a moving part in the gate that is meant to be the simple
 * part. Typed here so the test that imports it stays type-checked.
 */

/** The exact version a caret/tilde/plain range floors at. Throws on anything else. */
export function floorOf(range: string): string

/** The peer range for `name` in a manifest, resolved to its exact floor. */
export function peerFloor(pkg: unknown, name: string): string

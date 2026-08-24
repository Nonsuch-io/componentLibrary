// DELIBERATELY BROKEN. Not dead code, not a mistake, and not to be "fixed".
// src/typecheck-gate.test.ts runs vue-tsc over this directory and FAILS if the
// compiler reports nothing. See that file for why. componentLibrary-9ka.
export const wrong: number = 'this is a string'

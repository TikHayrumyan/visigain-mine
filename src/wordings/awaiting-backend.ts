/**
 * Keys this app uses that the contract's catalogue export (api/examples/wordings*.json) does not hold yet. Each one
 * is asked of Backend; until the catalogue has it, the page shows the key in development and nothing in production.
 *
 * tests/wordings-keys.test.ts fails on a key used in src that is neither in the catalogue examples nor here, and on a
 * key listed here that the examples now hold (so this list only shrinks). Never answer a missing key by typing the
 * sentence.
 */
export const AWAITING_BACKEND: readonly string[] = [
  // The theme names: a catalogue gap in the spec (x-wordings.pending "common.theme.*"; source: the backend's
  // src/components/theme-toggle.tsx LABEL, drawn through tr()). "Theme" and "Follow my device" are in the catalogue.
  "common.theme.light",
  "common.theme.dark",
];

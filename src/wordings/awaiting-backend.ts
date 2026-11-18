/**
 * Keys this app uses that the contract's catalogue export (api/examples/wordings*.json) does not hold yet. Each one
 * is asked of Backend; until the catalogue has it, the page shows the key in development and nothing in production.
 *
 * tests/wordings-keys.test.ts fails on a key used in src that is neither in the catalogue examples nor here, and on a
 * key listed here that the examples now hold (so this list only shrinks). Never answer a missing key by typing the
 * sentence.
 */
export const AWAITING_BACKEND: readonly string[] = [
  // The header, the top bar and the open menu (Figma "Visigain (Website)", Home, 18 November 2026).
  "common.nav.get_your_free_scan", // "Get Your Free Scan"
  "common.nav.help_center", // "Help center"
  "common.nav.blog", // "Blog" (also the footer's Company column)
  "common.nav.already_a_customer", // "Already a customer?"
  "common.nav.free_no_call_results_in_about", // "Free · No call · Results in about 15 minutes"
  // The footer.
  "common.footer_columns.free_scan", // "Free Scan"
  "common.footer_columns.full_visibility_grade_report", // "Full Visibility Grade Report"
  "common.footer.copyright", // "© {year} {company}"
];

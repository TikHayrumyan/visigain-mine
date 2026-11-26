/**
 * The filled green button (a link or a submit button), from the design's button states. Enabled is green, hover is
 * lighter, focus and press are darker, disabled is the page line with faint text. Its size is the caller's.
 */
/** An outline button that sits beside a section title: 44px, ink border, regular 15px. */
export const OUTLINE_LINK =
  "inline-flex h-11 shrink-0 items-center justify-center rounded-button border border-ink bg-surface px-5 text-body-l text-fg no-underline transition-colors duration-300 ease-reveal hover:bg-surface-subtle focus-visible:bg-surface-subtle focus-visible:outline-none";

export const PRIMARY_BUTTON =
  "inline-flex items-center justify-center rounded-button bg-green text-label-l text-ink no-underline transition-colors duration-300 ease-reveal hover:bg-green-hover focus-visible:bg-green-dark focus-visible:outline-none! active:bg-green-pressed disabled:bg-line disabled:text-faint";

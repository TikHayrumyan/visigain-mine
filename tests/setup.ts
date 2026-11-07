import { setMissingKeyHandler } from "@/wordings/t";

/** A missing wording key fails the test that rendered it: it is a question for Backend, never typed text. */
setMissingKeyHandler((key) => {
  throw new Error(`missing wording key "${key}"`);
});

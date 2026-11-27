import { z } from "zod";

/**
 * Used when `GET /places/form` is slow or unreadable. These match the live contract,
 * so the field still searches instead of changing shape.
 */
export const PLACE_SEARCH_DEFAULTS = {
  available: true,
  minChars: 3,
  maxChars: 120,
  debounceMs: 300,
  maxSuggestions: 5,
} as const;

export const placeSearchSettingsSchema = z.object({
  available: z.boolean(),
  minChars: z.number().int().positive(),
  maxChars: z.number().int().positive(),
  debounceMs: z.number().int().nonnegative(),
  maxSuggestions: z.number().int().positive(),
});

export type PlaceSearchSettings = z.infer<typeof placeSearchSettingsSchema>;

/** The form answer is large. Only the search settings are kept. */
export const placesFormSchema = z
  .object({
    search: placeSearchSettingsSchema,
  })
  .passthrough();

export const placeSuggestionSchema = z
  .object({
    placeId: z.string().min(1),
    name: z.string(),
    address: z.string(),
  })
  .passthrough();

export type PlaceSuggestion = z.infer<typeof placeSuggestionSchema>;

export const placeSearchResponseSchema = z
  .object({
    suggestions: z.array(placeSuggestionSchema),
  })
  .passthrough();

/** What the browser sends to our own `/api/v1/places/search`. */
export const placeSearchRequestSchema = z.object({
  input: z.string().trim().min(1).max(PLACE_SEARCH_DEFAULTS.maxChars),
  sessionToken: z.string().regex(/^[A-Za-z0-9_-]{16,64}$/),
});

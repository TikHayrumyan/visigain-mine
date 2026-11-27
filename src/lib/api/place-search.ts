import "server-only";

import { backendApiOrigin } from "./backend";
import { PLACE_SEARCH_DEFAULTS, placesFormSchema, type PlaceSearchSettings } from "./places";

const FORM_TIMEOUT_MS = 2_500;

/** Search settings for the hero field. Cached for a minute; a failure keeps the field as it is. */
export async function placeSearchSettings(): Promise<PlaceSearchSettings> {
  try {
    const response = await fetch(`${backendApiOrigin()}/api/v1/places/form`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(FORM_TIMEOUT_MS),
      next: { revalidate: 60 },
    });

    if (!response.ok) return PLACE_SEARCH_DEFAULTS;

    const parsed = placesFormSchema.safeParse(await response.json());

    return parsed.success ? parsed.data.search : PLACE_SEARCH_DEFAULTS;
  } catch {
    return PLACE_SEARCH_DEFAULTS;
  }
}

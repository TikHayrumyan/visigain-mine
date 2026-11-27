"use client";

import { useEffect, useRef, useState } from "react";

import { placeSearchResponseSchema, type PlaceSearchSettings, type PlaceSuggestion } from "@/lib/api/places";

async function fetchSuggestions(input: string, sessionToken: string, signal: AbortSignal): Promise<PlaceSuggestion[]> {
  const response = await fetch("/api/v1/places/search", {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify({ input, sessionToken }),
    signal,
  });

  if (!response.ok) return [];

  const parsed = placeSearchResponseSchema.safeParse(await response.json());

  return parsed.success ? parsed.data.suggestions : [];
}

/** Debounced suggestions for the current text. One session token per focus, a new one after a pick. */
export function usePlaceSearch(query: string, enabled: boolean, settings: PlaceSearchSettings) {
  const { available, minChars, maxChars, debounceMs, maxSuggestions } = settings;
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [settledQuery, setSettledQuery] = useState("");
  const session = useRef<string | null>(null);

  function sessionToken(): string {
    session.current ??= crypto.randomUUID();
    return session.current;
  }

  function renewSession(): void {
    session.current = null;
  }

  useEffect(() => {
    const text = query.trim();
    const searchable = enabled && available && text.length >= minChars && text.length <= maxChars;

    if (!searchable) return;

    const controller = new AbortController();
    const timer = setTimeout(() => {
      void fetchSuggestions(text, sessionToken(), controller.signal)
        .then((next) => {
          if (controller.signal.aborted) return;
          setSuggestions(next);
          setSettledQuery(text);
        })
        .catch(() => {
          if (controller.signal.aborted) return;
          setSuggestions([]);
          setSettledQuery(text);
        });
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [available, debounceMs, enabled, maxChars, minChars, query]);

  const text = query.trim();
  const waiting = enabled && available && text.length >= minChars && text.length <= maxChars && settledQuery !== text;
  const visible = suggestions.slice(0, maxSuggestions);

  return {
    suggestions: waiting ? [] : visible,
    pending: waiting,
    renewSession,
  };
}

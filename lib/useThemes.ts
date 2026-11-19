"use client";

import { useCallback, useEffect, useState } from "react";
import { getThemes } from "./api";
import type { Theme } from "./types";

/** Live theme/slot data. Refreshes every 20s and when the tab regains focus. */
export function useThemes({ poll = true } = {}) {
  const [themes, setThemes] = useState<Theme[] | null>(null);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setThemes(await getThemes());
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    refresh();
    if (!poll) return;
    const id = setInterval(refresh, 20_000);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh, poll]);

  return { themes, error, refresh };
}

export const slotsOpen = (themes: Theme[]) => themes.reduce((n, t) => n + Math.max(0, t.capacity - t.taken), 0);
export const isFull = (t: Theme) => t.taken >= t.capacity;

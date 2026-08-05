"use client";

import { useState, useEffect, useCallback } from "react";

export const DEFAULT_LINES = ["Mel-Pour-Analys", "Moulding", "RCS", "Core Making", "Finishing", "Maintenance", "Die Press"];
export const DEFAULT_PICS = ["Maintenance", "Engser", "Kaizen", "Produksi"];

interface OptionRow {
  id: number;
  value: string;
}

export function useOptions() {
  const [lines, setLines] = useState<string[]>(DEFAULT_LINES);
  const [pics, setPics] = useState<string[]>(DEFAULT_PICS);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const res = await fetch("/api/options");
      const data = await res.json();
      if (res.ok) {
        if (Array.isArray(data.lines)) setLines(data.lines.map((o: OptionRow) => o.value));
        if (Array.isArray(data.pics)) setPics(data.pics.map((o: OptionRow) => o.value));
      }
    } catch {
      // abaikan, gunakan default
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const onUpdated = () => {
      void reload();
    };
    window.addEventListener("options-updated", onUpdated);
    window.dispatchEvent(new Event("options-updated"));
    return () => window.removeEventListener("options-updated", onUpdated);
  }, [reload]);

  return { lines, pics, loading, reload };
}

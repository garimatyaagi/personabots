"use client";

import { useState, useEffect, useRef } from "react";

interface SlugCheck {
  checking: boolean;
  available: boolean | null;
  reason?: string;
}

export function useSlugCheck(slug: string): SlugCheck {
  const [state, setState] = useState<SlugCheck>({
    checking: false,
    available: null,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Reset if slug is too short
    if (!slug || slug.length < 2) {
      setState({ checking: false, available: null });
      return;
    }

    setState((s) => ({ ...s, checking: true }));

    // Debounce the check
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/bots/check-slug?slug=${encodeURIComponent(slug)}`);
        const data = await res.json();
        setState({
          checking: false,
          available: data.available,
          reason: data.reason,
        });
      } catch {
        setState({ checking: false, available: null });
      }
    }, 400);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [slug]);

  return state;
}

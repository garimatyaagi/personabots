"use client";

import { useEffect, useState } from "react";

export function useSubscription() {
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch("/api/subscription/status");
        if (!res.ok) throw new Error("Failed to check subscription");
        const data = await res.json();
        if (!cancelled) setIsActive(data.isActive);
      } catch {
        if (!cancelled) setIsActive(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  return { isActive, loading };
}

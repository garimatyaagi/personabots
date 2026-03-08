"use client";

import { useEffect, useState, useCallback } from "react";
import type { PlanType } from "@/types";

export function useSubscription() {
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [planType, setPlanType] = useState<PlanType>("creator");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const check = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/subscription/status");
      if (!res.ok) throw new Error("Failed to check subscription");
      const data = await res.json();
      setIsActive(data.isActive);
      setPlanType(data.planType || "creator");
    } catch {
      setIsActive(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  return { isActive, planType, loading, error, retry: check };
}

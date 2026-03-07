import { createServerClient } from "@/lib/supabase/server";
import type { Subscription } from "@/types";

export async function getActiveSubscription(
  userId: string
): Promise<Subscription | null> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["active", "authenticated"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  return data;
}

export function isSubscriptionValid(sub: Subscription | null): boolean {
  if (!sub) return false;
  if (sub.status !== "active" && sub.status !== "authenticated") return false;
  if (sub.current_period_end) {
    return new Date(sub.current_period_end) > new Date();
  }
  return true;
}

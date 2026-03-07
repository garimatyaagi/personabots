import { createServerClient } from "@/lib/supabase/server";
import { getRazorpay } from "@/lib/razorpay";
import type { Subscription } from "@/types";

/**
 * Get a subscription with status "active" or "authenticated".
 * Uses .maybeSingle() so it returns null (instead of throwing) when 0 rows match.
 */
export async function getActiveSubscription(
  userId: string
): Promise<Subscription | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["active", "authenticated"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getActiveSubscription error:", error.message);
    return null;
  }
  return data;
}

/**
 * If no active subscription is found, check for a "created" subscription
 * and verify its real status via Razorpay API. If it turns out to be active,
 * update the DB row and return it.
 *
 * This handles the case where a Razorpay webhook didn't fire (or failed)
 * after the user completed payment.
 */
export async function recoverSubscriptionIfPaid(
  userId: string
): Promise<Subscription | null> {
  const supabase = createServerClient();

  // Find the most recent "created" subscription
  const { data: pending, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "created")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !pending || !pending.razorpay_subscription_id) {
    return null;
  }

  // Ask Razorpay for the real status
  try {
    const razorpay = getRazorpay();
    const rzpSub = await razorpay.subscriptions.fetch(
      pending.razorpay_subscription_id
    );

    // Razorpay statuses: created, authenticated, active, pending, halted, cancelled, completed, expired, paused
    if (rzpSub.status === "active" || rzpSub.status === "authenticated") {
      // Update our DB to match reality
      const { data: updated, error: updateError } = await supabase
        .from("subscriptions")
        .update({
          status: rzpSub.status,
          current_period_end: rzpSub.current_end
            ? new Date(rzpSub.current_end * 1000).toISOString()
            : null,
        })
        .eq("id", pending.id)
        .select("*")
        .maybeSingle();

      if (updateError) {
        console.error("Failed to recover subscription:", updateError.message);
        return null;
      }
      return updated;
    }
  } catch (err) {
    console.error(
      "Razorpay fetch failed during recovery:",
      err instanceof Error ? err.message : err
    );
  }

  return null;
}

export function isSubscriptionValid(sub: Subscription | null): boolean {
  if (!sub) return false;
  if (sub.status !== "active" && sub.status !== "authenticated") return false;
  if (sub.current_period_end) {
    return new Date(sub.current_period_end) > new Date();
  }
  return true;
}

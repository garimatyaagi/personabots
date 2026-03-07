import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";
import { getRazorpay } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServerClient();

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .in("status", ["active", "authenticated"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!subscription) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // Cancel at end of billing period
    const razorpay = getRazorpay();
    await (razorpay.subscriptions as any).cancel(
      subscription.razorpay_subscription_id,
      true // cancel_at_cycle_end
    );

    // Update DB
    await supabase
      .from("subscriptions")
      .update({ cancelled_at: new Date().toISOString() })
      .eq("id", subscription.id);

    return NextResponse.json({
      success: true,
      message: "Subscription will be cancelled at end of current billing period",
      ends_at: subscription.current_period_end,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Subscription cancel error:", msg);
    return NextResponse.json(
      { error: `Cancellation failed: ${msg}` },
      { status: 500 }
    );
  }
}

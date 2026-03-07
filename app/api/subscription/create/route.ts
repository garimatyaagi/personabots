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

    // Check if user already has an active subscription
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .in("status", ["active", "authenticated"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        subscription_id: existing.razorpay_subscription_id,
        already_active: true,
      });
    }

    // Create Razorpay subscription
    const planId = process.env.RAZORPAY_PLAN_ID;
    if (!planId) {
      throw new Error("Missing RAZORPAY_PLAN_ID");
    }

    const razorpay = getRazorpay();
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: 120, // max billing cycles
      customer_notify: 1,
    });

    // Save to DB
    const { error: dbError } = await supabase.from("subscriptions").insert({
      user_id: userId,
      razorpay_subscription_id: subscription.id,
      razorpay_plan_id: planId,
      status: "created",
    });

    if (dbError) {
      console.error("Failed to save subscription:", dbError);
      return NextResponse.json(
        { error: `Failed to save subscription: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      subscription_id: subscription.id,
      already_active: false,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Subscription create error:", msg);
    return NextResponse.json(
      { error: `Subscription creation failed: ${msg}` },
      { status: 500 }
    );
  }
}

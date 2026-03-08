import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";
import { getRazorpay } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Parse plan type from body (default to "creator" for backwards compatibility)
    let planType = "creator";
    try {
      const body = await req.json();
      if (body.plan_type === "recruiter") {
        planType = "recruiter";
      }
    } catch {
      // No body or invalid JSON - default to creator
    }

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

    // Select the appropriate plan ID
    const planId =
      planType === "recruiter"
        ? process.env.RAZORPAY_RECRUITER_PLAN_ID || process.env.RAZORPAY_PLAN_ID
        : process.env.RAZORPAY_PLAN_ID;

    if (!planId) {
      throw new Error("Missing RAZORPAY_PLAN_ID");
    }

    const razorpay = getRazorpay();
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: 120,
      customer_notify: 1,
    });

    // Save to DB with plan_type
    const { error: dbError } = await supabase.from("subscriptions").insert({
      user_id: userId,
      razorpay_subscription_id: subscription.id,
      razorpay_plan_id: planId,
      plan_type: planType,
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

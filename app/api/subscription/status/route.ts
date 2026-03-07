import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getActiveSubscription,
  isSubscriptionValid,
  recoverSubscriptionIfPaid,
} from "@/lib/subscription";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Check for an already-active subscription in the DB
    let subscription = await getActiveSubscription(userId);
    let isActive = isSubscriptionValid(subscription);

    // 2. If nothing active in DB, check if there's a "created" sub that Razorpay
    //    has actually activated (webhook may have failed or not arrived yet).
    if (!isActive) {
      const recovered = await recoverSubscriptionIfPaid(userId);
      if (recovered) {
        subscription = recovered;
        isActive = isSubscriptionValid(recovered);
      }
    }

    return NextResponse.json({
      isActive,
      subscription: subscription
        ? {
            status: subscription.status,
            current_period_end: subscription.current_period_end,
            cancelled_at: subscription.cancelled_at,
          }
        : null,
    });
  } catch (error) {
    console.error(
      "Subscription status error:",
      error instanceof Error ? error.message : error
    );
    // Return 500 so the hook recognises this as an error (not "not subscribed")
    return NextResponse.json(
      { error: "Failed to check subscription status" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getActiveSubscription, isSubscriptionValid } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const subscription = await getActiveSubscription(userId);
    const isActive = isSubscriptionValid(subscription);

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
  } catch {
    return NextResponse.json({ isActive: false, subscription: null });
  }
}

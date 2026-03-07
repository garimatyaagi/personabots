import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServerClient();

    // Get user's subscriptions
    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId);

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ payments: [] });
    }

    const subIds = subscriptions.map((s) => s.id);

    // Get payments for those subscriptions
    const { data: payments } = await supabase
      .from("payments")
      .select("*")
      .in("subscription_id", subIds)
      .order("created_at", { ascending: false })
      .limit(50);

    return NextResponse.json({ payments: payments || [] });
  } catch {
    return NextResponse.json({ payments: [] });
  }
}

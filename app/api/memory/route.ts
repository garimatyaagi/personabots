import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";

// GET /api/memory — list user's memory items
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const botId = searchParams.get("botId");

  const supabase = createServerClient();

  let query = supabase
    .from("memory_items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (botId) {
    // Get bot-specific + personal memory
    query = query.or(`bot_id.eq.${botId},bot_id.is.null`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Failed to fetch memory" }, { status: 500 });
  }

  return NextResponse.json({ items: data || [] });
}

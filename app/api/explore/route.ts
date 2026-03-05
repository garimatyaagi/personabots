import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/explore — list public bots
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";

  const supabase = createServerClient();

  let query = supabase
    .from("bots")
    .select(
      `
      id,
      name,
      slug,
      description,
      avatar_url,
      tone,
      is_public,
      created_at,
      user_id,
      use_cases:bot_use_cases(type),
      share_links(access)
    `
    )
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(50);

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data: bots, error } = await query;

  if (error) {
    console.error("Explore fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch bots" }, { status: 500 });
  }

  // Filter: only include bots whose share_link is not "private"
  let filtered = (bots || []).filter((bot) => {
    const access = bot.share_links?.[0]?.access;
    return access !== "private";
  });

  // Filter by category if provided
  if (category) {
    filtered = filtered.filter((bot) => {
      const type = bot.use_cases?.[0]?.type;
      return type === category;
    });
  }

  return NextResponse.json({ bots: filtered });
}

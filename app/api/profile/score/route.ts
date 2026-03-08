import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";
import { analyzeProfile, saveProfileScore } from "@/lib/ai/profile-scorer";

export const dynamic = "force-dynamic";

// GET: Return the latest cached profile score
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServerClient();

    // Get user's primary bot (first published or first created)
    const { data: bot } = await supabase
      .from("bots")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    const botId = bot?.id || null;

    // Get cached score
    const query = supabase
      .from("profile_scores")
      .select("*")
      .eq("user_id", userId);

    if (botId) {
      query.eq("bot_id", botId);
    } else {
      query.is("bot_id", null);
    }

    const { data: score } = await query.maybeSingle();

    return NextResponse.json({
      score: score || null,
      bot_id: botId,
    });
  } catch (error) {
    console.error(
      "Profile score GET error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Failed to fetch profile score" },
      { status: 500 }
    );
  }
}

// POST: Trigger a re-analysis of the profile
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const supabase = createServerClient();

    // Use specified bot_id or find the primary bot
    let botId = (body as { bot_id?: string }).bot_id || null;
    if (!botId) {
      const { data: bot } = await supabase
        .from("bots")
        .select("id")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      botId = bot?.id || null;
    }

    // Run the analysis
    const result = await analyzeProfile(userId, botId);

    // Save to DB
    await saveProfileScore(userId, botId, result);

    return NextResponse.json({
      score: {
        overall_score: result.overall_score,
        dimensions: result.dimensions,
        suggestions: result.suggestions,
        analyzed_memory_count: result.analyzed_memory_count,
        analyzed_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error(
      "Profile score POST error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Failed to analyze profile" },
      { status: 500 }
    );
  }
}

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

    // Get the latest profile score for this user
    const { data: score } = await supabase
      .from("profile_scores")
      .select("suggestions, overall_score, dimensions, analyzed_at")
      .eq("user_id", userId)
      .order("analyzed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!score) {
      return NextResponse.json({
        suggestions: [],
        overall_score: null,
        message: "No profile analysis found. Run an analysis first.",
      });
    }

    return NextResponse.json({
      suggestions: score.suggestions || [],
      overall_score: score.overall_score,
      dimensions: score.dimensions,
      analyzed_at: score.analyzed_at,
    });
  } catch (error) {
    console.error(
      "Profile suggestions error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}

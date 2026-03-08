import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";
import { scoreJobMatch } from "@/lib/ai/job-matcher";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ jobId: string }>;
}

// POST: Score how well a job matches the user's profile
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { jobId } = await params;
    const supabase = createServerClient();

    // Fetch the job
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", userId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Get the user's first bot for memory retrieval
    const { data: bots } = await supabase
      .from("bots")
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    const botId = bots?.[0]?.id || null;

    // Score the match
    const result = await scoreJobMatch({
      userId,
      botId,
      jobTitle: job.title,
      jobDescription: job.description,
      requirements: job.requirements || [],
    });

    // Persist the score and analysis back to the job row
    await supabase
      .from("jobs")
      .update({
        match_score: result.match_score,
        match_analysis: result.match_analysis,
      })
      .eq("id", jobId);

    return NextResponse.json({
      match_score: result.match_score,
      match_analysis: result.match_analysis,
    });
  } catch (error) {
    console.error(
      "Job match error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Failed to score job match" },
      { status: 500 }
    );
  }
}

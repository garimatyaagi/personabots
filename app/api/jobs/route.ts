import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";
import { parseJobDescription } from "@/lib/ai/job-parser";
import { scoreJobMatch } from "@/lib/ai/job-matcher";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createJobSchema = z.object({
  rawInput: z.string().min(20, "Job description must be at least 20 characters"),
  source: z.enum(["paste", "url"]).default("paste"),
});

// GET: List user's non-dismissed jobs
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServerClient();
    const stage = req.nextUrl.searchParams.get("stage");
    const showDismissed = req.nextUrl.searchParams.get("dismissed") === "true";

    let query = supabase
      .from("jobs")
      .select(
        `
        *,
        applications (
          id, stage, notes, applied_at, created_at, updated_at
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!showDismissed) {
      query = query.eq("is_dismissed", false);
    }

    const { data: jobs, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    // If filtering by application stage, filter in memory
    let result = jobs || [];
    if (stage) {
      result = result.filter((job) => {
        const app = job.applications?.[0];
        return app && app.stage === stage;
      });
    }

    // Transform to flatten applications
    const transformed = result.map((job) => ({
      ...job,
      application: job.applications?.[0] || null,
      applications: undefined,
    }));

    return NextResponse.json({ jobs: transformed });
  } catch (error) {
    console.error(
      "Jobs GET error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

// POST: Create a new job from pasted text
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = createJobSchema.parse(body);

    // Parse the job description with AI
    const parsed = await parseJobDescription(validated.rawInput);

    const supabase = createServerClient();

    // Store the job
    const { data: job, error } = await supabase
      .from("jobs")
      .insert({
        user_id: userId,
        title: parsed.title || "Untitled Position",
        company: parsed.company,
        location: parsed.location,
        description: validated.rawInput,
        requirements: parsed.requirements,
        source: validated.source,
        raw_input: validated.rawInput,
        metadata: {
          seniority: parsed.seniority,
          job_type: parsed.job_type,
          salary_range: parsed.salary_range,
        },
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Also create an application record in "discovered" stage
    await supabase.from("applications").insert({
      user_id: userId,
      job_id: job.id,
      stage: "discovered",
    });

    // Trigger match scoring in the background (non-blocking)
    const { data: bots } = await supabase
      .from("bots")
      .select("id")
      .eq("user_id", userId)
      .limit(1);
    const botId = bots?.[0]?.id || null;

    // Fire-and-forget match scoring — don't block the response
    scoreJobMatch({
      userId,
      botId,
      jobTitle: job.title,
      jobDescription: job.description,
      requirements: job.requirements || [],
    })
      .then(async (result) => {
        await supabase
          .from("jobs")
          .update({
            match_score: result.match_score,
            match_analysis: result.match_analysis,
          })
          .eq("id", job.id);
      })
      .catch((err) => {
        console.error("Background match scoring failed:", err);
      });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error(
      "Jobs POST error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}

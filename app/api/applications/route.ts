import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createAppSchema = z.object({
  job_id: z.string().uuid(),
  stage: z
    .enum([
      "discovered",
      "saved",
      "tailored",
      "applied",
      "interview",
      "offer",
      "archived",
    ])
    .default("saved"),
});

// GET: List user's applications with job data
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServerClient();
    const stage = req.nextUrl.searchParams.get("stage");

    let query = supabase
      .from("applications")
      .select(
        `
        *,
        jobs (
          id, title, company, location, match_score, match_analysis, requirements, metadata, created_at
        )
      `
      )
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (stage) {
      query = query.eq("stage", stage);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ applications: data || [] });
  } catch (error) {
    console.error(
      "Applications GET error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

// POST: Create or upsert an application
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = createAppSchema.parse(body);
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("applications")
      .upsert(
        {
          user_id: userId,
          job_id: validated.job_id,
          stage: validated.stage,
          applied_at:
            validated.stage === "applied" ? new Date().toISOString() : undefined,
        },
        { onConflict: "user_id,job_id" }
      )
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ application: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error(
      "Applications POST error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}

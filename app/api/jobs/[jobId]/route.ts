import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ jobId: string }>;
}

// GET: Full job detail with tailored content and application
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { jobId } = await params;
    const supabase = createServerClient();

    const { data: job, error } = await supabase
      .from("jobs")
      .select(
        `
        *,
        applications (
          id, stage, notes, applied_at, created_at, updated_at
        ),
        tailored_content (
          id, content_type, content, is_edited, created_at, updated_at
        )
      `
      )
      .eq("id", jobId)
      .eq("user_id", userId)
      .single();

    if (error || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({
      job: {
        ...job,
        application: job.applications?.[0] || null,
        tailored_content: job.tailored_content || [],
        applications: undefined,
      },
    });
  } catch (error) {
    console.error(
      "Job GET error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}

// PATCH: Update job fields
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { jobId } = await params;
    const body = await req.json();
    const supabase = createServerClient();

    // Only allow updating specific fields
    const allowedFields = ["is_dismissed", "title", "company", "location", "metadata"];
    const updates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in body) {
        updates[key] = body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const { data: job, error } = await supabase
      .from("jobs")
      .update(updates)
      .eq("id", jobId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error(
      "Job PATCH error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a job (cascades to tailored_content and applications)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { jobId } = await params;
    const supabase = createServerClient();

    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", jobId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "Job DELETE error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}

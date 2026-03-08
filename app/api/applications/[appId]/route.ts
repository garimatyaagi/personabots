import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ appId: string }>;
}

// PATCH: Update application stage, notes, etc.
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { appId } = await params;
    const body = await req.json();
    const supabase = createServerClient();

    const allowedFields = ["stage", "notes", "applied_at", "metadata"];
    const updates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in body) {
        updates[key] = body[key];
      }
    }

    // Auto-set applied_at when stage changes to "applied"
    if (updates.stage === "applied" && !updates.applied_at) {
      updates.applied_at = new Date().toISOString();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("applications")
      .update(updates)
      .eq("id", appId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ application: data });
  } catch (error) {
    console.error(
      "Application PATCH error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ contentId: string }>;
}

// PATCH /api/tailoring/:contentId — update tailored content
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { contentId } = await params;
    const body = await req.json();
    const supabase = createServerClient();

    const updates: Record<string, unknown> = {};

    if (typeof body.content === "string") {
      updates.content = body.content;
    }
    if (typeof body.is_edited === "boolean") {
      updates.is_edited = body.is_edited;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("tailored_content")
      .update(updates)
      .eq("id", contentId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ content: data });
  } catch (error) {
    console.error(
      "Tailored content PATCH error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Failed to update content" },
      { status: 500 }
    );
  }
}

// DELETE /api/tailoring/:contentId — delete tailored content
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { contentId } = await params;
    const supabase = createServerClient();

    const { error } = await supabase
      .from("tailored_content")
      .delete()
      .eq("id", contentId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "Tailored content DELETE error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Failed to delete content" },
      { status: 500 }
    );
  }
}

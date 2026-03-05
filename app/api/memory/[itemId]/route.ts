import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";

// PATCH /api/memory/:itemId — update memory item (shareability, title, bot assignment)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemId } = await params;
  const supabase = createServerClient();

  // Verify ownership
  const { data: existing } = await supabase
    .from("memory_items")
    .select("user_id")
    .eq("id", itemId)
    .single();

  if (!existing || existing.user_id !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const updates: Record<string, unknown> = {};

  if (typeof body.is_shareable === "boolean") {
    updates.is_shareable = body.is_shareable;
  }
  if (typeof body.title === "string") {
    updates.title = body.title;
  }
  if (body.bot_id !== undefined) {
    updates.bot_id = body.bot_id;
  }

  const { data, error } = await supabase
    .from("memory_items")
    .update(updates)
    .eq("id", itemId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  // Also update embeddings shareability
  if (typeof body.is_shareable === "boolean") {
    await supabase
      .from("embeddings")
      .update({ is_shareable: body.is_shareable })
      .eq("memory_item_id", itemId);
  }

  return NextResponse.json({ item: data });
}

// DELETE /api/memory/:itemId — delete memory item and its embeddings
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemId } = await params;
  const supabase = createServerClient();

  const { data: existing } = await supabase
    .from("memory_items")
    .select("user_id")
    .eq("id", itemId)
    .single();

  if (!existing || existing.user_id !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Cascade will handle embeddings
  const { error } = await supabase
    .from("memory_items")
    .delete()
    .eq("id", itemId);

  if (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

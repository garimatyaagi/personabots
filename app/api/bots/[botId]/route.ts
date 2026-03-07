import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

// GET /api/bots/:botId — get bot details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { botId } = await params;
  const supabase = createServerClient();

  const { data: bot, error } = await supabase
    .from("bots")
    .select(
      `
      *,
      use_cases:bot_use_cases(*),
      share_links(*)
    `
    )
    .eq("id", botId)
    .single();

  if (error || !bot) {
    return NextResponse.json({ error: "Bot not found" }, { status: 404 });
  }

  return NextResponse.json({ bot });
}

const socialLinksSchema = z.object({
  linkedin: z.string().max(500).optional().or(z.literal("")),
  twitter: z.string().max(500).optional().or(z.literal("")),
  github: z.string().max(500).optional().or(z.literal("")),
  website: z.string().max(500).optional().or(z.literal("")),
});

const customLinkSchema = z.object({
  label: z.string().max(100),
  url: z.string().max(500),
  icon: z.string().max(50).optional(),
});

const updateBotSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  tone: z.number().min(0).max(100).optional(),
  personality_traits: z.record(z.boolean()).optional(),
  headline: z.string().max(200).optional().nullable(),
  social_links: socialLinksSchema.optional(),
  skills: z.array(z.string().max(50)).max(20).optional(),
  about: z.string().max(2000).optional().nullable(),
  avatar_url: z.string().max(500).optional().nullable(),
  theme: z.enum(["default", "ocean", "forest", "sunset", "midnight", "lavender", "rose"]).optional(),
  custom_links: z.array(customLinkSchema).max(10).optional(),
  highlights: z.array(z.string().max(200)).max(10).optional(),
  is_public: z.boolean().optional(),
});

// PATCH /api/bots/:botId — update bot
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { botId } = await params;
  const supabase = createServerClient();

  // Verify ownership
  const { data: existing } = await supabase
    .from("bots")
    .select("user_id")
    .eq("id", botId)
    .single();

  if (!existing || existing.user_id !== userId) {
    return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = updateBotSchema.parse(body);

    const { data: bot, error } = await supabase
      .from("bots")
      .update(parsed)
      .eq("id", botId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ bot });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/bots/:botId
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { botId } = await params;
  const supabase = createServerClient();

  const { data: existing } = await supabase
    .from("bots")
    .select("user_id")
    .eq("id", botId)
    .single();

  if (!existing || existing.user_id !== userId) {
    return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
  }

  const { error } = await supabase.from("bots").delete().eq("id", botId);

  if (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

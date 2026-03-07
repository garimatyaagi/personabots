import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";
import { getActiveSubscription, isSubscriptionValid } from "@/lib/subscription";
import { z } from "zod";

export const dynamic = "force-dynamic";

const socialLinksSchema = z.object({
  linkedin: z.string().max(500).optional().or(z.literal("")),
  twitter: z.string().max(500).optional().or(z.literal("")),
  github: z.string().max(500).optional().or(z.literal("")),
  website: z.string().max(500).optional().or(z.literal("")),
}).default({});

const createBotSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().max(500).optional(),
  tone: z.number().min(0).max(100).default(50),
  personality_traits: z.record(z.boolean()).default({}),
  headline: z.string().max(200).optional(),
  social_links: socialLinksSchema.optional(),
  skills: z.array(z.string().max(50)).max(20).default([]),
  about: z.string().max(2000).optional(),
  is_public: z.boolean().default(false),
  use_case_type: z.enum([
    "hiring",
    "networking",
    "investor",
    "dating",
    "support",
    "custom",
  ]),
  use_case_config: z.record(z.unknown()).default({}),
  access: z.enum(["public", "unlisted", "private"]).default("private"),
});

// GET /api/bots — list user's bots
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();

  // Ensure user exists in our DB
  await supabase.from("users").upsert(
    { id: userId, email: "" },
    { onConflict: "id", ignoreDuplicates: true }
  );

  const { data: bots, error } = await supabase
    .from("bots")
    .select(
      `
      *,
      use_cases:bot_use_cases(*),
      share_links(*)
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch bots:", error);
    return NextResponse.json({ error: "Failed to fetch bots" }, { status: 500 });
  }

  return NextResponse.json({ bots: bots || [] });
}

// POST /api/bots — create a new bot
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Subscription gate — must have active subscription to create bots
    const subscription = await getActiveSubscription(userId);
    if (!isSubscriptionValid(subscription)) {
      return NextResponse.json(
        { error: "Active subscription required to create bots", code: "SUBSCRIPTION_REQUIRED" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = createBotSchema.parse(body);
    const supabase = createServerClient();

    // Ensure user exists
    const { error: userError } = await supabase.from("users").upsert(
      { id: userId, email: "" },
      { onConflict: "id", ignoreDuplicates: true }
    );

    if (userError) {
      console.error("User upsert failed:", userError);
      return NextResponse.json(
        { error: `Database setup issue: ${userError.message}`, hint: userError.hint, code: userError.code },
        { status: 500 }
      );
    }

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from("bots")
      .select("id")
      .eq("slug", parsed.slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "This slug is already taken" },
        { status: 409 }
      );
    }

    // Create bot
    const { data: bot, error: botError } = await supabase
      .from("bots")
      .insert({
        user_id: userId,
        name: parsed.name,
        slug: parsed.slug,
        description: parsed.description || null,
        tone: parsed.tone,
        personality_traits: parsed.personality_traits,
        headline: parsed.headline || null,
        social_links: parsed.social_links || {},
        skills: parsed.skills || [],
        about: parsed.about || null,
        is_public: parsed.is_public,
      })
      .select()
      .single();

    if (botError || !bot) {
      console.error("Failed to create bot:", botError);
      return NextResponse.json(
        { error: `Failed to create bot: ${botError?.message || "Unknown error"}`, code: botError?.code, hint: botError?.hint },
        { status: 500 }
      );
    }

    // Create use case
    const { error: ucError } = await supabase.from("bot_use_cases").insert({
      bot_id: bot.id,
      type: parsed.use_case_type,
      config: parsed.use_case_config,
    });

    if (ucError) {
      console.error("Failed to create use case:", ucError);
    }

    // Create share link
    const { error: slError } = await supabase.from("share_links").insert({
      bot_id: bot.id,
      slug: parsed.slug,
      access: parsed.access,
    });

    if (slError) {
      console.error("Failed to create share link:", slError);
    }

    return NextResponse.json({ bot }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Create bot error:", msg, error);
    return NextResponse.json(
      { error: `Bot creation failed: ${msg}` },
      { status: 500 }
    );
  }
}

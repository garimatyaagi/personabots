import { createServerClient } from "@/lib/supabase/server";
import { getPlaybook } from "@/lib/playbooks";
import { PublicBotClient } from "./client";
import { notFound } from "next/navigation";
import type { BotMode } from "@/lib/chat/prompts";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mode?: string }>;
}

const VALID_MODES: BotMode[] = ["default", "hiring", "consulting"];

export default async function PublicBotPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { mode: modeParam } = await searchParams;
  const supabase = createServerClient();

  // Validate mode from query param
  const initialMode: BotMode = VALID_MODES.includes(modeParam as BotMode)
    ? (modeParam as BotMode)
    : "default";

  // Fetch bot by slug
  const { data: bot, error: botError } = await supabase
    .from("bots")
    .select(
      `
      *,
      use_cases:bot_use_cases(*),
      share_links(*)
    `
    )
    .eq("slug", slug)
    .single();

  if (botError) {
    console.error("Public bot fetch error:", botError.message, botError.code);
  }

  if (!bot) notFound();

  // Check access
  const shareLink = bot.share_links?.[0];
  if (shareLink?.access === "private") notFound();

  const useCase = bot.use_cases?.[0];
  const playbook = useCase ? getPlaybook(useCase.type) : null;

  return (
    <PublicBotClient
      bot={{
        name: bot.name,
        slug: bot.slug,
        description: bot.description,
        avatar_url: bot.avatar_url,
        tone: bot.tone,
        headline: bot.headline || null,
        social_links: bot.social_links || {},
        skills: bot.skills || [],
        about: bot.about || null,
        theme: bot.theme || "default",
        custom_links: bot.custom_links || [],
        highlights: bot.highlights || [],
      }}
      capabilities={playbook?.capabilities || []}
      suggestedPrompts={playbook?.suggested_prompts || []}
      useCaseType={useCase?.type || "custom"}
      initialMode={initialMode}
    />
  );
}

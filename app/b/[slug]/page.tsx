import { createServerClient } from "@/lib/supabase/server";
import { getPlaybook } from "@/lib/playbooks";
import { PublicBotClient } from "./client";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PublicBotPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createServerClient();

  // Fetch bot by slug
  const { data: bot } = await supabase
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
      }}
      capabilities={playbook?.capabilities || []}
      suggestedPrompts={playbook?.suggested_prompts || []}
      useCaseType={useCase?.type || "custom"}
    />
  );
}

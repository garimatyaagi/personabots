import { getOpenAI } from "@/lib/openai";
import { createServerClient } from "@/lib/supabase/server";
import { retrieveMemory, formatMemoryContext } from "@/lib/memory/retriever";
import { buildSystemPrompt, summarizeConversation } from "./prompts";
import type { BotMode } from "./prompts";
import type { Bot, BotUseCase, Message } from "@/types";

export async function createChatStream(params: {
  bot: Bot;
  useCase: BotUseCase | null;
  conversationId: string;
  userMessage: string;
  isPublic: boolean;
  mode?: BotMode;
}) {
  const { bot, useCase, conversationId, userMessage, isPublic, mode } = params;
  const supabase = createServerClient();
  const openai = getOpenAI();

  // 1. Store user message
  await supabase.from("messages").insert({
    conversation_id: conversationId,
    role: "user",
    content: userMessage,
  });

  // 2. Get conversation history
  const { data: history } = await supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(50);

  // 3. Retrieve relevant memory — fetch more chunks for richer context
  const memoryResults = await retrieveMemory({
    userId: bot.user_id,
    botId: bot.id,
    query: userMessage,
    topK: 12,
    publicOnly: isPublic,
    similarityThreshold: 0.25,
  });

  const memoryContext = formatMemoryContext(memoryResults);

  // 4. Build system prompt
  const systemPrompt = buildSystemPrompt({
    bot,
    useCase,
    memoryContext,
    mode,
  });

  // 5. Build message list
  const conversationSummary = summarizeConversation(history || []);
  const recentHistory = (history || []).slice(-8);

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemPrompt },
  ];

  if (conversationSummary) {
    messages.push({ role: "system", content: conversationSummary });
  }

  for (const msg of recentHistory) {
    if (msg.role === "user" || msg.role === "assistant") {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  // Ensure last message is the current user message
  if (
    messages[messages.length - 1]?.content !== userMessage ||
    messages[messages.length - 1]?.role !== "user"
  ) {
    messages.push({ role: "user", content: userMessage });
  }

  // 6. Stream response — gpt-4o for quality, low temp for factual grounding
  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    stream: true,
    max_tokens: 4000,
    temperature: 0.4,
  });

  return stream;
}

export async function storeAssistantMessage(
  conversationId: string,
  content: string
) {
  const supabase = createServerClient();
  await supabase.from("messages").insert({
    conversation_id: conversationId,
    role: "assistant",
    content,
  });
}

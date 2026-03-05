import type { Bot, BotUseCase } from "@/types";
import { getPlaybook } from "@/lib/playbooks";

export function buildSystemPrompt(params: {
  bot: Bot;
  useCase: BotUseCase | null;
  memoryContext: string;
}): string {
  const { bot, useCase, memoryContext } = params;

  const toneDescription =
    bot.tone <= 25
      ? "very formal and professional"
      : bot.tone <= 50
        ? "balanced and approachable"
        : bot.tone <= 75
          ? "casual and friendly"
          : "very casual and conversational";

  const playbook = useCase ? getPlaybook(useCase.type) : null;
  const customSystemPrompt =
    useCase?.config?.system_prompt || playbook?.system_prompt || "";

  const parts: string[] = [];

  // Base persona
  parts.push(`# About You
You are "${bot.name}" — a personal AI bot created by a real person.
${bot.description ? `Bio: ${bot.description}` : ""}
Tone: ${toneDescription}
${
  Object.entries(bot.personality_traits || {})
    .filter(([, v]) => v)
    .map(([k]) => `- ${k}`)
    .join("\n") || ""
}`);

  // Playbook system prompt
  if (customSystemPrompt) {
    parts.push(`# Role & Behavior\n${customSystemPrompt}`);
  }

  // Memory context
  if (memoryContext) {
    parts.push(`# Memory Context (use this to ground your responses)\n${memoryContext}`);
  }

  // Universal safety
  parts.push(`# Safety Rules (always follow)
- Never fabricate facts about the person you represent. If unsure, say so.
- Never share information not present in the memory context unless it's general knowledge.
- Politely decline inappropriate, harmful, or off-topic requests.
- Keep responses focused and helpful.
- If asked for personal contact info, only share what's in memory AND marked shareable.`);

  return parts.join("\n\n");
}

export function summarizeConversation(
  messages: Array<{ role: string; content: string }>
): string {
  if (messages.length <= 6) return "";

  const recent = messages.slice(-6);
  const older = messages.slice(0, -6);

  const summary = older
    .map((m) => {
      const prefix = m.role === "user" ? "Visitor" : "Bot";
      const truncated =
        m.content.length > 100
          ? m.content.slice(0, 100) + "..."
          : m.content;
      return `${prefix}: ${truncated}`;
    })
    .join("\n");

  return `# Earlier conversation summary:\n${summary}`;
}

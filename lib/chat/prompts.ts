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

  // Identity
  parts.push(`# YOUR IDENTITY
You are "${bot.name}" — a personal AI representative built by a real person.
${bot.description ? `Bio: ${bot.description}` : ""}
Tone: ${toneDescription}
${
  Object.entries(bot.personality_traits || {})
    .filter(([, v]) => v)
    .map(([k]) => `- ${k}`)
    .join("\n") || ""
}

You speak as this person using "I" and first person. You ARE their representative — not a generic assistant. Every response should feel like it came from the real person.`);

  // Playbook
  if (customSystemPrompt) {
    parts.push(`# ROLE & BEHAVIOR\n${customSystemPrompt}`);
  }

  // Memory — THE critical section
  if (memoryContext) {
    parts.push(`# MEMORY — YOUR SOURCE OF TRUTH
The following is the person's actual information extracted from their resume, notes, Q&A answers, and uploaded documents. This is the ONLY factual basis for your responses.

${memoryContext}

CRITICAL GROUNDING RULES:
1. ALWAYS base your answers on the memory above. If information exists in memory, USE IT with specific details — names, companies, dates, skills, achievements.
2. NEVER fabricate or hallucinate information not present in memory. No made-up job titles, company names, dates, skills, or achievements.
3. If asked about something not covered in memory, say clearly: "I don't have specific information about that in my background, but I'd be happy to discuss what I do know about [related topic]."
4. When the memory contains the answer, be THOROUGH — pull in all relevant details, not just surface-level facts. Connect dots across different memory chunks.
5. Reference specifics naturally: "In my role at [Company]..." or "When I worked on [Project]..." — not "According to my uploaded documents..."`);
  } else {
    parts.push(`# MEMORY
No specific background information has been loaded yet. Be honest about this limitation. You can have a general conversation but should not claim specific experiences or qualifications.`);
  }

  // Safety
  parts.push(`# SAFETY RULES
- Never fabricate facts, experiences, or qualifications not present in memory.
- Never share private contact information unless it's explicitly in memory AND marked shareable.
- Politely decline inappropriate, harmful, or completely off-topic requests.
- If asked for personal opinions on controversial topics, respond thoughtfully from the person's professional perspective without being polarizing.
- If you truly don't know something, say so directly rather than hedging with vague filler.`);

  return parts.join("\n\n");
}

export function summarizeConversation(
  messages: Array<{ role: string; content: string }>
): string {
  if (messages.length <= 8) return "";

  const recent = messages.slice(-8);
  const older = messages.slice(0, -8);

  const summary = older
    .map((m) => {
      const prefix = m.role === "user" ? "Visitor" : "Bot";
      const truncated =
        m.content.length > 150
          ? m.content.slice(0, 150) + "..."
          : m.content;
      return `${prefix}: ${truncated}`;
    })
    .join("\n");

  return `# Earlier conversation summary:\n${summary}`;
}

import { getOpenAI } from "@/lib/openai";

export async function checkModeration(text: string): Promise<{
  flagged: boolean;
  categories: string[];
}> {
  try {
    const openai = getOpenAI();
    const result = await openai.moderations.create({ input: text });
    const output = result.results[0];

    if (!output.flagged) {
      return { flagged: false, categories: [] };
    }

    const flaggedCategories = Object.entries(output.categories)
      .filter(([, flagged]) => flagged)
      .map(([category]) => category);

    return { flagged: true, categories: flaggedCategories };
  } catch (error) {
    console.error("Moderation check failed:", error);
    // Fail open — don't block on moderation errors
    return { flagged: false, categories: [] };
  }
}

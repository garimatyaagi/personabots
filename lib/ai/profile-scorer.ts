import { getOpenAI } from "@/lib/openai";
import { createServerClient } from "@/lib/supabase/server";
import type { ProfileDimensions, ProfileSuggestion } from "@/types";

interface ProfileScoreResult {
  overall_score: number;
  dimensions: ProfileDimensions;
  suggestions: ProfileSuggestion[];
  analyzed_memory_count: number;
}

const SCORING_PROMPT = `You are an expert career coach analyzing a professional profile.

Analyze the following profile content across these 7 dimensions. Score each from 0 to 100:

1. **clarity**: How clear is the professional positioning? Is it obvious what this person does and who they serve?
2. **credibility**: Are claims backed by named companies, roles, timelines, and verifiable details?
3. **proof**: Are there quantified achievements (numbers, metrics, percentages, results)?
4. **role_relevance**: How well does the content target specific roles or industries?
5. **keyword_coverage**: Does it include industry-standard terms, tools, frameworks, and technologies?
6. **differentiation**: What makes this person stand out? Is there a unique angle or specialization?
7. **completeness**: Are there obvious gaps (no education, no skills listed, short work history, missing sections)?

For each dimension scoring below 80, provide 1-2 specific, actionable improvement suggestions.

Return a JSON object with this exact structure:
{
  "overall_score": <weighted average of all dimensions, 0-100>,
  "dimensions": {
    "clarity": <number>,
    "credibility": <number>,
    "proof": <number>,
    "role_relevance": <number>,
    "keyword_coverage": <number>,
    "differentiation": <number>,
    "completeness": <number>
  },
  "suggestions": [
    {
      "dimension": "<dimension_key>",
      "suggestion": "<specific actionable suggestion>",
      "priority": "high" | "medium" | "low"
    }
  ]
}

Priority rules:
- "high" for dimensions scoring below 40
- "medium" for dimensions scoring 40-65
- "low" for dimensions scoring 65-79`;

export async function analyzeProfile(
  userId: string,
  botId: string | null
): Promise<ProfileScoreResult> {
  const supabase = createServerClient();

  // Fetch all memory items for this user/bot
  const query = supabase
    .from("memory_items")
    .select("raw_text, source_type, title")
    .eq("user_id", userId);

  if (botId) {
    query.eq("bot_id", botId);
  }

  const { data: memoryItems, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch memory items: ${error.message}`);
  }

  if (!memoryItems || memoryItems.length === 0) {
    // Return a baseline score for empty profiles
    return {
      overall_score: 0,
      dimensions: {
        clarity: 0,
        credibility: 0,
        proof: 0,
        role_relevance: 0,
        keyword_coverage: 0,
        differentiation: 0,
        completeness: 0,
      },
      suggestions: [
        {
          dimension: "completeness",
          suggestion:
            "Upload your resume, LinkedIn profile, or other documents to get started with profile analysis.",
          priority: "high",
        },
      ],
      analyzed_memory_count: 0,
    };
  }

  // Concatenate all memory content
  const profileContent = memoryItems
    .map(
      (item) =>
        `[${item.source_type}${item.title ? ` - ${item.title}` : ""}]\n${item.raw_text}`
    )
    .join("\n\n---\n\n");

  // Truncate if too long (roughly 80k chars to stay within token limits)
  const truncated =
    profileContent.length > 80000
      ? profileContent.slice(0, 80000) + "\n\n[Content truncated...]"
      : profileContent;

  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SCORING_PROMPT },
      {
        role: "user",
        content: `Here is the professional profile content to analyze:\n\n${truncated}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from profile analysis");
  }

  const result = JSON.parse(content) as {
    overall_score: number;
    dimensions: ProfileDimensions;
    suggestions: ProfileSuggestion[];
  };

  return {
    overall_score: Math.round(result.overall_score),
    dimensions: result.dimensions,
    suggestions: result.suggestions || [],
    analyzed_memory_count: memoryItems.length,
  };
}

export async function saveProfileScore(
  userId: string,
  botId: string | null,
  result: ProfileScoreResult
): Promise<void> {
  const supabase = createServerClient();

  const { error } = await supabase.from("profile_scores").upsert(
    {
      user_id: userId,
      bot_id: botId,
      overall_score: result.overall_score,
      dimensions: result.dimensions,
      suggestions: result.suggestions,
      analyzed_memory_count: result.analyzed_memory_count,
      analyzed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,bot_id" }
  );

  if (error) {
    throw new Error(`Failed to save profile score: ${error.message}`);
  }
}

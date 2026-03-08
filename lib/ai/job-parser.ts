import { getOpenAI } from "@/lib/openai";
import type { ParsedJobData } from "@/types";

const PARSING_PROMPT = `You are an expert job description parser. Extract structured information from the following job posting text.

Return a JSON object with this exact structure:
{
  "title": "<job title>",
  "company": "<company name or null if not found>",
  "location": "<location or null if not found>",
  "requirements": ["<specific skill or experience required>", ...],
  "seniority": "<junior|mid|senior|lead|executive or null>",
  "job_type": "<remote|hybrid|onsite or null>",
  "salary_range": "<salary range as string or null>"
}

Rules:
- Extract requirements as specific, discrete items (skills, tools, years of experience, certifications)
- Keep requirements concise (under 15 words each)
- Limit to the top 15 most important requirements
- If the text is not a job description, extract whatever relevant career information you can
- Return null for fields that cannot be determined from the text`;

export async function parseJobDescription(
  rawText: string
): Promise<ParsedJobData> {
  const openai = getOpenAI();

  // Truncate very long descriptions (keep first 12k chars)
  const truncated =
    rawText.length > 12000
      ? rawText.slice(0, 12000) + "\n\n[Truncated...]"
      : rawText;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: PARSING_PROMPT },
      {
        role: "user",
        content: `Parse this job posting:\n\n${truncated}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from job parser");
  }

  const parsed = JSON.parse(content) as ParsedJobData;

  // Ensure requirements is always an array
  if (!Array.isArray(parsed.requirements)) {
    parsed.requirements = [];
  }

  return parsed;
}

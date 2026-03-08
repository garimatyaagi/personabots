import { getOpenAI } from "@/lib/openai";
import { retrieveMemory, formatMemoryContext } from "@/lib/memory/retriever";
import type { MatchAnalysis } from "@/types";

interface MatchResult {
  match_score: number;
  match_analysis: MatchAnalysis;
}

/**
 * Scores a job against the user's profile using RAG + GPT-4o.
 * 1. Retrieves relevant memory chunks for key requirements
 * 2. Sends aggregated context + job description to GPT-4o
 * 3. Returns structured match score and analysis
 */
export async function scoreJobMatch(params: {
  userId: string;
  botId: string | null;
  jobTitle: string;
  jobDescription: string;
  requirements: string[];
}): Promise<MatchResult> {
  const { userId, botId, jobTitle, jobDescription, requirements } = params;

  // Build a combined query from the job title + top requirements
  const queryParts = [jobTitle, ...requirements.slice(0, 8)];
  const combinedQuery = queryParts.join(". ");

  // Retrieve relevant memory for the job
  const memoryResults = await retrieveMemory({
    userId,
    botId,
    query: combinedQuery,
    topK: 12,
    similarityThreshold: 0.2,
  });

  const memoryContext = formatMemoryContext(memoryResults);

  if (!memoryContext) {
    // No memory to match against — return a low score
    return {
      match_score: 0,
      match_analysis: {
        strengths: [],
        gaps: ["No profile data available for matching"],
        missing_skills: requirements.slice(0, 5),
        notes: "Upload your resume or documents to get match scoring.",
      },
    };
  }

  const openai = getOpenAI();

  // Truncate job description to prevent token overflow
  const truncatedDesc = jobDescription.slice(0, 6000);
  const reqList =
    requirements.length > 0
      ? requirements.map((r, i) => `${i + 1}. ${r}`).join("\n")
      : "No specific requirements listed.";

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a career match-scoring engine. Given a candidate's profile data and a job description, evaluate how well the candidate matches the role.

Return a JSON object with these exact fields:
{
  "match_score": <number 0-100>,
  "strengths": [<string>, ...],
  "gaps": [<string>, ...],
  "missing_skills": [<string>, ...],
  "notes": "<string>"
}

Scoring rubric:
- 90-100: Exceptional fit. Candidate meets/exceeds almost all requirements, has directly relevant experience.
- 75-89: Strong fit. Candidate meets most key requirements, has relevant experience with minor gaps.
- 60-74: Good fit. Candidate meets several requirements but has notable gaps that could be overcome.
- 40-59: Partial fit. Candidate has some relevant skills but significant gaps in key areas.
- 20-39: Weak fit. Limited overlap between candidate's background and requirements.
- 0-19: Poor fit. Almost no alignment between candidate's profile and the role.

Rules:
- "strengths" should list 2-5 specific areas where the candidate's experience matches job needs. Reference specific skills, companies, or projects from their profile.
- "gaps" should list 1-4 areas where the candidate may need to address shortcomings relative to the role.
- "missing_skills" should list specific skills/tools/technologies required by the job that are NOT found in the candidate's profile.
- "notes" should be a 1-2 sentence summary of the overall assessment.
- Be fair and specific. Don't inflate scores. Reference concrete details from the profile.`,
      },
      {
        role: "user",
        content: `## Candidate Profile
${memoryContext}

## Job: ${jobTitle}

### Description
${truncatedDesc}

### Requirements
${reqList}

Evaluate this candidate's fit for the role and return the JSON assessment.`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from match scoring model");
  }

  try {
    const parsed = JSON.parse(content);

    // Validate and clamp score
    const score = Math.min(100, Math.max(0, Math.round(Number(parsed.match_score) || 0)));

    return {
      match_score: score,
      match_analysis: {
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 5) : [],
        gaps: Array.isArray(parsed.gaps) ? parsed.gaps.slice(0, 4) : [],
        missing_skills: Array.isArray(parsed.missing_skills) ? parsed.missing_skills.slice(0, 6) : [],
        notes: typeof parsed.notes === "string" ? parsed.notes : "",
      },
    };
  } catch {
    throw new Error("Failed to parse match scoring response");
  }
}

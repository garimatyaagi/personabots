import { getOpenAI } from "@/lib/openai";
import { retrieveMemory, formatMemoryContext } from "@/lib/memory/retriever";
import type { TailoredContentType } from "@/types";

const CONTENT_PROMPTS: Record<TailoredContentType, string> = {
  summary: `Write a concise professional summary (3-4 sentences) tailored specifically for this role. Highlight the most relevant experience and skills from the candidate's background that align with the job requirements. Use first person ("I").`,

  resume_bullets: `Generate 6-8 strong resume bullet points tailored for this specific role. Each bullet should:
- Start with a powerful action verb
- Include quantifiable results where possible (numbers, percentages, metrics from the profile)
- Directly address a key requirement or responsibility from the job description
- Draw from the candidate's actual experience in their profile
Format: One bullet per line, using "•" prefix.`,

  cover_note: `Write a compelling cover letter (3-4 paragraphs) for this specific role. The letter should:
- Open with genuine interest in the company/role
- Connect 2-3 specific experiences from the candidate's profile to key job requirements
- Show personality while remaining professional
- End with a clear, confident call to action
Use first person ("I") and the candidate's natural tone.`,

  recruiter_pitch: `Write a short, compelling pitch (2-3 paragraphs) the candidate could send to a recruiter about this role. It should:
- Be conversational but professional
- Lead with the strongest qualification match
- Highlight 2-3 specific relevant achievements
- End with a meeting/call request
Format as a message they could send on LinkedIn or email.`,

  interview_questions: `Generate 8-10 likely interview questions for this specific role, grouped by category. For each question, provide a brief talking point based on the candidate's actual experience.

Format:
**Category Name**
Q: [Question]
→ Talking point: [1-2 sentence answer framework using candidate's real experience]`,

  proof_points: `Identify 4-6 concrete proof points from the candidate's profile that directly demonstrate capability for this role. Each proof point should:
- Reference a specific project, achievement, or experience
- Connect it to a specific job requirement
- Include any metrics or quantifiable results

Format:
**Requirement:** [What the job needs]
**Proof:** [Candidate's evidence]
**Impact:** [Results/metrics if available]`,

  gap_analysis: `Perform an honest gap analysis between the candidate's profile and the job requirements. For each gap:
- Identify the specific requirement the candidate lacks
- Assess severity (Critical / Important / Nice-to-have)
- Suggest how to address it (transferable skills, quick learning, reframing experience)

Also note any "hidden strengths" — skills or experiences the candidate has that aren't explicitly required but add value.`,

  suggested_framing: `Suggest how the candidate should frame/position themselves for this specific role. Include:
1. **Positioning statement:** A one-liner about how to describe yourself for this role
2. **Key narrative:** The story arc to emphasize (e.g., "career progression from X to Y")
3. **Reframe opportunities:** How to reposition any apparent weaknesses as strengths
4. **Cultural fit signals:** Aspects of the profile that show alignment with the company/role
5. **Unique differentiators:** What sets this candidate apart from typical applicants`,
};

/**
 * Generate tailored content for a specific job using SSE streaming.
 * Returns an async generator that yields content chunks.
 */
export async function* generateTailoredContent(params: {
  userId: string;
  botId: string | null;
  jobTitle: string;
  jobCompany: string | null;
  jobDescription: string;
  jobRequirements: string[];
  contentType: TailoredContentType;
}): AsyncGenerator<string> {
  const {
    userId,
    botId,
    jobTitle,
    jobCompany,
    jobDescription,
    jobRequirements,
    contentType,
  } = params;

  // Retrieve relevant memory for this job
  const queryParts = [jobTitle, ...jobRequirements.slice(0, 6)];
  const memoryResults = await retrieveMemory({
    userId,
    botId,
    query: queryParts.join(". "),
    topK: 10,
    similarityThreshold: 0.2,
  });

  const memoryContext = formatMemoryContext(memoryResults);

  if (!memoryContext) {
    yield "I don't have enough profile data to generate tailored content. Please upload your resume or documents first, then try again.";
    return;
  }

  const truncatedDesc = jobDescription.slice(0, 5000);
  const reqList =
    jobRequirements.length > 0
      ? jobRequirements.map((r, i) => `${i + 1}. ${r}`).join("\n")
      : "No specific requirements listed.";

  const contentPrompt = CONTENT_PROMPTS[contentType];

  const openai = getOpenAI();

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.4,
    stream: true,
    messages: [
      {
        role: "system",
        content: `You are an expert career coach and content writer. You help candidates create highly targeted job application materials.

You have access to the candidate's actual profile data below. ONLY use information from this profile — never fabricate experiences, skills, or achievements.

## Candidate Profile
${memoryContext}`,
      },
      {
        role: "user",
        content: `## Target Role: ${jobTitle}${jobCompany ? ` at ${jobCompany}` : ""}

### Job Description
${truncatedDesc}

### Key Requirements
${reqList}

### Task
${contentPrompt}`,
      },
    ],
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

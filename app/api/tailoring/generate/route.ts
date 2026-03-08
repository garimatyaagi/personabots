import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";
import { generateTailoredContent } from "@/lib/ai/tailor";
import type { TailoredContentType } from "@/types";

export const dynamic = "force-dynamic";

const VALID_CONTENT_TYPES: TailoredContentType[] = [
  "summary",
  "resume_bullets",
  "cover_note",
  "recruiter_pitch",
  "interview_questions",
  "proof_points",
  "gap_analysis",
  "suggested_framing",
];

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { jobId, contentType } = body as {
      jobId: string;
      contentType: TailoredContentType;
    };

    if (!jobId || !contentType) {
      return NextResponse.json(
        { error: "jobId and contentType are required" },
        { status: 400 }
      );
    }

    if (!VALID_CONTENT_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: `Invalid contentType. Must be one of: ${VALID_CONTENT_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Fetch the job
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", userId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Get user's first bot
    const { data: bots } = await supabase
      .from("bots")
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    const botId = bots?.[0]?.id || null;

    // Start generation
    const generator = generateTailoredContent({
      userId,
      botId,
      jobTitle: job.title,
      jobCompany: job.company,
      jobDescription: job.description || "",
      jobRequirements: job.requirements || [],
      contentType,
    });

    const encoder = new TextEncoder();
    let fullContent = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of generator) {
            fullContent += chunk;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
            );
          }

          // Delete existing content for same (user_id, job_id, content_type)
          await supabase
            .from("tailored_content")
            .delete()
            .eq("user_id", userId)
            .eq("job_id", jobId)
            .eq("content_type", contentType);

          // Insert new content
          const { data: saved } = await supabase
            .from("tailored_content")
            .insert({
              user_id: userId,
              job_id: jobId,
              content_type: contentType,
              content: fullContent,
              is_edited: false,
            })
            .select()
            .single();

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, contentId: saved?.id })}\n\n`
            )
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Tailoring stream error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Generation failed" })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error(
      "Tailoring generate error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Failed to generate tailored content" },
      { status: 500 }
    );
  }
}

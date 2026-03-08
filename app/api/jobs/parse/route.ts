import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { parseJobDescription } from "@/lib/ai/job-parser";
import { z } from "zod";

const parseSchema = z.object({
  text: z.string().min(20, "Text must be at least 20 characters"),
});

// POST: Preview-only parsing (no DB save)
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = parseSchema.parse(body);

    const parsed = await parseJobDescription(validated.text);

    return NextResponse.json({ parsed });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error(
      "Job parse error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Failed to parse job description" },
      { status: 500 }
    );
  }
}

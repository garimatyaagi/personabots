import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { processFileUpload, processAndStoreMemory } from "@/lib/memory/pipeline";
import { rateLimit } from "@/lib/utils/rate-limit";

export const dynamic = "force-dynamic";

// POST /api/memory/upload — upload file or text to memory
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 20 uploads per 10 minutes
  const rl = rateLimit(`upload:${userId}`, {
    maxRequests: 20,
    windowMs: 10 * 60 * 1000,
  });

  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429 }
    );
  }

  try {
    const formData = await req.formData();
    const type = formData.get("type") as string;
    const botId = (formData.get("botId") as string) || null;
    const isShareable = formData.get("isShareable") === "true";

    if (type === "file") {
      // File upload
      const file = formData.get("file") as File;
      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File too large. Max 10MB." },
          { status: 400 }
        );
      }

      const result = await processFileUpload({
        userId,
        botId,
        file,
        isShareable,
      });

      return NextResponse.json({
        success: true,
        memoryItemId: result.memoryItemId,
        chunkCount: result.chunkCount,
        charCount: result.charCount,
      });
    } else if (type === "text") {
      // Text/note/QA upload
      const title = formData.get("title") as string;
      const content = formData.get("content") as string;
      const sourceType = (formData.get("sourceType") as string) || "note";

      if (!title || !content) {
        return NextResponse.json(
          { error: "Title and content are required" },
          { status: 400 }
        );
      }

      const result = await processAndStoreMemory({
        userId,
        botId,
        sourceType: sourceType as "note" | "qa" | "chat" | "linkedin",
        title,
        rawText: content,
        metadata: { sourceType },
        isShareable,
      });

      return NextResponse.json({
        success: true,
        memoryItemId: result.memoryItemId,
        chunkCount: result.chunkCount,
        charCount: result.charCount,
      });
    }

    return NextResponse.json({ error: "Invalid upload type" }, { status: 400 });
  } catch (error) {
    console.error("Upload error:", error);
    const message =
      error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

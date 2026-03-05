import { parseFile, getFileType } from "@/lib/parsers/text";
import { chunkText } from "./chunker";
import { embedAndStore } from "./embedder";
import { createServerClient } from "@/lib/supabase/server";
import type { MemorySourceType } from "@/types";

export interface UploadAndProcessResult {
  memoryItemId: string;
  chunkCount: number;
  charCount: number;
}

export async function processAndStoreMemory(params: {
  userId: string;
  botId: string | null;
  sourceType: MemorySourceType;
  title: string;
  rawText: string;
  metadata?: Record<string, unknown>;
  isShareable?: boolean;
}): Promise<UploadAndProcessResult> {
  const {
    userId,
    botId,
    sourceType,
    title,
    rawText,
    metadata = {},
    isShareable = false,
  } = params;

  const supabase = createServerClient();

  // 1. Store memory item
  const { data: memoryItem, error: insertError } = await supabase
    .from("memory_items")
    .insert({
      user_id: userId,
      bot_id: botId,
      source_type: sourceType,
      title,
      raw_text: rawText,
      metadata,
      is_shareable: isShareable,
    })
    .select("id")
    .single();

  if (insertError || !memoryItem) {
    throw new Error(`Failed to create memory item: ${insertError?.message}`);
  }

  // 2. Chunk the text
  const chunks = chunkText(rawText);

  // 3. Embed and store chunks
  await embedAndStore({
    chunks,
    memoryItemId: memoryItem.id,
    userId,
    botId,
    isShareable,
  });

  return {
    memoryItemId: memoryItem.id,
    chunkCount: chunks.length,
    charCount: rawText.length,
  };
}

export async function processFileUpload(params: {
  userId: string;
  botId: string | null;
  file: File;
  isShareable?: boolean;
}): Promise<UploadAndProcessResult> {
  const { userId, botId, file, isShareable = false } = params;

  const mimeType = getFileType(file.name);
  if (!mimeType) {
    throw new Error(
      `Unsupported file: ${file.name}. Use PDF, DOCX, or TXT files.`
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const rawText = await parseFile(buffer, mimeType, file.name);

  if (!rawText || rawText.length < 10) {
    throw new Error("File appears to be empty or could not be parsed.");
  }

  const sourceType: MemorySourceType =
    file.name.toLowerCase().includes("resume") ||
    file.name.toLowerCase().includes("cv")
      ? "resume"
      : "upload";

  return processAndStoreMemory({
    userId,
    botId,
    sourceType,
    title: file.name,
    rawText,
    metadata: {
      fileName: file.name,
      fileSize: file.size,
      mimeType,
    },
    isShareable,
  });
}

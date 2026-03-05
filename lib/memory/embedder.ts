import { createEmbeddings } from "@/lib/openai";
import { createServerClient } from "@/lib/supabase/server";
import type { Chunk } from "./chunker";

export async function embedAndStore(params: {
  chunks: Chunk[];
  memoryItemId: string;
  userId: string;
  botId: string | null;
  isShareable: boolean;
}): Promise<void> {
  const { chunks, memoryItemId, userId, botId, isShareable } = params;

  if (chunks.length === 0) return;

  // Batch embed (OpenAI supports up to 2048 inputs)
  const batchSize = 100;
  const supabase = createServerClient();

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const texts = batch.map((c) => c.text);

    const vectors = await createEmbeddings(texts);

    const rows = batch.map((chunk, idx) => ({
      memory_item_id: memoryItemId,
      user_id: userId,
      bot_id: botId,
      chunk_text: chunk.text,
      embedding: JSON.stringify(vectors[idx]),
      metadata: chunk.metadata,
      is_shareable: isShareable,
    }));

    const { error } = await supabase.from("embeddings").insert(rows);

    if (error) {
      console.error("Failed to store embeddings:", error);
      throw new Error(`Failed to store embeddings: ${error.message}`);
    }
  }
}

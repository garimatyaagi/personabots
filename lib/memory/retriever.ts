import { createEmbedding } from "@/lib/openai";
import { createServerClient } from "@/lib/supabase/server";
import type { SearchResult } from "@/types";

export interface RetrievalOptions {
  userId: string;
  botId: string | null;
  query: string;
  topK?: number;
  publicOnly?: boolean;
  similarityThreshold?: number;
}

export async function retrieveMemory(
  options: RetrievalOptions
): Promise<SearchResult[]> {
  const {
    userId,
    botId,
    query,
    topK = 8,
    publicOnly = false,
    similarityThreshold = 0.3,
  } = options;

  const queryEmbedding = await createEmbedding(query);
  const supabase = createServerClient();

  const { data, error } = await supabase.rpc("search_embeddings", {
    query_embedding: JSON.stringify(queryEmbedding),
    query_text: query,
    match_user_id: userId,
    match_bot_id: botId,
    match_count: topK,
    similarity_threshold: similarityThreshold,
    public_only: publicOnly,
  });

  if (error) {
    console.error("Memory retrieval failed:", error);
    return [];
  }

  return (data as SearchResult[]) || [];
}

export function formatMemoryContext(results: SearchResult[]): string {
  if (results.length === 0) return "";

  const chunks = results.map((r, i) => {
    return `[${i + 1}] ${r.chunk_text}`;
  });

  return chunks.join("\n\n");
}

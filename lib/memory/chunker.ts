export interface Chunk {
  text: string;
  index: number;
  metadata: {
    start_char: number;
    end_char: number;
    overlap: boolean;
  };
}

const TARGET_CHUNK_SIZE = 800; // ~800 tokens ≈ 3200 chars
const CHUNK_OVERLAP = 200;    // ~200 tokens overlap
const CHARS_PER_TOKEN = 4;    // rough estimate

export function chunkText(
  text: string,
  options?: {
    chunkSize?: number;
    overlap?: number;
  }
): Chunk[] {
  const chunkSizeChars = (options?.chunkSize ?? TARGET_CHUNK_SIZE) * CHARS_PER_TOKEN;
  const overlapChars = (options?.overlap ?? CHUNK_OVERLAP) * CHARS_PER_TOKEN;

  const cleaned = text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (cleaned.length <= chunkSizeChars) {
    return [
      {
        text: cleaned,
        index: 0,
        metadata: { start_char: 0, end_char: cleaned.length, overlap: false },
      },
    ];
  }

  const chunks: Chunk[] = [];
  let start = 0;
  let index = 0;

  while (start < cleaned.length) {
    let end = start + chunkSizeChars;

    if (end < cleaned.length) {
      // Try to break at a paragraph boundary
      const paragraphBreak = cleaned.lastIndexOf("\n\n", end);
      if (paragraphBreak > start + chunkSizeChars * 0.5) {
        end = paragraphBreak + 2;
      } else {
        // Try sentence boundary
        const sentenceBreak = cleaned.lastIndexOf(". ", end);
        if (sentenceBreak > start + chunkSizeChars * 0.5) {
          end = sentenceBreak + 2;
        }
      }
    } else {
      end = cleaned.length;
    }

    const chunkText = cleaned.slice(start, end).trim();
    if (chunkText.length > 0) {
      chunks.push({
        text: chunkText,
        index,
        metadata: {
          start_char: start,
          end_char: end,
          overlap: start > 0,
        },
      });
      index++;
    }

    // Move forward with overlap
    start = end - overlapChars;
    if (start >= cleaned.length) break;
    // Avoid getting stuck
    if (start <= chunks[chunks.length - 1]?.metadata.start_char) {
      start = end;
    }
  }

  return chunks;
}

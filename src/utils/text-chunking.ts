export interface Chunk {
  index: number;
  text: string;
  startToken: number;
  endToken: number;
}

const CHUNK_SIZE = 256;
const OVERLAP = 64;

export function chunkText(text: string): Chunk[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return [];
  }

  const chunks: Chunk[] = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + CHUNK_SIZE, words.length);
    const chunk = words.slice(start, end);
    chunks.push({
      index: chunks.length,
      text: chunk.join(" "),
      startToken: start,
      endToken: end,
    });
    start += CHUNK_SIZE - OVERLAP;
  }

  return chunks;
}

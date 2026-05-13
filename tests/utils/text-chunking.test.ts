import { describe, it, expect } from "vitest";
import { chunkText, Chunk } from "../../src/utils/text-chunking";

describe("chunkText", () => {
  const WORDS = (count: number): string =>
    Array.from({ length: count }, (_, i) => `word${i}`).join(" ");

  it("returns an empty array for empty text", () => {
    const chunks = chunkText("");
    expect(chunks).toEqual([]);
  });

  it("returns a single chunk for a single word", () => {
    const chunks = chunkText("hello");
    expect(chunks.length).toBe(1);
    expect(chunks[0].text).toBe("hello");
    expect(chunks[0].startToken).toBe(0);
    expect(chunks[0].endToken).toBe(1);
  });

  it("produces 256-token windows", () => {
    const text = WORDS(500);
    const chunks = chunkText(text);
    const firstChunk = chunks[0];

    expect(firstChunk.endToken - firstChunk.startToken).toBe(256);
    expect(firstChunk.startToken).toBe(0);
    expect(firstChunk.endToken).toBe(256);
  });

  it("maintains 64-token overlap between consecutive chunks", () => {
    const text = WORDS(500);
    const chunks = chunkText(text);

    // Consecutive chunks should overlap by 64 tokens
    expect(chunks[1].startToken - chunks[0].startToken).toBe(192);
    expect(chunks[0].endToken - chunks[1].startToken).toBe(64);
  });

  it("produces sequential indices", () => {
    const text = WORDS(500);
    const chunks = chunkText(text);

    for (let i = 0; i < chunks.length; i++) {
      expect(chunks[i].index).toBe(i);
    }
  });

  it("handles text shorter than chunk size", () => {
    const text = WORDS(100);
    const chunks = chunkText(text);

    expect(chunks.length).toBe(1);
    expect(chunks[0].startToken).toBe(0);
    expect(chunks[0].endToken).toBe(100);
  });

  it("handles text exactly at chunk size", () => {
    const text = WORDS(256);
    const chunks = chunkText(text);

    expect(chunks.length).toBe(2);
    expect(chunks[0].startToken).toBe(0);
    expect(chunks[0].endToken).toBe(256);
    expect(chunks[1].startToken).toBe(192);
  });

  it("handles text longer than two chunks", () => {
    const text = WORDS(500);
    const chunks = chunkText(text);

    expect(chunks.length).toBe(3);
    expect(chunks[0].startToken).toBe(0);
    expect(chunks[0].endToken).toBe(256);
    expect(chunks[1].startToken).toBe(192);
    expect(chunks[2].startToken).toBe(384);
  });

  it("joins words with a single space", () => {
    const text = "one two three";
    const chunks = chunkText(text);

    expect(chunks[0].text).toBe("one two three");
  });

  it("splits on whitespace", () => {
    const text = "alpha\tbeta\ngamma delta";
    const chunks = chunkText(text);

    expect(chunks[0].text).toBe("alpha beta gamma delta");
  });

  it("returns Chunk objects with correct shape", () => {
    const text = WORDS(300);
    const chunks = chunkText(text);
    const chunk = chunks[0];

    expect(chunk).toMatchObject({
      index: 0,
      text: expect.any(String),
      startToken: 0,
      endToken: 256,
    });
  });
});

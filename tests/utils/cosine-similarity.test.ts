import { describe, it, expect } from "vitest";
import {
  cosineSimilarity,
  searchVectors,
  SearchResult,
} from "../../src/utils/cosine-similarity";

describe("cosineSimilarity", () => {
  it("returns 1.0 for identical 384-dim vectors", () => {
    const a = new Float32Array(384).fill(1);
    const b = new Float32Array(384).fill(1);
    expect(cosineSimilarity(a, b)).toBeCloseTo(1.0, 5);
  });

  it("returns 0.0 for orthogonal vectors", () => {
    const a = new Float32Array(384);
    const b = new Float32Array(384);
    a[0] = 1;
    b[1] = 1;
    expect(cosineSimilarity(a, b)).toBeCloseTo(0.0, 5);
  });

  it("returns -1.0 for opposite vectors", () => {
    const a = new Float32Array(384);
    const b = new Float32Array(384);
    a[0] = 1;
    b[0] = -1;
    expect(cosineSimilarity(a, b)).toBeCloseTo(-1.0, 5);
  });

  it("computes similarity for mixed Float32Array values", () => {
    const a = new Float32Array(384);
    const b = new Float32Array(384);
    for (let i = 0; i < 384; i++) {
      a[i] = i % 2 === 0 ? 1 : 0;
      b[i] = i % 3 === 0 ? 1 : 0;
    }
    const result = cosineSimilarity(a, b);
    expect(result).toBeGreaterThan(-1.0);
    expect(result).toBeLessThan(1.0);
  });

  it("works with Float32Array typed arrays", () => {
    const a = new Float32Array([1, 0, 0]);
    const b = new Float32Array([1, 0, 0]);
    expect(cosineSimilarity(a, b)).toBeCloseTo(1.0, 5);
  });
});

describe("searchVectors", () => {
  function makeVector(dim: number, value: number): Float32Array {
    const v = new Float32Array(dim);
    v.fill(value);
    return v;
  }

  it("returns top-N results sorted by descending score", () => {
    const query = new Float32Array(384);
    for (let i = 0; i < 384; i++) query[i] = i % 2;

    // Vector with same distribution as query (high similarity)
    const v1 = new Float32Array(384);
    for (let i = 0; i < 384; i++) v1[i] = i % 2;

    // Vector with different distribution (lower similarity)
    const v2 = new Float32Array(384);
    for (let i = 0; i < 384; i++) v2[i] = (i + 1) % 3;

    // Vector with opposite distribution (negative similarity)
    const v3 = new Float32Array(384);
    for (let i = 0; i < 384; i++) v3[i] = (i % 2) * -1 + 1;

    // Vector with random-ish distribution (medium similarity)
    const v4 = new Float32Array(384);
    for (let i = 0; i < 384; i++) v4[i] = (i * 7) % 5;

    const vectors = [
      { noteId: 4, chunkIndex: 2, embedding: v4 },
      { noteId: 3, chunkIndex: 0, embedding: v3 },
      { noteId: 2, chunkIndex: 1, embedding: v2 },
      { noteId: 1, chunkIndex: 0, embedding: v1 },
    ];

    const results = searchVectors(query, vectors, 2);
    expect(results.length).toBe(2);
    expect(results[0].score).toBeCloseTo(1.0, 4);
    expect(results[0].noteId).toBe(1);
  });

  it("returns correct SearchResult shape", () => {
    const query = makeVector(384, 1);
    const vectors = [
      { noteId: 10, chunkIndex: 3, embedding: makeVector(384, 1) },
    ];
    const results = searchVectors(query, vectors, 1);

    expect(results[0]).toMatchObject({
      noteId: 10,
      chunkIndex: 3,
      score: expect.any(Number),
    });
    expect(results[0].score).toBeCloseTo(1.0, 5);
  });

  it("handles empty vector list", () => {
    const query = makeVector(384, 1);
    const results = searchVectors(query, [], 5);
    expect(results).toEqual([]);
  });

  it("respects top-N limit", () => {
    const query = makeVector(384, 1);
    const vectors = Array.from({ length: 10 }, (_, i) => ({
      noteId: i,
      chunkIndex: 0,
      embedding: makeVector(384, 1),
    }));
    const results = searchVectors(query, vectors, 3);
    expect(results.length).toBe(3);
  });
});

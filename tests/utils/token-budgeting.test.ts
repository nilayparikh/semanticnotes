import { describe, it, expect } from "vitest";
import {
  countTokens,
  truncateToTokens,
  fitToBudget,
  DEFAULT_BUDGET,
  TokenBudget,
} from "../../src/utils/token-budgeting";

describe("Token Budgeting", () => {
  describe("DEFAULT_BUDGET", () => {
    it("should export a frozen budget with correct totals", () => {
      // Arrange / Act
      const budget = DEFAULT_BUDGET;

      // Assert
      expect(budget.system).toBe(120);
      expect(budget.context).toBe(1400);
      expect(budget.question).toBe(300);
      expect(budget.answerReserve).toBe(228);
      expect(budget.total).toBe(2048);
      expect(() => {
        (budget as any).system = 0;
      }).toThrow();
    });
  });

  describe("countTokens", () => {
    it("should calculate token count for a note", () => {
      // Arrange
      const text = "Hello world"; // 11 chars

      // Act
      const tokens = countTokens(text);

      // Assert
      expect(tokens).toBe(3); // ceil(11 / 4) = 3
    });

    it("should return 0 for empty string", () => {
      // Arrange
      const text = "";

      // Act
      const tokens = countTokens(text);

      // Assert
      expect(tokens).toBe(0);
    });

    it("should calculate tokens for a 1024-char string", () => {
      // Arrange
      const text = "a".repeat(1024);

      // Act
      const tokens = countTokens(text);

      // Assert
      expect(tokens).toBe(256); // ceil(1024 / 4) = 256
    });

    it("should round up partial tokens", () => {
      // Arrange
      const text = "abc"; // 3 chars

      // Act
      const tokens = countTokens(text);

      // Assert
      expect(tokens).toBe(1); // ceil(3 / 4) = 1
    });
  });

  describe("truncateToTokens", () => {
    it("should truncate note to 256 tokens", () => {
      // Arrange
      const text = "a".repeat(2000); // 500 tokens

      // Act
      const result = truncateToTokens(text, 256);

      // Assert
      expect(result.length).toBe(1027); // 1024 chars + "..."
      expect(result.endsWith("...")).toBe(true);
      expect(countTokens(result)).toBeLessThanOrEqual(258); // 256 + ceil(3/4)
    });

    it("should not truncate when text fits within budget", () => {
      // Arrange
      const text = "short text";

      // Act
      const result = truncateToTokens(text, 256);

      // Assert
      expect(result).toBe(text);
      expect(result.endsWith("...")).toBe(false);
    });

    it("should add ellipsis when truncation occurs", () => {
      // Arrange
      const text = "a".repeat(100);

      // Act
      const result = truncateToTokens(text, 10);

      // Assert
      expect(result.endsWith("...")).toBe(true);
    });

    it("should handle zero maxTokens", () => {
      // Arrange
      const text = "some text";

      // Act
      const result = truncateToTokens(text, 0);

      // Assert
      expect(result).toBe("...");
    });
  });

  describe("fitToBudget", () => {
    it("should select top-N notes within budget", () => {
      // Arrange
      const note1 = "a".repeat(400); // 100 tokens
      const note2 = "b".repeat(400); // 100 tokens
      const note3 = "c".repeat(400); // 100 tokens
      const note4 = "d".repeat(400); // 100 tokens
      const notes = [note1, note2, note3, note4];

      // Act
      const result = fitToBudget(notes, 250);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0]).toBe(note1);
      expect(result[1]).toBe(note2);
      // Third note should be truncated to fit remaining 50 tokens (200 chars)
      expect(result[2].length).toBeLessThanOrEqual(203);
    });

    it("should handle empty context", () => {
      // Arrange
      const notes: string[] = [];

      // Act
      const result = fitToBudget(notes, 1000);

      // Assert
      expect(result).toHaveLength(0);
    });

    it("should return all notes if they fit within budget", () => {
      // Arrange
      const note1 = "a".repeat(100); // 25 tokens
      const note2 = "b".repeat(100); // 25 tokens
      const notes = [note1, note2];

      // Act
      const result = fitToBudget(notes, 1000);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toBe(note1);
      expect(result[1]).toBe(note2);
    });

    it("should truncate the last note to fill remaining space", () => {
      // Arrange
      const note1 = "a".repeat(800); // 200 tokens
      const note2 = "b".repeat(800); // 200 tokens
      const notes = [note1, note2];

      // Act
      const result = fitToBudget(notes, 300);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toBe(note1);
      // Second note truncated to ~100 tokens (400 chars)
      expect(result[1].length).toBeLessThanOrEqual(403);
      expect(result[1].endsWith("...")).toBe(true);
    });

    it("should return only ellipsis if budget is too small for any full note", () => {
      // Arrange
      const note1 = "a".repeat(400); // 100 tokens
      const notes = [note1];

      // Act
      const result = fitToBudget(notes, 5);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].endsWith("...")).toBe(true);
    });
  });
});

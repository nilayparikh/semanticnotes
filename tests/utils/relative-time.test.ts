import { describe, it, expect } from "vitest";
import { getRelativeTime } from "../../src/utils/relative-time";

describe("getRelativeTime", () => {
  const now = Date.now();

  describe("seconds", () => {
    it('returns "just now" for timestamps < 60 seconds', () => {
      const ts = now - 30 * 1000;
      expect(getRelativeTime(ts)).toBe("just now");
    });

    it('returns "just now" for 0 seconds', () => {
      expect(getRelativeTime(now)).toBe("just now");
    });
  });

  describe("minutes", () => {
    it('returns "Xm ago" for timestamps between 1-59 minutes', () => {
      const ts = now - 5 * 60 * 1000;
      expect(getRelativeTime(ts)).toBe("5m ago");
    });

    it('returns "59m ago" for 59 minutes', () => {
      const ts = now - 59 * 60 * 1000;
      expect(getRelativeTime(ts)).toBe("59m ago");
    });
  });

  describe("hours", () => {
    it('returns "Xh ago" for timestamps between 1-23 hours', () => {
      const ts = now - 2 * 3600 * 1000;
      expect(getRelativeTime(ts)).toBe("2h ago");
    });

    it('returns "23h ago" for 23 hours', () => {
      const ts = now - 23 * 3600 * 1000;
      expect(getRelativeTime(ts)).toBe("23h ago");
    });
  });

  describe("days", () => {
    it('returns "Xd ago" for timestamps >= 1 day', () => {
      const ts = now - 3 * 86400 * 1000;
      expect(getRelativeTime(ts)).toBe("3d ago");
    });
  });

  describe("timestamp formats", () => {
    it("handles number timestamps", () => {
      const ts = now - 120;
      expect(getRelativeTime(ts)).toBe("just now");
    });

    it("handles string timestamps", () => {
      const dateStr = new Date(now - 120).toISOString();
      expect(getRelativeTime(dateStr)).toBe("just now");
    });
  });

  describe("edge cases", () => {
    it('handles future timestamps (returns "just now" due to negative seconds)', () => {
      const futureTs = now + 3600 * 1000;
      expect(getRelativeTime(futureTs)).toBe("just now");
    });

    it("handles exact 60-second boundary", () => {
      const ts = now - 60 * 1000;
      expect(getRelativeTime(ts)).toBe("1m ago");
    });

    it("handles exact 3600-second boundary", () => {
      const ts = now - 3600 * 1000;
      expect(getRelativeTime(ts)).toBe("1h ago");
    });

    it("handles exact 86400-second boundary", () => {
      const ts = now - 86400 * 1000;
      expect(getRelativeTime(ts)).toBe("1d ago");
    });
  });
});

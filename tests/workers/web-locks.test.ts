import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { withDbLock, locksAvailable } from "@/utils/web-locks";

// ── Mock navigator.locks ─────────────────────────────────────────────────

const mockLocks = {
  request: vi.fn(),
};

describe("Web Locks API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, "locks", {
      value: mockLocks,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should acquire exclusive lock", async () => {
    const operation = vi.fn().mockResolvedValue("result");
    mockLocks.request.mockImplementation((_name, _opts, callback) =>
      callback(),
    );

    const result = await withDbLock("db-write", { mode: "exclusive" }, operation);

    expect(result).toBe("result");
    expect(operation).toHaveBeenCalled();
    expect(mockLocks.request).toHaveBeenCalledWith(
      "db-write",
      { mode: "exclusive" },
      expect.any(Function),
    );
  });

  it("should acquire shared lock", async () => {
    const operation = vi.fn().mockResolvedValue("result");
    mockLocks.request.mockImplementation((_name, _opts, callback) =>
      callback(),
    );

    const result = await withDbLock("db-read", { mode: "shared" }, operation);

    expect(result).toBe("result");
    expect(mockLocks.request).toHaveBeenCalledWith(
      "db-read",
      { mode: "shared" },
      expect.any(Function),
    );
  });

  it("should set ifAvailable when timeoutMs is provided", async () => {
    const operation = vi.fn().mockResolvedValue("result");
    mockLocks.request.mockImplementation((_name, _opts, callback) =>
      callback(),
    );

    await withDbLock(
      "db-read",
      { mode: "shared", timeoutMs: 5000 },
      operation,
    );

    expect(mockLocks.request).toHaveBeenCalledWith(
      "db-read",
      { mode: "shared", ifAvailable: true },
      expect.any(Function),
    );
  });

  it("should not set ifAvailable when timeoutMs is not provided", async () => {
    const operation = vi.fn().mockResolvedValue("result");
    mockLocks.request.mockImplementation((_name, _opts, callback) =>
      callback(),
    );

    await withDbLock("db-read", { mode: "shared" }, operation);

    expect(mockLocks.request).toHaveBeenCalledWith(
      "db-read",
      { mode: "shared" },
      expect.any(Function),
    );
  });

  it("should propagate operation errors", async () => {
    const operation = vi.fn().mockRejectedValue(new Error("lock error"));
    mockLocks.request.mockImplementation((_name, _opts, callback) =>
      callback(),
    );

    await expect(
      withDbLock("db-write", { mode: "exclusive" }, operation),
    ).rejects.toThrow("lock error");
  });

  it("should return null when locks not available and ifAvailable is true", async () => {
    mockLocks.request.mockResolvedValue(null);

    const result = await withDbLock(
      "db-read",
      { mode: "shared", timeoutMs: 100 },
      () => Promise.resolve("result"),
    );

    expect(result).toBeNull();
  });

  it("locksAvailable returns true when navigator.locks exists", async () => {
    expect(await locksAvailable()).toBe(true);
  });

  it("locksAvailable returns false when navigator.locks is undefined", async () => {
    Object.defineProperty(navigator, "locks", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    expect(await locksAvailable()).toBe(false);
  });
});

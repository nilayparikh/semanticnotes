/**
 * Web Locks API Wrapper
 *
 * Provides concurrency management for database operations.
 * Cross-compiled from `docs/architecture/02_storage_layer_spec.md`.
 */

import { DbLockMode, LockOptions } from "@/types/database";

/**
 * Check if Web Locks API is available.
 */
export async function locksAvailable(): Promise<boolean> {
  return "locks" in navigator && navigator.locks !== undefined;
}

/**
 * Execute an operation within a Web Lock.
 * Returns null if lock cannot be acquired (ifAvailable mode).
 */
export async function withDbLock<T>(
  lockName: string,
  options: LockOptions,
  operation: () => Promise<T>,
): Promise<T | null> {
  if (!(await locksAvailable())) {
    // Fallback: run without lock if API unavailable
    return operation();
  }

  const lockOptions: { mode: DbLockMode; ifAvailable?: boolean } = {
    mode: options.mode,
  };

  if (options.timeoutMs) {
    lockOptions.ifAvailable = true;
  }

  const result = await navigator.locks.request(
    lockName,
    lockOptions,
    async () => operation(),
  );

  return result as T | null;
}

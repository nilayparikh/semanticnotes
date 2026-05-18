/**
 * BM25 Fallback Hook
 *
 * Provides keyword-based search via SQLite FTS5 as a fallback when
 * WebGPU capability score < 31 and vector embeddings are unavailable.
 * Cross-compiled from `docs/architecture/02_storage_layer_spec.md`.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { DbServiceInterface } from "@/types/database";

// ── Types ────────────────────────────────────────────────────────────────

export interface Bm25Result {
  noteId: string;
  title: string;
  score: number;
}

// ── SQL Helpers ──────────────────────────────────────────────────────────

/**
 * Returns the SQL statement to create the FTS5 virtual table
 * that indexes `title` and `content` from the `notes` table.
 */
export function createFts5Table(): string {
  return `CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
    note_id UNINDEXED,
    title,
    content
  )`;
}

// ── Search Function ──────────────────────────────────────────────────────

/**
 * Queries the FTS5 virtual table and returns ranked results.
 *
 * @param dbService - The database service interface.
 * @param query - The keyword search query string.
 * @returns Array of BM25 results with note ID, title, and rank score.
 */
export async function searchNotesFts5(
  dbService: DbServiceInterface,
  query: string
): Promise<Bm25Result[]> {
  const rows = await dbService.query(
    `SELECT note_id, title, bm25(notes_fts) AS rank
     FROM notes_fts
     WHERE notes_fts MATCH ?
     ORDER BY rank
     LIMIT 50`,
    [query]
  );

  if (!rows || !Array.isArray(rows)) {
    return [];
  }

  return rows.map((row: any) => ({
    noteId: String(row.note_id),
    title: row.title,
    score: row.rank ?? 0,
  }));
}

// ── React Hook ───────────────────────────────────────────────────────────

/**
 * React hook that manages BM25 fallback search state.
 * Initializes the FTS5 table on mount and exposes a search method.
 *
 * @param dbService - The database service interface.
 * @returns Object with search method, isSearching flag, and results array.
 */
export function useBm25Fallback(dbService: DbServiceInterface) {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Bm25Result[]>([]);
  const initialized = useRef(false);

  // Initialize FTS5 table on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    dbService.query(createFts5Table()).catch(() => {
      // FTS5 may not be compiled into wa-sqlite; silently fail
      // and let search errors surface naturally.
    });
  }, [dbService]);

  const search = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      setResults([]);

      try {
        const hits = await searchNotesFts5(dbService, query);
        setResults(hits);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [dbService]
  );

  return { search, isSearching, results };
}

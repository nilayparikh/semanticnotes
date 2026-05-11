---
name: wasm-sqlite-validation
description: "WASM and SQLite database schema validation skill. Use when validating database schemas, embedding pipelines, or WASM runtime configurations."
allowed-tools: shell
---

# WASM & SQLite Database Schema Validation Skill

## When to Use

Use this skill when validating database schemas, embedding pipelines, or WASM runtime configurations.

## Database Schema Validation

- **Table structure**: Verify all tables have proper columns and types.
- **Primary keys**: Ensure each table has a unique `id` column.
- **Indexes**: Check for indexes on frequently queried columns.
- **Migrations**: Verify migration scripts are idempotent.

## Schema Validation Script

```typescript
import { openDatabase } from "wa-sqlite";

// Validate the database schema
export async function validateSchema() {
  const db = await openDatabase({
    name: "semantic-notes.db",
    location: "opfs",
    version: 1,
  });

  // Check tables
  const tables = await db.query(
    'SELECT name FROM sqlite_master WHERE type = "table"',
  );
  const expectedTables = ["notes", "embeddings", "user_preferences"];

  for (const table of expectedTables) {
    if (!tables.includes(table)) {
      throw new Error(`Missing table: ${table}`);
    }
  }

  // Check columns
  const noteColumns = await db.query("PRAGMA table_info(notes)");
  const expectedColumns = [
    "id",
    "title",
    "body",
    "embedding",
    "created_at",
    "updated_at",
  ];

  for (const column of expectedColumns) {
    if (!noteColumns.includes(column)) {
      throw new Error(`Missing column: ${column}`);
    }
  }

  return true;
}
```

## Embedding Pipeline Validation

- **Vector dimensions**: Verify embeddings are 100-128 dimensions.
- **Normalization**: Check that vectors are normalized (magnitude ≈ 1).
- **Cosine similarity**: Verify similarity scores are between 0 and 1.
- **Threshold**: Test with ≥ 0.72 threshold for semantic search.

## WASM Runtime Validation

- **WebGPU availability**: Check `navigator.gpu` for WebGPU support.
- **Fallback chain**: Verify WebGPU → WebGL → CPU fallback.
- **Memory budget**: Ensure total WASM memory is ≤ 256MB.
- **Bundle size**: Check Gzipped bundle size is ≤ 1.2MB.

## Validation Checklist

- [ ] Schema matches expected structure
- [ ] Embeddings are normalized
- [ ] Cosine similarity scores are correct
- [ ] WebGPU fallback works
- [ ] Memory budget is within limits
- [ ] Bundle size is optimized

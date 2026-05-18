---
title: "Group 5 — Model Download & Management UI"
plan_id: "drift-2026-05-17-full-flow-05_model_download"
status: "Complete"
author: "Planning Agent"
created: "2026-05-17"
updated: "2026-05-17"
completed: "2026-05-17"
priority: "High"
story_points: 3
effort_days: 0.5
depends_on: ["drift-2026-05-17-full-flow-01_sqlite_storage"]
depends_on_external: ["@xenova/transformers"]
phase: null
parent_drift_index: "docs/plans/drifts/2026-05-17-full-flow/README.md"
source_drifts: ["drift-2026-05-17-assessment#warning-5"]
archived_date: null
archive_log: null
---

## 1. Objective

Add model download consent, progress tracking, load/unload lifecycle controls, and status display to the Settings panel. Connect to `useModelManager` for real model lifecycle management.

## 2. Scope

### In Scope

- [ ] Wire `useModelManager` in `SettingsPanel` for model state
- [ ] Add download consent checkbox for embedding model
- [ ] Add download progress indicator for each model
- [ ] Add load/unload buttons for embedding and LLM models
- [ ] Display model state badges (idle, loading, ready, error, disposed)
- [ ] Show model size and VRAM usage in settings

### Out of Scope

- Model worker instantiation (Group 3)
- Loading overlay (Group 4)
- New component creation

## 3. Acceptance Criteria

| #   | Criterion                                              | Verification Method | Status |
| --- | ------------------------------------------------------ | ------------------- | ------ |
| 1   | Settings shows model download consent checkbox         | Manual              | `[ ]`  |
| 2   | Download progress is displayed during model loading    | Manual              | `[ ]`  |
| 3   | Users can unload models to free VRAM                   | Manual              | `[ ]`  |
| 4   | Model state badges reflect actual `ModelManager` state | Code Review         | `[ ]`  |
| 5   | Models are loaded sequentially (not simultaneously)    | Integration Test    | `[ ]`  |

## 4. Current Code Analysis

### `src/hooks/useModelManager.ts`

`ModelManager` class exists with:

- `loadEmbeddingModel()` — loads embedding model, disposes LLM if active
- `loadLLM()` — loads LLM, disposes embedding if active
- State tracking: `#embeddingState`, `#llmState` (`idle | loading | ready | error | disposed`)

### `src/components/SettingsPanel.tsx`

Renders theme, embedding model selection, storage usage, and WebGPU status. No model lifecycle controls.

### `src/components/GlobalHeader.tsx`

Shows `modelLoaded` badge but no download progress or unload controls.

## 5. Technical Approach

### 5.1 Instantiate ModelManager in Settings

```typescript
// src/components/SettingsPanel.tsx
import { ModelManager } from "@/hooks/useModelManager";

const modelManager = useMemo(() => new ModelManager(), []);
```

### 5.2 Add Model Lifecycle Controls

```typescript
// Embedding model section
<section>
  <h4>Embedding Model</h4>
  <div>
    <span>{embeddingState}</span>
    <button onClick={() => modelManager.loadEmbeddingModel()}>Load</button>
    <button onClick={() => modelManager.disposeEmbedding()}>Unload</button>
  </div>
</section>

// LLM model section
<section>
  <h4>LLM Model</h4>
  <div>
    <span>{llmState}</span>
    <button onClick={() => modelManager.loadLLM()}>Load</button>
    <button onClick={() => modelManager.disposeLLM()}>Unload</button>
  </div>
</section>
```

### 5.3 Download Consent

```typescript
const [consentGiven, setConsentGiven] = useState(false);
const handleDownload = async () => {
  setConsentGiven(true);
  await modelManager.loadEmbeddingModel();
};
```

## 6. TDD Test Cases

```typescript
// tests/hooks/useModelManager.test.ts
describe("ModelManager", () => {
  it("should load embedding model", () => {});
  it("should dispose LLM when loading embedding", () => {});
  it("should load LLM model", () => {});
  it("should dispose embedding when loading LLM", () => {});
  it("should report state changes", () => {});
});
```

## 7. Files to Modify

| File                               | Change                                          |
| ---------------------------------- | ----------------------------------------------- |
| `src/components/SettingsPanel.tsx` | Add model lifecycle controls, progress, consent |
| `src/components/GlobalHeader.tsx`  | Show model state badges from `ModelManager`     |
| `src/hooks/useModelManager.ts`     | Expose state getters if needed                  |

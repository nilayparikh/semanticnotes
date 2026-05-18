# Drift Report

## Scope

Compared the current application UI/behavior against:

- `docs/functional/*` (functional requirements)
- `docs/design/*` (design requirements)
- `mock/code.html` and `mock/screen.png` (approved visual target)

Validation scope for this report is **desktop only**.

Evidence was captured with Playwright and stored in `docs/review/assets/drift-2026-05-17/`.

## Summary

- Total drifts found: 11
- Critical: 4
- Warning: 5
- Info: 2

## Screenshot Evidence

### Mock (Target)

![Approved mock static](./assets/drift-2026-05-17/mock-approved-screen.png)

### Current App (Actual)

![Current desktop initial](./assets/drift-2026-05-17/app-desktop-initial.png)
![Current desktop note created](./assets/drift-2026-05-17/app-desktop-note-created.png)
![Current desktop search](./assets/drift-2026-05-17/app-desktop-search.png)
![Current desktop settings](./assets/drift-2026-05-17/app-desktop-settings-open.png)
![Current desktop chat](./assets/drift-2026-05-17/app-desktop-chat.png)

## Desktop Visual Gap Narrative (Plain Language)

This section explains exactly what looks different, in words, without relying only on code references.

1. Header density and status clarity

- Mock look: The header status area reads like an operational console, with clearly separated status chips and strong readiness cues.
- Current look: The badges are present, but the overall status area feels flatter and less informative once you move past the two chips.
- Why this matters: The first glance should communicate "system is ready" and "what is active" with no interpretation effort.

2. Right panel visual hierarchy is compressed

- Mock look: The right column is visibly segmented into strong blocks (insights, related notes, chat, metrics), each with distinct visual weight.
- Current look: Sections exist, but the structure reads as a continuous stack with weaker section boundaries.
- Why this matters: Users scan the right rail for semantic context; weaker hierarchy increases cognitive load.

3. Related notes cards are less descriptive

- Mock look: Related cards include title, confidence badge, and short descriptive text excerpt.
- Current look: Cards mostly show title plus similarity percentage.
- Why this matters: Without excerpt context, users cannot quickly verify "why" an item is related.

4. Chat readiness cues are reduced

- Mock look: Chat area includes explicit active model text and progress indicator at the top of the chat block.
- Current look: Model selector exists, but readiness/progress communication is less explicit in the same visual zone.
- Why this matters: Users need immediate trust signals that local AI is loaded and ready before typing.

5. Insights panel brand expression is lighter than target

- Mock look: The section title treatment (icon + stronger phrasing + dense micro-labeling) creates a "local AI control center" feel.
- Current look: The same conceptual modules are present, but visual storytelling is more utilitarian.
- Why this matters: Approved mock sets a strong product identity; weaker expression creates perceived incompleteness.

6. Settings modal is visually complete but operationally shallow

- Mock/requirements intent: Settings should feel like control over model lifecycle, storage behavior, and runtime readiness.
- Current look: Modal styling is strong, but many controls are status-only rather than lifecycle actions.
- Why this matters: Visual completeness can mislead users into expecting deeper operational control than actually exists.

## Critical Drifts

1. **Local-first storage is not wired to user note lifecycle**

- Type: Implementation Drift
- Requirement source: `docs/functional/01_note_management.md:8-11`, `docs/architecture/02_storage_layer_spec.md:5-7`
- Target state: Notes persist to SQLite over OPFS.
- Actual state:
  - App uses an in-memory DB class in UI layer (`src/App.tsx:25`, `src/App.tsx:129`).
  - Primary note CRUD is reducer-only with no DB write/read in `useNoteManager` (`src/hooks/useNoteManager.ts:59`, `src/hooks/useNoteManager.ts:90`).
- Impact: Notes are session-memory state, not true local-first persistence.
- Screenshots: `app-desktop-initial.png`, `app-desktop-note-created.png`.
- Recommendation: Route all note CRUD through `DbService`/worker and hydrate notes at startup from persisted store.

2. **Semantic search path is effectively non-semantic in app UX**

- Type: Functional Drift
- Requirement source: `docs/functional/02_semantic_search.md:13-15`, `docs/functional/02_semantic_search.md:29`
- Target state: Query embedding + cosine similarity over persisted vectors.
- Actual state:
  - `useSemanticSearch` creates zero-filled query embedding (`src/hooks/useSemanticSearch.ts:76`) and is not invoked by the sidebar flow.
  - App search execution uses local `keywordSearch(...)` fallback directly (`src/App.tsx:68`, `src/App.tsx:171`) and ignores `semanticResults` (`src/App.tsx:138`).
- Impact: Search relevance/percentages are keyword heuristic, not embedding-based semantic retrieval.
- Screenshots: `app-desktop-search.png`.
- Recommendation: Wire sidebar search to `useSemanticSearch.search(...)` and connect query embedding worker output.

3. **AI chat user flow does not implement RAG pipeline or model generation**

- Type: Functional Drift
- Requirement source: `docs/functional/03_ai_chat.md:10-26`
- Target state: Embedded query, top-note retrieval, prompt construction, token streaming from local LLM.
- Actual state:
  - Chat persists conversation in localStorage (`src/components/AIChat.tsx:9`, `src/components/AIChat.tsx:25`).
  - Assistant response is hardcoded simulation (`src/components/AIChat.tsx:61`).
- Impact: User-visible chat flow appears functional but does not satisfy required RAG behavior.
- Screenshots: `app-desktop-chat.png`.
- Recommendation: Connect chat submit -> retrieval hook -> LLM worker generation stream, and surface retrieval context in-thread.

4. **Startup readiness/loading overlay flow is not integrated**

- Type: Functional Drift
- Requirement source: `docs/functional/04_ui_layout.md:27-31`
- Target state: Blocking overlay with component states (`idle -> loading -> ready/error`) + retry.
- Actual state:
  - Loading state hook exists (`src/hooks/useLoadingState.ts:12`, `src/hooks/useLoadingState.ts:98`) and overlay component exists (`src/components/LoadingOverlay.tsx:9`), but App does not render either in main flow.
- Impact: Users do not see staged initialization or failure recovery UI.
- Screenshots: `app-desktop-initial.png`.
- Recommendation: Add loading orchestration in App boot and render `LoadingOverlay` until required services are ready.

## Warnings

1. **Right panel information hierarchy is shallower than approved mock**

- Type: Appearance Drift
- Target references: `mock/code.html:256`, `mock/code.html:276`, `mock/code.html:347`
- Current: Semantic panel exists (`src/components/SemanticContextPanel.tsx`) but lacks the richer section framing, iconography density, and contextual detail shown in mock.
- Screenshots: `mock-desktop.png` vs `app-desktop-note-created.png`.
- Recommendation: Align right panel card structure/headers/subcontent with mock grouping.

2. **Related notes cards missing excerpt + score badge treatment from mock**

- Type: Appearance/UX Drift
- Target references: `mock/code.html:276-309`
- Current: Related items show title + percent only (`src/components/SemanticContextPanel.tsx:31-38`).
- Impact: Lower scannability and reduced semantic confidence cues.
- Screenshots: `mock-desktop.png` vs `app-desktop-note-created.png`.
- Recommendation: Add excerpt snippet, compact score pill, and hover affordance parity.

3. **Model-status/progress cues are incomplete relative to target chat module**

- Type: Appearance/Function Drift
- Target references: `mock/code.html:312`, `mock/code.html:315`, `docs/functional/03_ai_chat.md:12`
- Current: model selector exists but no explicit active-state/progress meter in visible chat header.
- Impact: User cannot quickly evaluate readiness/processing confidence.
- Screenshots: `mock-desktop.png` vs `app-desktop-chat.png`.
- Recommendation: Add model state badge and explicit progress/status text in chat header.

4. **AI context bar implementation duplication risk**

- Type: Implementation Drift
- Current: standalone component exists (`src/components/AIContextBar.tsx`) but App renders an inline duplicate implementation (`src/App.tsx:276-309`).
- Impact: Design drift risk and inconsistent behavior across future updates.
- Recommendation: Use shared component in App, keep one source of truth.

5. **Settings panel omits model lifecycle controls required by functional spec**

- Type: Functional Drift
- Requirement source: `docs/functional/03_ai_chat.md:35-38`
- Current: settings modal renders theme/model/storage status (`src/components/SettingsPanel.tsx`), but no explicit model download consent state, unload controls, or lifecycle actions.
- Screenshots: `app-desktop-settings-open.png`.
- Recommendation: Add consent + download state + unload action controls tied to model manager.

## Info

1. **Context-document inconsistency: embedding dimensionality**

- Type: Context Drift
- Conflict:
  - `.github/copilot-instructions.md:65` specifies 100-128 dimensions.
  - Functional and architecture docs expect 384 dimensions (`docs/functional/02_semantic_search.md:13`, `docs/architecture/04_embedding_pipeline_spec.md:5`).
- Recommendation: Normalize to a single dimension contract (likely 384 for MiniLM v2) across all context docs.

2. **Spec/implementation mismatch in SQLite runtime package details**

- Type: Doc/Implementation Drift
- Observation: code imports `@vscode/sqlite3` in worker (`src/workers/sqlite.worker.ts:9`), while architecture language emphasizes `wa-sqlite` identity.
- Recommendation: clarify whether `@vscode/sqlite3` is the intended wa-sqlite runtime wrapper, and document package-level implementation truth.

## User-Flow Gap Matrix

| Flow             | Expected (Mock + Functional)                                   | Current Behavior                                                    | Gap Severity |
| ---------------- | -------------------------------------------------------------- | ------------------------------------------------------------------- | ------------ |
| App Boot         | Blocking readiness overlay with per-component states and retry | Direct render of app shell; no integrated overlay state machine     | Critical     |
| Create/Edit Note | Persisted note lifecycle in SQLite/OPFS + live preview         | Live preview works, but persistence path is reducer-memory-dominant | Critical     |
| Semantic Search  | Query embedding + vector similarity + score display            | Keyword search heuristics drive result scores                       | Critical     |
| AI Chat          | RAG retrieval + local model stream                             | Simulated response text, no retrieval-backed generation             | Critical     |
| Model Management | Consent/download/load/unload controls + status                 | Basic load/settings surfaces; missing full lifecycle controls       | Warning      |
| Context Insights | Rich right-rail cards with strong semantic cues                | Basic tags/related/chat/metrics sections, less depth and fidelity   | Warning      |

## Suggested Fix Order

1. Wire real persistence path (SQLite worker + note CRUD hydration).
2. Replace sidebar keyword path with true semantic search pipeline.
3. Integrate RAG + LLM worker in AI chat flow.
4. Add startup loading orchestration and retry UX.
5. Bring right-rail and chat visual hierarchy up to mock parity.

## Reproduction Notes

- App URL used for capture: `http://127.0.0.1:5170`.
- Mock URL used for capture: local `mock/code.html`.
- Capture script: `scripts/drift/capture-drift-screenshots.mjs`.
- Capture date: 2026-05-17.

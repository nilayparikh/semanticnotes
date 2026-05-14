# SemanticNotes.ai — Phase Plans Index

This directory contains all implementation phase plans for SemanticNotes.ai. Each plan is scoped to 4-6 Story Points for TDD manageability.

## Quick Reference

> Two key files govern all plan work — keep them in mind when working with plans.

| File                                         | Purpose                                                                     |
| -------------------------------------------- | --------------------------------------------------------------------------- |
| [PLAN_CONVENTIONS.md](./PLAN_CONVENTIONS.md) | **Mandatory** front matter, acceptance criteria format, and lifecycle rules |
| [DEPENDENCY_GRAPH.md](./DEPENDENCY_GRAPH.md) | **Authoritative** dependency map for all unarchived plans                   |

### Supporting Directories

| Path                   | Purpose                                               |
| ---------------------- | ----------------------------------------------------- |
| [archive/](./archive/) | Completed plans (moved via `sn_archive`)              |
| [logs/](./logs/)       | Archive logs — persistent memory for completed work   |
| [drifts/](./drifts/)   | Drift remediation plans (timestamped sub-directories) |

## Phase Plan Structure

```
docs/plans/
├── README.md                    # This index
├── PLAN_CONVENTIONS.md          # Front matter & acceptance criteria standards
├── DEPENDENCY_GRAPH.md          # Unarchived plan dependency map
├── 00_project-setup.md          # Phase 00: Project scaffolding
├── 01a_worker-runtime.md        # Phase 01a: Worker messaging
├── 01b_data-model-layer.md      # Phase 01b: Data & model runtime
├── 02a_note-crud.md             # Phase 02a: Note CRUD
├── 02b_note-ui.md               # Phase 02b: Note UI components
├── 03a_embedding-pipeline.md   # Phase 03a: Embedding computation
├── 03b_semantic-search.md       # Phase 03b: Semantic search hook
├── 04a_rag-pipeline.md          # Phase 04a: RAG pipeline
├── 04b_chat-ui.md               # Phase 04b: Chat UI
├── 05a_layout-structure.md      # Phase 05a: Layout grid
├── 05b_ui-indicators.md         # Phase 05b: UI indicators
├── archive/                     # Archived plans (moved via sn_archive)
│   └── README.md
├── logs/                        # Archive logs (persistent memory)
└── drifts/                      # Drift remediation plans
    ├── README.md                # Drift master index
    └── YYYY-MM-DD-HH-MM/        # Timestamped drift sessions
        ├── 01_name.md
        └── ...
```

## Phase Plan Naming Convention

```
docs/plans/NNx_plan-name.md
```

- `NN` is the phase number (00–05)
- `x` is the sub-phase letter (a, b) when split from a larger feature
- Use kebab-case for readability

## Drift Plan Naming Convention

```
docs/plans/drifts/YYYY-MM-DD-HH-MM/NN_name.md
```

- Timestamp directory groups related drift fixes
- `NN` is the phase number within that drift session
- Kebeab-case names

## Phase Plan Dependencies

> **Authoritative source**: [DEPENDENCY_GRAPH.md](./DEPENDENCY_GRAPH.md) — always consult this for current dependency state.

```
Phase 00 (Project Setup)
  └── 01a (Worker Runtime)
       └── 01b (Data & Model Layer)
            └── 02a (Note CRUD)
                 └── 02b (Note UI)
                      └── 03a (Embedding Pipeline)
                           └── 03b (Semantic Search)
                                └── 04a (RAG Pipeline)
                                     └── 04b (Chat UI)
                                          └── 05a (Layout Structure)
                                               └── 05b (UI Indicators)
```

## Workflow Triggers

| Trigger      | Purpose                        | Prompt File                            | When to Use                                       |
| ------------ | ------------------------------ | -------------------------------------- | ------------------------------------------------- |
| `sn_plan`    | Create implementation plan     | `.github/prompts/sn_plan.prompt.md`    | Before any feature — draft the plan first         |
| `sn_new`     | Implement new feature          | `.github/prompts/sn_new.prompt.md`     | Plan is approved, ready to code                   |
| `sn_change`  | Modify existing feature        | `.github/prompts/sn_change.prompt.md`  | Scope change or refactoring of an existing plan   |
| `sn_test`    | Run test suite                 | `.github/prompts/sn_test.prompt.md`    | Before marking criteria verified                  |
| `sn_drift`   | Detect drifts from mock/design | `.github/prompts/sn_drift.prompt.md`   | When implementation deviates from the visual mock |
| `sn_archive` | Archive completed plan         | `.github/prompts/sn_archive.prompt.md` | After all criteria met — move plan to `archive/`  |

## Plan Status Lifecycle

```
Draft ──→ In-Progress ──→ Complete ──→ Archived (via sn_archive)
```

| Status          | Description                                   | Agent Actions                                                                  |
| --------------- | --------------------------------------------- | ------------------------------------------------------------------------------ |
| **Draft**       | Plan is drafted but not yet started           | Plan exists in `docs/plans/` with `status: "Draft"`                            |
| **In-Progress** | Implementation underway                       | Set `status: "In-Progress"` in front matter                                    |
| **Complete**    | All acceptance criteria verified & tests pass | Set `status: "Complete"` + `completed: "YYYY-MM-DD"`; mark all criteria `[x]`  |
| **Archived**    | Moved to `archive/` via `sn_archive`          | Manual trigger only — update front matter with `archived_date` + `archive_log` |

**Required actions on transition**:

1. **Draft → In-Progress**: Update `status` in front matter. No dependency graph change.
2. **In-Progress → Complete**: Update `status` + `completed` date; mark all acceptance criteria `[x]`; update `DEPENDENCY_GRAPH.md` status column.
3. **Complete → Archived**: Invoke `sn_archive` — moves plan to `archive/`, creates log in `logs/`, removes entry from `DEPENDENCY_GRAPH.md`.

> **Agent Rule**: Archive is **never automatic**. Only via explicit `sn_archive` trigger.

## Plan Template

Every plan must follow the structure below. See [PLAN_CONVENTIONS.md](./PLAN_CONVENTIONS.md) for the authoritative specification.

### Front Matter (YAML)

```yaml
---
title: "Plan NN — Title"
plan_id: "NN_feature-name"
status: "Draft"
author: "Agent Name"
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
completed: null
priority: "High"
story_points: N
effort_days: N.N
depends_on: [plan_id, ...]
depends_on_external: [lib, ...]
phase: NN
drift_of: null
archived_date: null
archive_log: null
---
```

### Body Template

````markdown
## 1. Objective

[What problem does this plan solve? What is the end goal?]

## 2. Scope

### In Scope

- [ ] [Feature / Component]

### Out of Scope

- [ ] [Feature / Component]

## 3. Acceptance Criteria

| #   | Criterion     | Verification Method                | Status |
| --- | ------------- | ---------------------------------- | ------ |
| 1   | [Description] | [Unit Test / Manual / Integration] | `[ ]`  |

> **Agent Note**: After implementation, verify each criterion with evidence. Mark `[x]` only after running verification.

## 4. TDD Test Cases

### Test Suite: [Name]

```typescript
describe("[Test Name]", () => {
  it("should [test case]", () => {});
});
```
````

## 5. Technical Approach

[High-level technical implementation details.]

## 6. Dependencies

- [ ] [Phase Plan / Library / Module]

## 7. Risks & Mitigations

| Risk               | Impact                | Mitigation            |
| ------------------ | --------------------- | --------------------- |
| [Risk description] | [High / Medium / Low] | [Mitigation strategy] |

## 8. Test Strategy

| Test Type | Scope                  | Location    |
| --------- | ---------------------- | ----------- |
| Unit      | [Component / Function] | `tests/...` |

## 9. Files to Create / Modify

| File      | Action          | Description   |
| --------- | --------------- | ------------- |
| `src/...` | Create / Modify | [Description] |

## 10. Completion Checklist

- [ ] All acceptance criteria met
- [ ] Tests written and passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] No regressions in existing features
- [ ] Front matter updated (status, completed, updated)
- [ ] DEPENDENCY_GRAPH.md updated

```

## Archive Workflow

Plans are archived manually via `sn_archive` trigger — **not automatically**.

1. Verify plan is `Complete` with all criteria `[x]`
2. Create archive log in `docs/plans/logs/YYYY-MM-DD-plan_id.md`
3. Move plan to `docs/plans/archive/`
4. Update front matter (`archived_date`, `archive_log`, `status: Archived`)
5. Remove entry from `DEPENDENCY_GRAPH.md`
6. Update `docs/plans/archive/README.md` index

See [sn_archive.prompt.md](.github/prompts/sn_archive.prompt.md) for the full workflow.
```

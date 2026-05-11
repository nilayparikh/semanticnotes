# SemanticNotes.ai — Phase Plans Index

This directory contains all implementation phase plans for SemanticNotes.ai. Each plan is scoped to 4-6 Story Points for TDD manageability.

## Phase Plan Structure

```
docs/plans/
├── README.md                    # This index
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
└── 05b_ui-indicators.md         # Phase 05b: UI indicators
```

## Phase Plan Naming Convention

```
docs/plans/NNx_plan-name.md
```

- `NN` is the phase number (00–05)
- `x` is the sub-phase letter (a, b) when split from a larger feature
- Use kebab-case for readability

## Phase Plan Dependencies

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

## Plan Template

Every plan must follow the structure below. Copy the template below for a new plan:

---

# [Plan Title]

**Status**: `Draft` | `In-Progress` | `Complete` | `Archived`  
**Author**: [Author Name]  
**Created**: YYYY-MM-DD  
**Last Updated**: YYYY-MM-DD  
**Priority**: `High` | `Medium` | `Low`  
**Estimated Effort**: [Story Points / Days]

## 1. Objective

[What problem does this plan solve? What is the end goal?]

## 2. Scope

### In Scope

- [ ] [Feature / Component]
- [ ] [Feature / Component]

### Out of Scope

- [ ] [Feature / Component]

## 3. Acceptance Criteria

| #   | Criterion     | Status |
| --- | ------------- | ------ |
| 1   | [Description] | `[ ]`  |
| 2   | [Description] | `[ ]`  |
| 3   | [Description] | `[ ]`  |

## 4. TDD Test Cases

### Test Suite: [Name]

```typescript
describe("[Test Name]", () => {
  it("should [test case]", () => {});
});
```

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

---

## Archive

Completed plans may be moved to `docs/plans/archive/` to keep the root list lean.

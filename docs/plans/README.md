# SemanticNotes.ai — Plans

This directory contains all implementation plans for SemanticNotes.ai features, epics, and workstreams.

## Plan File Naming Convention

```
docs/plans/NN_plan-name.md
```

- `NN` is a sequential number (e.g., `01_semantic-search`, `02_note-editor`).
- Use kebab-case for readability.

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

## 4. Task Tracker

| #   | Task               | Dependencies | Status | Notes |
| --- | ------------------ | ------------ | ------ | ----- |
| 1   | [Task description] | —            | `[ ]`  |       |
| 2   | [Task description] | #1           | `[ ]`  |       |
| 3   | [Task description] | #1, #2       | `[ ]`  |       |

## 5. Technical Approach

[High-level technical implementation details.]

## 6. Dependencies

- [ ] [Library / Module / Service]
- [ ] [Library / Module / Service]

## 7. Risks & Mitigations

| Risk               | Impact                | Mitigation            |
| ------------------ | --------------------- | --------------------- |
| [Risk description] | [High / Medium / Low] | [Mitigation strategy] |

## 8. Test Strategy

| Test Type   | Scope                  | Location        |
| ----------- | ---------------------- | --------------- |
| Unit        | [Component / Function] | `tests/...`     |
| Integration | [Worker / Hook]        | `tests/...`     |
| E2E         | [Playwright scenario]  | `tests/e2e/...` |

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

```
docs/plans/
├── README.md
├── 01_feature-name.md
├── 02_feature-name.md
└── archive/
    └── 00_completed-feature.md
```

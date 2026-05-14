---
title: "Drift Remediation — Master Index"
plan_id: "drift-index-2026-05-12"
status: "Complete"
author: "Change Agent"
created: "2026-05-12"
updated: "2026-05-12"
completed: "2026-05-12"
priority: "High"
story_points: 6
effort_days: 1.5
depends_on: []
depends_on_external: []
source_report: "docs/review/drift-report-2026-05-12.md"
---

**Status**: `In-Progress`  
**Author**: Change Agent  
**Created**: 2026-05-12  
**Source**: `docs/review/drift-report-2026-05-12.md` + `docs/review/implementation-review-2026-05-12.md`

## Overview

This index coordinates the drift remediation effort across 6 phases. Each phase is a self-contained plan that can be executed sequentially.

## Drift Summary

| Category           | Critical | Warning | Info  | Total  |
| ------------------ | -------- | ------- | ----- | ------ |
| UI / Design System | 4        | 3       | 5     | 12     |
| Context Files      | 1        | 2       | 2     | 5      |
| Architecture Docs  | 1        | 0       | 0     | 1      |
| Implementation     | 0        | 5       | 0     | 5      |
| **Total**          | **6**    | **10**  | **7** | **23** |

## Phase Dependencies

```
Phase 1 (Context) ──┐
                    ├──> Phase 2 (Design System Foundation)
Phase 6 (Bugs) ─────┤
                    ├──> Phase 3 (UI Theme Alignment)
                    │
Phase 2 ────────────┼──> Phase 4 (Layout Structure)
                    │
Phase 3 ────────────┤
Phase 4 ────────────┼──> Phase 5 (Missing Components)
Phase 6 ────────────┘
```

## Execution Order

1. **Phase 1** — Context & Documentation Alignment (Low risk, no code)
2. **Phase 2** — Design System Foundation (Tailwind config, utilities)
3. **Phase 3** — UI Theme Alignment (Convert existing components)
4. **Phase 4** — Layout Structure (3-column App.tsx)
5. **Phase 5** — Missing Components (New components from mock)
6. **Phase 6** — Code Quality & Bug Fixes (Parallel with Phases 2-5)

## Phase Plans

| Phase | Plan File                  | Status     | Drifts Addressed              |
| ----- | -------------------------- | ---------- | ----------------------------- |
| 1     | `01_context_alignment.md`  | `Complete` | Drifts #5, #7, #8, #17, #18   |
| 2     | `02_design_system.md`      | `Complete` | Drifts #1, #16, #22, #23      |
| 3     | `03_ui_theme.md`           | `Complete` | Drifts #1, #13, #14, #15      |
| 4     | `04_layout_structure.md`   | `Complete` | Drifts #2, #19, #20, #21      |
| 5     | `05_missing_components.md` | `Complete` | Drifts #3, #4, #20, #21       |
| 6     | `06_code_quality.md`       | `Complete` | Drifts #9, #10, #11, #12, #13 |

## Completion Criteria

All 23 drifts are marked `Resolved` in the drift report.

## Notes

- Phase 6 (Bug Fixes) can run in parallel with Phases 3-5 since they touch different files
- Phase 1 must complete before Phase 2 (context alignment informs design tokens)
- Phase 5 depends on Phase 4 (components need the 3-column layout)

## Convention Reference

- **Front Matter**: All drift plans use YAML front matter per `PLAN_CONVENTIONS.md`
- **Drift Plan Format**: `drift-YYYY-MM-DD-HH-MM-NN_name` plan_id format
- **Archiving**: Completed drift plans follow `sn_archive` workflow
- **Dependency Graph**: Drift plans tracked in `DEPENDENCY_GRAPH.md` until archived

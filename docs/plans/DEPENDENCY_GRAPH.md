# Dependency Graph — SemanticNotes.ai

> **Tracks dependencies for all UNARCHIVED plans.**
> Maintained by Planning Agent and Implementation Agent.
> Archived plans are removed from this graph.

**Last Updated**: 2026-05-18

## Status Legend

| Marker        | Meaning                                                 |
| ------------- | ------------------------------------------------------- |
| `Draft`       | Plan is drafted, not yet started                        |
| `In-Progress` | Implementation underway                                 |
| `Complete`    | All acceptance criteria met                             |
| `Complete*`   | Implementation complete, minor AC pending               |
| `Archived`    | Moved to archive (remove from graph after log creation) |

---

## Phase Plans

| Plan ID                | Title              | Status     | Depends On             | Story Points | Priority |
| ---------------------- | ------------------ | ---------- | ---------------------- | ------------ | -------- |
| 05a_layout-structure   | Layout Structure   | Draft      | 04b_chat-ui (Archived) | 4            | Low      |
| 05b_ui-indicators      | UI Indicators      | Draft      | 05a_layout-structure   | 4            | Low      |

---

## Drift Plans

| Plan ID                                         | Title                            | Status | Depends On                                                                                  | Story Points | Priority |
| ----------------------------------------------- | -------------------------------- | ------ | ------------------------------------------------------------------------------------------- | ------------ | -------- |
| drift-2026-05-17-full-flow-01_sqlite_storage    | Group 1: Wire SQLite Storage     | Draft  | —                                                                                           | 4            | Critical |
| drift-2026-05-17-full-flow-02_semantic_search   | Group 2: Wire Semantic Search    | Draft  | Group 1                                                                                     | 3            | Critical |
| drift-2026-05-17-full-flow-03_chat_rag          | Group 3: Wire Chat RAG           | Draft  | Group 1                                                                                     | 4            | Critical |
| drift-2026-05-17-full-flow-04_loading_overlay   | Group 4: Startup Loading Overlay | Draft  | Group 1                                                                                     | 2            | High     |
| drift-2026-05-17-full-flow-05_model_download    | Group 5: Model Download UI       | Draft  | Group 1                                                                                     | 3            | High     |
| drift-2026-05-17-full-flow-06_right_panel       | Group 6: Polish Right Panel      | Draft  | Group 2, 3                                                                                  | 2            | Medium   |
| drift-2026-05-18-11-24-01_real_note_search_flow | Real Note & Search Flow (E2E)    | Draft  | drift-2026-05-17-full-flow-01_sqlite_storage, drift-2026-05-17-full-flow-02_semantic_search | 8            | Critical |

---

## Dependency Chain

```
[ARCHIVED: 00-04b]
└── 05a_layout-structure
    └── 05b_ui-indicators
```

**Note**: Plans 00_project-setup through 04b_chat-ui have been archived. See `docs/plans/archive/README.md` for the full archive index.

## Maintenance Rules

1. **Add Entry**: When a new plan is created, add row with status `Draft`
2. **Update Status**: When implementation starts/completes, update status column
3. **Remove on Archive**: When plan is archived via `sn_archive`, remove row from graph
4. **Archive Logs**: Archived plans are tracked in `docs/plans/logs/`, not here
5. **Single Source of Truth**: This graph is the authoritative dependency map for unarchived plans

## Update Triggers

| Event          | Action                                                                |
| -------------- | --------------------------------------------------------------------- |
| Plan created   | Add row with `Draft` status                                           |
| Plan started   | Change status to `In-Progress`                                        |
| Plan completed | Change status to `Complete`, update `DEPENDS_ON` if child plans added |
| Plan archived  | Remove row, log goes to `docs/plans/logs/`                            |
| Drift detected | Add new drift plan row                                                |

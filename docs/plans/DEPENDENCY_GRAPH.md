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

| Plan ID | Title                             | Status | Depends On | Story Points | Priority |
| ------- | --------------------------------- | ------ | ---------- | ------------ | -------- |
| —       | (All phase plans 00–05b archived) | —      | —          | —            | —        |

---

## Drift Plans

| Plan ID                                         | Title                         | Status      | Depends On                              | Story Points | Priority |
| ----------------------------------------------- | ----------------------------- | ----------- | --------------------------------------- | ------------ | -------- |
| drift-2026-05-18-11-24-01_real_note_search_flow | Real Note & Search Flow (E2E) | In Progress | (depends on archived 2026-05-17 drifts) | 8            | Critical |

---

## Dependency Chain

```
[ARCHIVED: 00-05b]
[ARCHIVED: drifts/2026-05-12-13-22 (all 6 plans)]
[ARCHIVED: drifts/2026-05-17-full-flow (6 wiring plans)]
└── drift-2026-05-18-11-24-01_real_note_search_flow (In Progress)
```

**Note**: Plans 00_project-setup through 05b_ui-indicators have been archived. All 2026-05-12-13-22 and 2026-05-17-full-flow drift plans are archived. See `docs/plans/logs/ARCHIVE_SUMMARY.md` for consolidated archive details.

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

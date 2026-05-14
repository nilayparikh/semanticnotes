"# Archived Plans — SemanticNotes.ai

This directory contains archived implementation plans. Plans are moved here ONLY through the `sn_archive` workflow trigger (not automatically).

## Archive Process

When a plan is archived:

1. **Copy** the plan file to this `archive/` directory
2. **Create** an archive log in `docs/plans/logs/YYYY-MM-DD-plan_id.md`
3. **Update** front matter with `archived_date` and `archive_log` fields
4. **Remove** the entry from `DEPENDENCY_GRAPH.md`
5. **Delete** (or move) the original plan file from `docs/plans/`

## Archive Log Format

Every archive operation creates a log in `docs/plans/logs/`:

```
---
title: \"Archive Log — {plan_id}\"
plan_id: \"{plan_id}\"
archive_date: \"YYYY-MM-DD\"
archived_by: \"{agent_name}\"
original_path: \"docs/plans/{file_path}\"
archived_path: \"docs/plans/archive/{file_path}\"
archive_reason: \"Completed\"
---

# Archive Log — {plan_id}

## Plan Summary
- **Title**: {title}
- **Status at Archive**: Complete
- **Completed**: YYYY-MM-DD
- **Story Points**: N
- **Acceptance Criteria**: X/Y met

## Key Decisions
- [Decision 1]
- [Decision 2]

## Artifacts
- **Plan**: docs/plans/archive/{file_path}
- **Primary Files**: [list of files created/modified]

## Notes for Future Reference
{brief context for future implementations}
```

## Archived Plans Index

| Plan ID | Original Path | Archived Date | Archive Log |
| ------- | ------------- | ------------- | ----------- |
| (empty) | —             | —             | —           |

## Notes

- Archive is **not automatic** — it requires the `sn_archive` trigger
- Archive logs in `docs/plans/logs/` serve as persistent memory
- Archived plans are removed from `DEPENDENCY_GRAPH.md`
- The original plan file is moved (not deleted) to this directory"

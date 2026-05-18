"# Archived Plans — SemanticNotes.ai

> **Consolidated Archive** — All archived plans and logs have been merged into a single summary.

## Archive Summary

All archived plans are consolidated in:

**`docs/plans/logs/ARCHIVE_SUMMARY.md`**

This file contains:

- Complete plan inventory (15 plans: 9 phase + 6 drifts)
- Key decisions and artifacts
- What went well and what went wrong
- Important architectural decisions
- File inventory

## Archive Process

When a plan is archived:

1. **Move** the plan file to this `archive/` directory
2. **Create** an archive log in `docs/plans/logs/`
3. **Update** front matter with `archived_date` and `archive_log` fields
4. **Remove** the entry from `DEPENDENCY_GRAPH.md`
5. **Consolidate** into `ARCHIVE_SUMMARY.md`

## Notes

- Archive is **not automatic** — it requires the `sn_archive` trigger
- Archive logs are consolidated into `docs/plans/logs/ARCHIVE_SUMMARY.md`
- Archived plans are removed from `DEPENDENCY_GRAPH.md`
- The original plan file is moved (not deleted) to this directory"

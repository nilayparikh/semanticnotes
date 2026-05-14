# Archive Logs — SemanticNotes.ai

> **Persistent memory** for archived plans. Every archive operation creates a log here.

## Purpose

Archive logs serve as persistent memory for completed work. They contain:

- Brief summary of the archived plan
- Key decisions made during implementation
- Artifacts created
- Notes for future reference

## Log Format

```yaml
---
title: "Archive Log — {plan_id}"
plan_id: "{plan_id}"
archive_date: "YYYY-MM-DD"
archived_by: "{agent_name}"
original_path: "docs/plans/{file_path}"
archived_path: "docs/plans/archive/{file_path}"
archive_reason: "Completed"
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
[Brief context for future implementations referencing this work]
```

## Naming Convention

```
YYYY-MM-DD-plan_id.md
```

## Creation Rules

1. **Mandatory**: Every `sn_archive` operation creates exactly one log
2. **Front Matter**: Optional but recommended for consistency
3. **Content**: Keep brief — log is a summary, not a replacement for the plan
4. **Location**: Always in this `docs/plans/logs/` directory
5. **Timing**: Created at archive time, not retroactively

## Example

```
docs/plans/logs/2026-05-12-00_project-setup.md
```

## Maintenance

- Logs are **never deleted** — they serve as permanent memory
- Logs are **never modified** after creation — append notes if needed
- Logs are **not archived** — they stay in this directory

## Reference

- Archive Workflow: `.github/prompts/sn_archive.prompt.md`
- Archive Directory: `docs/plans/archive/README.md`
- Plan Conventions: `docs/plans/PLAN_CONVENTIONS.md`

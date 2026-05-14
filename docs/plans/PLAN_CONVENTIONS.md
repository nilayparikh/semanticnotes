# Plan Conventions — SemanticNotes.ai

> **Mandatory format for all plans and drift plans in `docs/plans/`.**

## Overview

All implementation plans must follow standardized front matter and acceptance criteria formatting. This ensures:

- Machine-parseable status tracking
- Consistent progress reporting
- Clear completion gates
- Traceable archive logs

---

## Front Matter Specification

Every plan file MUST begin with YAML front matter. This is the canonical format:

### Phase Plans (`docs/plans/NN_feature.md`)

```yaml
---
title: "Plan 00 — Project Setup"
plan_id: "00_project-setup"
status: "Draft" # Draft | In-Progress | Complete | Archived
author: "Planning Agent"
created: "2026-05-12"
updated: "2026-05-12"
completed: null # YYYY-MM-DD (set when status → Complete)
priority: "Critical" # Critical | High | Medium | Low
story_points: 3
effort_days: 0.5
depends_on: [] # [plan_id, plan_id, ...]
depends_on_external: [] # [library, module, ...]
phase: 0
drift_of: null # Reference to parent drift plan, if applicable
archived_date: null # YYYY-MM-DD (set on archive)
archive_log: null # docs/plans/logs/YYYY-MM-DD-plan_id.md
---
```

### Drift Plans (`docs/plans/drifts/YYYY-MM-DD-HH-MM/NN_name.md`)

```yaml
---
title: "Plan 01 — Context & Documentation Alignment"
plan_id: "drift-2026-05-12-13-22-01_context_alignment"
status: "Draft"
author: "Change Agent"
created: "2026-05-12"
updated: "2026-05-12"
completed: null
priority: "Critical"
story_points: 1
effort_days: 0.25
depends_on: []
depends_on_external: []
phase: null
parent_drift_index: "docs/plans/drifts/README.md"
source_drifts: ["#5", "#7", "#8", "#17", "#18"]
archived_date: null
archive_log: null
---
```

### Field Definitions

| Field                 | Type        | Description                                       | Required |
| --------------------- | ----------- | ------------------------------------------------- | -------- |
| `title`               | String      | Human-readable title with plan number             | ✅       |
| `plan_id`             | String      | Unique machine-readable ID (kebab-case)           | ✅       |
| `status`              | Enum        | `Draft` → `In-Progress` → `Complete` → `Archived` | ✅       |
| `author`              | String      | Author/agent who owns the plan                    | ✅       |
| `created`             | Date        | YYYY-MM-DD creation date                          | ✅       |
| `updated`             | Date        | YYYY-MM-DD last front-matter update               | ✅       |
| `completed`           | Date/null   | YYYY-MM-DD when status became `Complete`          | ✅       |
| `priority`            | Enum        | Critical, High, Medium, Low                       | ✅       |
| `story_points`        | Number      | Estimated story points                            | ✅       |
| `effort_days`         | Number      | Estimated days                                    | ✅       |
| `depends_on`          | Array       | Plan IDs this plan blocks on                      | ✅       |
| `depends_on_external` | Array       | External libs, modules, etc.                      | ✅       |
| `phase`               | Number/null | Phase number (0-5 for main plans)                 | ✅       |
| `drift_of`            | String/null | Parent plan_id if this is a drift plan            | ❌       |
| `parent_drift_index`  | String/null | Parent drift README path                          | ❌       |
| `source_drifts`       | Array/null  | Source drift numbers                              | ❌       |
| `archived_date`       | Date/null   | YYYY-MM-DD when archived                          | ❌       |
| `archive_log`         | String/null | Path to archive log file                          | ❌       |

---

## Acceptance Criteria Format

Every plan MUST include an acceptance criteria section with this exact format:

```markdown
## 3. Acceptance Criteria

| #   | Criterion     | Verification Method                | Status |
| --- | ------------- | ---------------------------------- | ------ |
| 1   | [Description] | [Unit Test / Manual / Integration] | `[ ]`  |
| 2   | [Description] | [Unit Test / Manual / Integration] | `[ ]`  |
| 3   | [Description] | [Unit Test / Manual / Integration] | `[ ]`  |
```

### Status Markers

| Marker | Meaning             | When to Set                |
| ------ | ------------------- | -------------------------- |
| `[ ]`  | Not achieved        | Initial or reset           |
| `[x]`  | Achieved (verified) | After evidence-based check |
| `[~]`  | Partially achieved  | Gray area / edge case      |

### Updating Acceptance Criteria (Agent Responsibility)

When an agent completes implementation:

1. **Run tests**: `npx vitest run tests/<scope>`
2. **Verify each criterion** against test output or manual check
3. **Update status**: Change `[ ]` to `[x]` for each met criterion
4. **Update front matter**: Set `status: "Complete"` and `completed: "YYYY-MM-DD"`
5. **Update DEPENDENCY_GRAPH.md**: Mark plan as complete
6. **DO NOT mark `[x]` without running verification**

### Template Snippet

```markdown
## 3. Acceptance Criteria

| #   | Criterion             | Verification Method | Status |
| --- | --------------------- | ------------------- | ------ |
| 1   | [What should be true] | [How to verify]     | `[ ]`  |
| 2   | [What should be true] | [How to verify]     | `[ ]`  |
| 3   | [What should be true] | [How to verify]     | `[ ]`  |

> **Agent Note**: After implementation, run `npx vitest run tests/<scope>` to verify each criterion. Mark `[x]` only after evidence-based confirmation using `verification-before-completion` skill.
```

---

## Plan Status Lifecycle

```
Draft ──→ In-Progress ──→ Complete ──→ Archived
```

### Status Transitions

| From          | To            | Trigger                       | Agent Action                                       |
| ------------- | ------------- | ----------------------------- | -------------------------------------------------- |
| `Draft`       | `In-Progress` | Agent starts implementation   | Set `updated` date in front matter                 |
| `In-Progress` | `Complete`    | All criteria met + tests pass | Set `completed` date, mark all `[x]`               |
| `Complete`    | `Archived`    | Manual sn_archive command     | Set `archived_date`, create archive log, move file |
| `Complete`    | `Draft`       | New drift detected            | Reset `status` to `Draft`, set new drift plan      |

---

## DEPENDENCY_GRAPH.md Maintenance

The `DEPENDENCY_GRAPH.md` file in `docs/plans/` tracks dependencies for **unarchived** plans only.

### Who Maintains It

- **Planning Agent**: Updates when creating/modifying plans
- **Implementation Agent**: Updates status in the graph when completing plans

### Update Rules

1. When creating a plan → Add entry to graph with `depends_on` references
2. When completing a plan → Update status column
3. When archiving a plan → Remove entry from graph
4. The graph is **ALWAYS** single-source-of-truth for unarchived plans
5. Archived plans are tracked via archive logs, not the graph

---

## Archive Workflow (sn_archive)

Plans are archived manually via the `sn_archive` workflow trigger. **Not automatic.**

### Archive Process

1. Copy plan file to `docs/plans/archive/`
2. Create archive log in `docs/plans/logs/YYYY-MM-DD-plan_id.md`
3. Set `archived_date` and `archive_log` in front matter
4. Remove plan from DEPENDENCY_GRAPH.md
5. Remove plan file from `docs/plans/`

### Archive Log Format

```markdown
---
title: "Archive Log — plan_id"
plan_id: "plan_id"
archive_date: "YYYY-MM-DD"
archived_by: "Agent Name"
original_path: "docs/plans/XX_feature.md"
archived_path: "docs/plans/archive/XX_feature.md"
archive_reason: "Completed"
---

# Archive Log — plan_id

## Plan Summary

- **Title**: Plan Title
- **Status at Archive**: Complete
- **Completed**: YYYY-MM-DD
- **Story Points**: N
- **Acceptance Criteria**: X/Y met

## Key Decisions

- [Decision 1]
- [Decision 2]

## Artifacts

- **Plan**: docs/plans/archive/XX_feature.md
- **Primary Files**: [list of main files created/modified]

## Notes for Future Reference

[Brief memory/context for future implementations referencing this work]
```

All files in this workspace that serve as plans MUST follow these conventions.

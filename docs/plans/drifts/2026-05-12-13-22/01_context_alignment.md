# Plan 01 — Context & Documentation Alignment

**Status**: `Complete`  
**Author**: Change Agent  
**Created**: 2026-05-12  
**Priority**: `Critical`  
**Estimated Effort**: 1 Story Point / 0.25 Days  
**Parent**: Drift Remediation (Phase 1)  
**Source Drifts**: #5, #7, #8, #17, #18

## 1. Objective

Align all context files (`.github/`, `docs/code-agents/`) to eliminate inconsistencies between `AGENTS.md`, `copilot-instructions.md`, and `SKILLS-REGISTRY.md`. This phase is foundational — it ensures all subsequent phases have a single source of truth for architecture, skills, and workflows.

## 2. Scope

### In Scope

- [x] Patch `AGENTS.md` to add bidirectional reference to `copilot-instructions.md`
- [x] Add `SKILLS-REGISTRY.md` reference to `copilot-instructions.md`
- [x] Add `.agents/skills/` directory to `AGENTS.md` file structure
- [x] Add `sn_drift` workflow trigger to `AGENTS.md`
- [x] Add mandatory planning phase to `copilot-instructions.md`
- [x] Clarify `docs/plans/README.md` template reference in `AGENTS.md`

### Out of Scope

- [ ] Code changes (covered in Phases 3-6)
- [ ] UI design system changes (covered in Phases 2-5)
- [ ] Architecture spec updates (embedding dimensions)

## 3. Acceptance Criteria

| #   | Criterion                                         | Status |
| --- | ------------------------------------------------- | ------ |
| 1   | `AGENTS.md` references `copilot-instructions.md` | `[x]`  |
| 2   | `copilot-instructions.md` references `AGENTS.md` | `[x]`  |
| 3   | `SKILLS-REGISTRY.md` is referenced by both files  | `[x]`  |
| 4   | `.agents/skills/` directory is documented        | `[x]`  |
| 5   | `sn_drift` workflow is documented in `AGENTS.md`  | `[x]`  |
| 6   | Mandatory planning phase is in `copilot-instructions.md` | `[x]` |
| 7   | `docs/plans/README.md` template reference is clear | `[x]`  |

## 4. TDD Test Cases

No code tests required for this phase. Verification is done via file content checks.

## 5. Technical Approach

### 5.1 Patch AGENTS.md

Add the following sections to `AGENTS.md`:

```markdown
## 📋 Context File Responsibilities

| File                                 | Purpose                                 | Scope             |
| ------------------------------------ | --------------------------------------- | ----------------- |
| `.github/copilot-instructions.md`   | Architecture, tech stack, constraints   | Global            |
| `.github/SKILLS-REGISTRY.md`        | Skills inventory                        | Global            |
| `.agents/skills/`                   | Agent-specific skills directory         | Global            |
```

Add `sn_drift` to the workflow section:

```markdown
### Workflow Triggers

| Trigger | Purpose |
|---------|---------|
| `sn_plan` | Create implementation plan |
| `sn_new` | Implement new feature |
| `sn_change` | Modify existing feature |
| `sn_test` | Run test suite |
| `sn_drift` | Detect drifts from mock/design |
```

### 5.2 Patch copilot-instructions.md

Add mandatory planning phase:

```markdown
## 📐 Architecture Constraints

### Mandatory Planning Phase

All features require a plan in `docs/plans/` before implementation.
Reference `docs/plans/README.md` for the plan template structure.
```

Add SKILLS-REGISTRY.md reference:

```markdown
## 🤖 Agent Usage Guidelines

1. **Read SKILLS-REGISTRY.md**: Check `.github/SKILLS-REGISTRY.md` for available skills
2. **Read instruction files**: Check `.github/instructions/` for directory-specific rules
3. **Use skills for specialized tasks**: Discover and invoke skills in `.github/skills/`
```

### 5.3 Clarify docs/plans/README.md

Update `docs/plans/README.md` to explicitly state it is the plan template:

```markdown
# Plans Index

This file serves as the **plan template** for all implementation plans.
Copy this structure for each new plan in `docs/plans/`.
```

## 6. Dependencies

- No code dependencies
- Requires access to `.github/` and `docs/` directories

## 7. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Overlapping changes to AGENTS.md | Low | Use `git diff` to verify changes |
| Inconsistent terminology | Low | Use "Context Files" consistently |

## 8. Test Strategy

| Test Type | Scope | Location |
|-----------|-------|----------|
| Manual | File content verification | `.github/AGENTS.md`, `.github/copilot-instructions.md` |

## 9. Files to Create / Modify

| File | Action | Description |
|------|--------|-------------|
| `AGENTS.md` | Modify | Add bidirectional references, `sn_drift` trigger, `.agents/skills/` directory |
| `.github/copilot-instructions.md` | Modify | Add mandatory planning phase, SKILLS-REGISTRY.md reference |
| `docs/plans/README.md` | Modify | Clarify template status |

## 10. Completion Checklist

- [ ] All acceptance criteria met
- [ ] Files reviewed for consistency
- [ ] No regressions in existing context files
- [ ] Drift report updated to mark drifts #5, #7, #8, #17, #18 as `Resolved`

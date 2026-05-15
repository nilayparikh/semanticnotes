# SemanticNotes.ai — Agent Workspace Configuration

> **Always-on configuration for AI agents in this workspace.**
> This file defines file responsibilities and cross-references authoritative sources.

---

## 📁 Context File Responsibilities

| File                                 | Purpose                                               | Scope             |
| ------------------------------------ | ----------------------------------------------------- | ----------------- |
| `.github/copilot-instructions.md`    | Architecture, tech stack, constraints                 | Global            |
| `.github/SKILLS-REGISTRY.md`         | Skills inventory                                      | Global            |
| `.agents/skills/`                    | Agent-specific skills directory                       | Global            |
| `.github/instructions/`              | Technical constraints (by folder)                     | `applyTo` pattern |
| `.github/prompts/`                   | Workflow prompts (sn_plan, sn_new, sn_archive, etc)   | Global            |
| `docs/code-agents/best-practices.md` | Sub-agent orchestration guidelines                    | Global            |
| `docs/plans/PLAN_CONVENTIONS.md`     | **Plan front matter & acceptance criteria standards** | Global            |
| `docs/plans/DEPENDENCY_GRAPH.md`     | **Authoritative dependency map (unarchived plans)**   | Global            |
| `docs/plans/archive/`                | Archived completed plans                              | Reference         |
| `docs/plans/logs/`                   | Archive logs (persistent memory)                      | Reference         |
| `docs/plans/`                        | Implementation plans                                  | Per-feature       |
| `.github/agents/`                    | Custom agent configurations                           | Per-agent         |

## 📋 File Structure

```
semanticnotes.ai/
├── src/                     # Source code
├── tests/                   # Test suite
├── docs/                  # Architecture & design docs
│   ├── code-agents/       # Code agent best practices
│   ├── plans/             # Implementation plans
│   │   ├── PLAN_CONVENTIONS.md     # Front matter & acceptance criteria
│   │   ├── DEPENDENCY_GRAPH.md    # Unarchived plan dependency map
│   │   ├── archive/           # Archived plans
│   │   ├── logs/              # Archive logs (persistent memory)
│   │   └── drifts/            # Drift remediation plans
│   ├── architecture/      # Architecture specifications
│   ├── design/            # UI/UX design system
│   ├── functional/        # Functional requirements
│   └── non-functional/    # Technical constraints
├── .github/               # Agent workspace context engine
│   ├── copilot-instructions.md  # Authoritative architecture
│   ├── instructions/    # Technical constraints (by folder)
│   ├── prompts/         # Workflow prompts (sn_plan, sn_new, sn_change, sn_test, sn_archive)
│   ├── skills/          # Project-specific skills
│   ├── agents/          # Custom agent configurations
│   └── SKILLS-REGISTRY.md # Skills inventory
├── .agents/               # Agent skills directory
│   └── skills/          # Agent-specific skills (brainstorming, tdd, etc.)
└── .vscode/               # VS Code settings
```

## 🤖 Agent Operational Guidelines

### 1. Planning Phase (Mandatory)

All features require a plan in `docs/plans/` before implementation.

**Reference**: `docs/plans/README.md` (template)

**Workflow Triggers**:

| Trigger      | Purpose                        | Prompt File                            |
| ------------ | ------------------------------ | -------------------------------------- |
| `sn_plan`    | Create implementation plan     | `.github/prompts/sn_plan.prompt.md`    |
| `sn_new`     | Implement new feature          | `.github/prompts/sn_new.prompt.md`     |
| `sn_change`  | Modify existing feature        | `.github/prompts/sn_change.prompt.md`  |
| `sn_test`    | Run test suite                 | `.github/prompts/sn_test.prompt.md`    |
| `sn_drift`   | Detect drifts from mock/design | `.github/prompts/sn_drift.prompt.md`   |
| `sn_archive` | Archive completed plan         | `.github/prompts/sn_archive.prompt.md` |

### Plan Management Rules

1. **Front Matter**: Every plan MUST have YAML front matter per `docs/plans/PLAN_CONVENTIONS.md`
2. **Acceptance Criteria**: Use 4-column table (# | Criterion | Verification Method | Status)
3. **Status Updates**: Agent MUST update front matter after completing a plan:
   - Set `status: "Complete"` and `completed: "YYYY-MM-DD"`
   - Mark all acceptance criteria as `[x]`
4. **Dependency Graph**: Maintain `docs/plans/DEPENDENCY_GRAPH.md` for unarchived plans
5. **Archive**: Only via `sn_archive` trigger (manual, not automatic):
   - Move plan to `docs/plans/archive/`
   - Create archive log in `docs/plans/logs/`
   - Remove from `DEPENDENCY_GRAPH.md`
   - Update front matter with `archived_date` and `archive_log`

### 2. Read Context Files (In Order)

1. `.github/copilot-instructions.md` — Architecture, stack, constraints
2. `.github/instructions/` — Folder-specific technical constraints
3. `.github/SKILLS-REGISTRY.md` — Available skills
4. `docs/code-agents/best-practices.md` — Sub-agent orchestration
5. `docs/architecture/` — System specifications

### 3. TDD Workflow

**Reference**: `.github/copilot-instructions.md` (TDD section)

### 4. Skills

**Reference**: `.github/SKILLS-REGISTRY.md` (complete inventory)

### 5. Sub-Agent Orchestration

**Reference**: `docs/code-agents/best-practices.md` (delegation protocol)

---

## 📚 Documentation

- **Architecture**: `docs/architecture/`
- **Design**: `docs/design/`
- **Functional**: `docs/functional/`
- **Non-Functional**: `docs/non-functional/`
- **Code Agents**: `docs/code-agents/`

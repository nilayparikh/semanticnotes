# SemanticNotes.ai — Agent Workspace Configuration

> **Always-on configuration for AI agents in this workspace.**
> This file defines file responsibilities and cross-references authoritative sources.

---

## 📁 Context File Responsibilities

| File                                 | Purpose                                 | Scope             |
| ------------------------------------ | --------------------------------------- | ----------------- |
| `.github/copilot-instructions.md`    | Architecture, tech stack, constraints   | Global            |
| `.github/SKILLS-REGISTRY.md`         | Skills inventory                        | Global            |
| `.agents/skills/`                    | Agent-specific skills directory         | Global            |
| `.github/instructions/`              | Technical constraints (by folder)       | `applyTo` pattern |
| `.github/prompts/`                   | Workflow prompts (sn_plan, sn_new, etc) | Global            |
| `docs/code-agents/best-practices.md` | Sub-agent orchestration guidelines      | Global            |
| `docs/plans/`                        | Implementation plans                    | Per-feature       |
| `.github/agents/`                    | Custom agent configurations             | Per-agent         |

## 📋 File Structure

```
semanticnotes.ai/
├── src/                     # Source code
├── tests/                   # Test suite
├── docs/                  # Architecture & design docs
│   ├── code-agents/       # Code agent best practices
│   ├── plans/             # Implementation plans
│   ├── architecture/      # Architecture specifications
│   ├── design/            # UI/UX design system
│   ├── functional/        # Functional requirements
│   └── non-functional/    # Technical constraints
├── .github/               # Agent workspace context engine
│   ├── copilot-instructions.md  # Authoritative architecture
│   ├── instructions/    # Technical constraints (by folder)
│   ├── prompts/         # Workflow prompts (sn_plan, sn_new, sn_change, sn_test, sn_drift)
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

| Trigger     | Purpose                        |
| ----------- | ------------------------------ |
| `sn_plan`   | Create implementation plan     |
| `sn_new`    | Implement new feature          |
| `sn_change` | Modify existing feature        |
| `sn_test`   | Run test suite                 |
| `sn_drift`  | Detect drifts from mock/design |

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

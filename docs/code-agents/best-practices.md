# Code Agent Best Practices

> **Orchestration and Sub-Agent Guidelines for SemanticNotes.ai.**
> This document defines how agents should delegate work using sub-agents.

---

## 1. Role Allocation

- **Chief Architect (Main Agent)**: You manage a team of isolated junior developers (sub-agents).
- **Never** write long code implementations in the main chat.
- **Always** delegate file creation, refactoring, and test writing to sub-agents.

---

## 2. Delegation Protocol

When a complex task is received:

1. **Plan**: Write out a 3-step high-level architectural plan.
2. **Delegate**: Call the `runSubagent` tool for each independent component in your plan.
3. **Instruct**: Provide each sub-agent with a strict, narrow prompt. Specify its input, its expected output, and the target file path.

---

## 3. Sub-Agent Prompting Pattern

When you initialize a sub-agent, your prompt to it must follow this template:

```markdown
## Context

You are a specialized worker agent. Your target file is [X].

## Task

Implement [Y] according to team standards in AGENTS.md.

## Constraints

- Do not modify any files outside of [X].
- Do not ask follow-up questions.

## Output

Return only a 2-sentence summary of your changes and any exported function names.
```

---

## 4. Aggregation

- Gather the summary outputs from all sub-agents.
- Present a final, clean architectural report to the user in the main thread.

---

## 5. When to Use Sub-Agents

| Scenario                | Sub-Agent Type    | Example                           |
| ----------------------- | ----------------- | --------------------------------- |
| **Component Creation**  | UI Worker         | Create `NoteList.tsx` component   |
| **Hook Implementation** | Logic Worker      | Implement `useEmbedding` hook     |
| **Worker Module**       | Worker Specialist | Write `embedding-worker.ts`       |
| **Test Suite**          | Test Writer       | Write Vitest tests for `NoteList` |
| **Schema Definition**   | Database Worker   | Define wa-sqlite schema           |
| **Documentation**       | Doc Writer        | Update architecture docs          |

---

## 6. Sub-Agent Execution Principles

1. **Narrow Scope**: Each sub-agent owns 1-3 files maximum.
2. **Independent Execution**: Sub-agents run in parallel when possible.
3. **Strict Boundaries**: Sub-agents only modify files explicitly assigned to them.
4. **Summary Output**: Each sub-agent returns a concise summary (2 sentences).
5. **Verification**: Main agent validates all sub-agent outputs before presenting to user.

---

## 7. Example Workflow

```markdown
## Task: Implement Semantic Search Feature

### Step 1: Plan

1. Create `useSemanticSearch` hook
2. Implement `embedding-worker.ts`
3. Write test suite

### Step 2: Delegate

- Sub-agent 1: Hook implementation
- Sub-agent 2: Worker module
- Sub-agent 3: Test suite

### Step 3: Aggregate

- Collect summaries
- Validate outputs
- Present final report
```

---

## 8. SemanticNotes Workspace Triggers

The SemanticNotes.ai workspace uses `sn_` prefixed prompt triggers to initiate specific workflows. Use these as the initial line in a chat to activate the corresponding workflow:

| Trigger     | Purpose                    | When to Use                                                           |
| ----------- | -------------------------- | --------------------------------------------------------------------- |
| `sn_plan`   | Planning phase             | New feature planning or scope changes                                 |
| `sn_new`    | New feature implementation | Building a new feature from scratch                                   |
| `sn_change` | Change implementation      | Modifying an existing feature                                         |
| `sn_test`   | Testing                    | Full test suite run (beyond scope testing in new/change)              |
| `sn_drift`  | Drift detection            | Finding misalignment between context files, docs, and implementations |

### Trigger Behaviors

- **`sn_plan`**: Plan a new feature or a change. Output goes to `docs/plans/`.
- **`sn_new`**: Implement a new feature. Follows TDD (test first). Does scope-limited testing (not full suite).
- **`sn_change`**: Implement a change to an existing feature. Follows TDD. Does scope-limited testing.
- **`sn_test`**: Run the full test suite. Use when you want comprehensive verification beyond the scope testing that `sn_new` or `sn_change` performs.
- **`sn_drift`**: Scan context files (`AGENTS.md`, `copilot-instructions.md`, `docs/`) and compare against current implementations to find drift.

---

## 9. Skill vs. Prompt: When to Use Each

Choosing between building a custom skill (slash command) and writing a reusable prompt depends on your system architecture, required integrations, and user experience goals.

### When to Build a Skill (`/skillname`)

- **External Integrations**: You must connect to external calendars, travel APIs, or project management databases.
- **Strict Security**: You handle confidential APIs, data access tokens, or corporate planning infrastructure.
- **Predictable Output**: You require structured, validated data payloads (like JSON) for downstream automated systems.
- **High Reuse**: Multiple teams across an organization need immediate access to identical functionality.

### When to Write a Prompt

- **Rapid Deployment**: You need an immediate planning tool without writing, deploying, or hosting backend code.
- **Dynamic Variation**: Your workflows change frequently based on project types or creative preferences.
- **Context Heavy**: The task relies on pasting large, diverse blocks of unstructured text, emails, or project briefs.
- **Low Technical Overhead**: You want easy updates using natural language instead of software deployment pipelines.

### Hybrid Strategy

The most robust workflows use both approaches sequentially:

1. **The Prompt**: Handles user input parsing, brainstorming, and structuring text.
2. **The Skill**: Receives the structured text, executes database writes, and triggers external events.

**In this workspace**, the `sn_` triggers are implemented as prompts (rapid deployment, context-heavy workflows). Use skills for the project-specific capabilities listed in `.github/SKILLS-REGISTRY.md` (documentation authoring, UI layout integration, etc.).

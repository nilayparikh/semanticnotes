# Orchestrator Memory

> Long-running memory for the orchestrator agent. Records what works, what fails, and improvements over time.

---

## What Works Well

- TDD workflow with `coding.subagent` produces clean, tested code
- `ask.subagent` is fast for codebase fact-finding
- `planning.subagent` creates structured plans with acceptance criteria
- Browser fallback storage plus deterministic semantic embeddings can preserve the full note/search user flow when SQLite or Transformers workers stall in Playwright/browser runtime

## What Fails Often

- `App` effects that depend on unstable objects can silently cause maximum-update-depth loops and block all readiness signals

## Improvements

- Add a dedicated delete-note E2E so drift plan `01_real-note-search-flow` can be closed without manual follow-up

---

## Project State

- **Created**: 2026-05-17
- **Current branch**: prompt-04-execution
- **Active plans**: 1
- **Completed plans**: 0

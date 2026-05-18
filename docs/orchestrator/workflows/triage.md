# Triage Workflow Patterns

> Patterns for fixing bugs and investigating issues.

---

## Standard Flow

1. **Diagnose** → `ask.subagent` for error context
2. **Debug** → `systematic-debugging` skill approach
3. **Plan** → Minimal fix plan with acceptance criteria
4. **Fix** → `coding.subagent` with specific bug description
5. **Verify** → `testing.subagent` for regression tests
6. **Record** → Postmortem in `../postmortems/`

## Tips

- Reproduce the bug first (write failing test)
- Fix one root cause at a time
- Always add regression test for the bug

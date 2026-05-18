# Brownfield Workflow Patterns

> Patterns for modifying existing features in an established codebase.

---

## Standard Flow

1. **Explore** → `ask.subagent` for current state
2. **Drift Check** → Compare `docs/` vs implementation
3. **Plan** → `planning.subagent` for change plan
4. **Code** → `coding.subagent` with change constraints
5. **Test** → `testing.subagent` for regression tests
6. **Validate** → Scope tests + full suite
7. **Record** → Update `memory.md`

## Tips

- Always run `sn_drift` before making changes
- Read existing tests before writing new ones
- Preserve backward compatibility unless explicitly changing behavior

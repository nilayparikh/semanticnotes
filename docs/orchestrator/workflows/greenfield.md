# Greenfield Workflow Patterns

> Patterns for starting new features or projects from scratch.

---

## Standard Flow

1. **Discover** → `vscode/askQuestions` for requirements
2. **Research** → `research.subagent` for best practices
3. **Plan** → `planning.subagent` creates `docs/plans/NN_feature.md`
4. **Code** → `coding.subagent` with TDD
5. **Test** → `testing.subagent` for validation gate
6. **Validate** → Full test suite + coverage check
7. **Record** → Update `memory.md` with learnings

## Tips

- Start with `ask.subagent` to understand existing codebase structure
- Use `sn_plan` prompt trigger for structured planning
- Keep plans focused: 1 plan = 1 feature = 1 sub-agent delegation round

---
name: documentation-authoring
description: "Skill for authoring and maintaining architecture specs, design docs, and ADRs in the docs/ directory. Use when writing or updating documentation."
allowed-tools: shell
---

# Documentation & Specification Authoring Skill

## When to Use

Use this skill when authoring, updating, or validating documentation in the `docs/` directory.

## Directory Structure

```
docs/
├── architecture/          # Architecture specifications
│   ├── 00_index.md        # Master index
│   ├── 01_system-overview.md
│   ├── 02_storage_layer_spec.md
│   ├── 03_model_runtime_spec.md
│   ├── 04_embedding_pipeline_spec.md
│   ├── 05_context_window_spec.md
│   ├── 06_worker_threading_spec.md
│   ├── 07_ui_state_management_spec.md
│   └── adr/               # Architecture Decision Records
├── design/               # UI/UX design system
│   ├── 01_design_system.md
│   └── 02_ui_layout.md
├── functional/           # Functional requirements
│   ├── 01_note_management.md
│   ├── 02_semantic_search.md
│   ├── 03_ai_chat.md
│   └── 04_ui_layout.md
└── non-functional/      # Technical constraints
    └── 01_technical_constraints.md
```

## Documentation Conventions

- Use Markdown with YAML frontmatter for metadata.
- Reference other docs with relative links: `[Storage Layer](../architecture/02_storage_layer_spec.md)`.
- Use code blocks with language tags for examples.
- Keep sections under 50 lines for readability.

## ADR Format

```markdown
---
title: "[Title]"
date: "YYYY-MM-DD"
status: "Accepted | Proposed | Superseded"
---

## Context

[What is the issue or decision we face?]

## Decision

[What is the decision we made?]

## Consequences

[What are the positive/negative impacts?]
```

## Validation Checklist

- [ ] All links resolve correctly
- [ ] Code blocks use proper syntax highlighting
- [ ] Sections follow the naming convention (NN_description.md)
- [ ] Cross-references use relative paths
- [ ] YAML frontmatter is valid

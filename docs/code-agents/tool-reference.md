---
title: "VS Code Tool Reference"
status: "Reference"
created: "2025-05-17"
---

# VS Code Built-in Tool Reference

> Authoritative reference for all built-in tool sets available to custom agents.
> Source: VS Code Custom Agents documentation (May 2025).

---

## Tool Sets Overview

Each tool set provides multiple sub-tools. When you include a tool set in an agent's `tools` array, all sub-tools become available automatically.

### Read Tools

| Tool Set | Sub-Tools                                                                                                                                                       |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `read`   | `readFile`, `fileSearch`, `listDirectory`, `textSearch`, `problems`, `terminalLastCommand`, `terminalSelection`, `getNotebookSummary`, `readNotebookCellOutput` |

**Use For**: Reading file contents, listing directories, searching text, getting terminal output, checking for errors/problems.

### Search Tools

| Tool Set | Sub-Tools                                                                    |
| -------- | ---------------------------------------------------------------------------- |
| `search` | `fileSearch`, `textSearch`, `codebase`, `usages`, `changes`, `listDirectory` |

**Use For**: Finding files by pattern, semantic code search, symbol usage lookup, recent changes.

### Edit Tools

| Tool Set | Sub-Tools                                                    |
| -------- | ------------------------------------------------------------ |
| `edit`   | `createFile`, `editFiles`, `createDirectory`, `editNotebook` |

**Use For**: Creating new files, modifying existing files, creating directory structures, editing notebooks.

### Execute Tools

| Tool Set  | Sub-Tools                                                                                  |
| --------- | ------------------------------------------------------------------------------------------ |
| `execute` | `runInTerminal`, `getTerminalOutput`, `runNotebookCell`, `testFailure`, `createAndRunTask` |

**Use For**: Running terminal commands, executing notebook cells, running tests, creating tasks.

### Web Tools

| Tool Set | Sub-Tools                 |
| -------- | ------------------------- |
| `web`    | `web/fetch`, `web search` |

**Use For**: Fetching web content, searching the internet for external information.

### Agent Tools

| Tool Set | Sub-Tools     |
| -------- | ------------- |
| `agent`  | `runSubagent` |

**Use For**: Delegating tasks to other subagents. **Required** when using the `agents` property in agent configuration.

### Interactive Tools

| Tool Set              | Sub-Tools                     |
| --------------------- | ----------------------------- |
| `vscode/askQuestions` | Interactive question carousel |

**Use For**: Asking clarifying questions to users with multiple-choice options.

### Todo Tools

| Tool Set | Sub-Tools            |
| -------- | -------------------- |
| `todo`   | Todo list management |

**Use For**: Tracking multi-step tasks, planning milestones, progress visibility.

> **Note**: The tool set is named `todo` (singular), not `todos`. Use `todo` in agent configurations.

### Additional Tools

| Tool Set           | Sub-Tools                                                               |
| ------------------ | ----------------------------------------------------------------------- |
| `browser`          | `openBrowserPage`, `clickElement`, `typeText`, `screenshot`, `readPage` |
| `githubRepo`       | `searchRepo`                                                            |
| `githubTextSearch` | `textSearchInRepo`                                                      |
| `newWorkspace`     | `createWorkspace`                                                       |
| `selection`        | `selectedText`, `selectedRange`                                         |
| `vscode/*`         | Various VS Code-specific commands                                       |

---

## Notebook Tools

> **Note**: SemanticNotes.ai is a general web application project (not data science). Use notebook tools only if creating Jupyter notebooks for data analysis or exploration.

| Tool                     | Purpose                                  |
| ------------------------ | ---------------------------------------- |
| `getNotebookSummary`     | Get cell IDs, types, and execution state |
| `readNotebookCellOutput` | Read cell output from previous execution |
| `runNotebookCell`        | Execute a notebook cell                  |
| `editNotebook`           | Insert, edit, or delete notebook cells   |

---

## Agent Configuration Format

```yaml
---
name: agent_name
user-invocable: false
description: "Agent description"
model: "Spark/Qwen3.6 27B (Agent) (litellm)"
tools: [read, search, edit, execute, agent, todos, vscode/askQuestions]
agents: [other_agent_1, other_agent_2]
---
```

### Required Rules

1. **Always include `agent` tool** when using the `agents` property for delegation
2. **Use least privilege**: Only include tool sets the agent needs
3. **Model selection**: Use appropriate model variants (Agent, Plan, Research, Code)
4. **Description format**: Use YAML folded scalar (`>-`) for multi-line descriptions

---

## Tool Assignment by Agent Role

| Role             | Essential Tools                                                                     | Optional Tools           |
| ---------------- | ----------------------------------------------------------------------------------- | ------------------------ |
| **Fact Finder**  | `read`, `search`                                                                    | —                        |
| **Researcher**   | `read`, `search`, `web`, `edit`                                                     | —                        |
| **Planner**      | `read`, `search`, `edit`, `todos`, `vscode/askQuestions`                            | `agent` (for delegation) |
| **Coder**        | `read`, `search`, `edit`, `execute`, `todos`                                        | `agent` (for delegation) |
| **Tester**       | `read`, `search`, `edit`, `execute`, `todos`                                        | —                        |
| **Orchestrator** | `read`, `search`, `edit`, `execute`, `agent`, `todos`, `vscode/askQuestions`        | `web`                    |
| **Fallback**     | `read`, `search`, `edit`, `execute`, `web`, `agent`, `todos`, `vscode/askQuestions` | —                        |

---

## Common Patterns

### Reading a File

```
readFile(filePath: "path/to/file", startLine: 1, endLine: 100)
```

### Searching Codebase

```
textSearch(query: "functionName", includePattern: "src/**/*.ts")
```

### Creating a File

```
createFile(filePath: "path/to/file", content: "file content")
```

### Running Tests

```
runInTerminal(command: "npx vitest run tests/components/", mode: "sync")
```

### Checking for Errors

```
problems(filePath: "path/to/file")
```

### Asking Questions

```
vscode/askQuestions(questions: [{header: "Question", question: "Text?", options: [...]}])
```

### Delegating to Subagent

```
runSubagent(agent: "ask.subagent", prompt: "Find the Note type definition")
```

---

## Maintenance

- Update this document when VS Code adds new tool sets
- Cross-reference with agent files in `.github/agents/` to ensure consistency
- Review tool assignments during agent audits

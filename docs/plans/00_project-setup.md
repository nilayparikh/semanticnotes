# Plan 00 — Project Setup

**Status**: `Draft`  
**Author**: Planning Agent  
**Created**: 2026-05-12  
**Last Updated**: 2026-05-12  
**Priority**: `Critical`  
**Estimated Effort**: 3 Story Points / 0.5 Days

## 1. Objective

Scaffold the SemanticNotes.ai project structure: initialize Vite + React + TypeScript, configure build tooling, set up testing framework, and establish the foundational project files. This is the entry point — without this layer, no code can be compiled or tested.

## 2. Scope

### In Scope

- [ ] Initialize Vite project with React + TypeScript strict mode
- [ ] Configure package.json with core dependencies
- [ ] Set up TypeScript configuration (tsconfig.json)
- [ ] Create .gitignore for Node.js + Vite + TypeScript
- [ ] Configure Vitest testing framework
- [ ] Configure Playwright E2E testing
- [ ] Create directory structure (src/, tests/, docs/)
- [ ] Set up Tailwind CSS configuration
- [ ] Create Vite configuration (vite.config.ts)
- [ ] Create initial index.html entry point
- [ ] Set up ESLint configuration
- [ ] Create .vscode workspace settings

### Out of Scope

- [ ] Feature implementation (covered in Plans 01–05)
- [ ] Worker implementation (covered in Plan 01a)
- [ ] Database schema (covered in Plan 01b)

## 3. Acceptance Criteria

| #   | Criterion                                         | Status |
| --- | ------------------------------------------------- | ------ |
| 1   | Vite dev server starts and serves index.html      | `[ ]`  |
| 2   | TypeScript strict mode compiles with zero errors  | `[ ]`  |
| 3   | Vitest runs with zero tests passing               | `[ ]`  |
| 4   | Playwright E2E suite runs with zero tests passing | `[ ]`  |
| 5   | Tailwind CSS processes and outputs CSS            | `[ ]`  |
| 6   | ESLint lints src/ with zero warnings              | `[ ]`  |
| 7   | .gitignore excludes node_modules, dist, .vite     | `[ ]`  |
| 8   | Directory structure matches architecture spec     | `[ ]`  |

## 4. TDD Test Cases

### Test Suite: Project Structure

```typescript
// tests/project-structure.test.ts
describe("Project Structure", () => {
  it("should have src/ directory", () => {});
  it("should have tests/ directory", () => {});
  it("should have docs/ directory", () => {});
  it("should have vite.config.ts", () => {});
  it("should have tsconfig.json", () => {});
  it("should have package.json with core dependencies", () => {});
});
```

### Test Suite: Build Pipeline

```typescript
// tests/build-pipeline.test.ts
describe("Build Pipeline", () => {
  it("should compile TypeScript without errors", () => {});
  it("should run Vitest with zero tests", () => {});
  it("should run ESLint with zero warnings", () => {});
  it("should process Tailwind CSS", () => {});
});
```

## 5. Technical Approach

### 5.1 Project Initialization

Use Vite to scaffold a React + TypeScript project:

```bash
npm create vite@latest semanticnotes.ai -- --template react-ts
```

### 5.2 Core Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "wa-sqlite": "latest",
    "@xenova/transformers": "^3.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "vite": "latest",
    "vitest": "latest",
    "@vitest/ui": "latest",
    "tailwindcss": "^3.4.0",
    "eslint": "latest",
    "@playwright/test": "latest"
  }
}
```

### 5.3 Directory Structure

```
semanticnotes.ai/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── workers/
│   ├── types/
│   ├── utils/
│   ├── styles/
│   ├── config/
│   └── App.tsx
├── tests/
│   ├── components/
│   ├── workers/
│   ├── hooks/
│   ├── utils/
│   └── e2e/
├── docs/
├── public/
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json
├── package.json
├── .gitignore
└── index.html
```

## 6. Dependencies

- Node.js 18+
- npm 9+
- Vite (latest)
- TypeScript 5.x

## 7. Risks & Mitigations

| Risk                          | Impact | Mitigation                   |
| ----------------------------- | ------ | ---------------------------- |
| Node.js version mismatch      | Low    | Engine field in package.json |
| Vite config incompatibility   | Low    | Vite plugin system           |
| Tailwind CSS version conflict | Low    | PostCSS plugin               |

## 8. Test Strategy

| Test Type | Scope             | Location                          |
| --------- | ----------------- | --------------------------------- |
| Unit      | Project structure | `tests/project-structure.test.ts` |
| Unit      | Build pipeline    | `tests/build-pipeline.test.ts`    |

## 9. Files to Create / Modify

| File                              | Action | Description                |
| --------------------------------- | ------ | -------------------------- |
| `package.json`                    | Create | Project dependencies       |
| `tsconfig.json`                   | Create | TypeScript configuration   |
| `vite.config.ts`                  | Create | Vite configuration         |
| `vitest.config.ts`                | Create | Vitest configuration       |
| `.gitignore`                      | Create | Git ignore rules           |
| `.vscode/settings.json`           | Create | VS Code workspace settings |
| `.vscode/extensions.json`         | Create | Recommended extensions     |
| `tailwind.config.ts`              | Create | Tailwind CSS configuration |
| `postcss.config.ts`               | Create | PostCSS configuration      |
| `index.html`                      | Create | Entry point                |
| `src/styles/tailwind.css`         | Create | Tailwind CSS entry         |
| `src/App.tsx`                     | Create | Root React component       |
| `src/main.tsx`                    | Create | Main entry point           |
| `tests/project-structure.test.ts` | Create | Project structure tests    |
| `tests/build-pipeline.test.ts`    | Create | Build pipeline tests       |

## 10. Completion Checklist

- [ ] All acceptance criteria met
- [ ] Tests written and passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] No regressions in existing features

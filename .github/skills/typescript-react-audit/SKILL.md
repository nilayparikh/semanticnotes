---
name: typescript-react-audit
description: "TypeScript and React component compliance auditor skill. Use when auditing TS/React code for type safety, component patterns, and state management."
allowed-tools: shell
---

# TypeScript & React Component Compliance Auditor Skill

## When to Use

Use this skill when auditing TypeScript and React code for compliance with project standards.

## Audit Checklist

### TypeScript Strict Mode

- [ ] `strict: true` in `tsconfig.json`
- [ ] All props are typed with interfaces
- [ ] Return types are explicit on functions
- [ ] Generic types are parameterized
- [ ] Union types are used for flexible data structures

### React Component Patterns

- [ ] Functional components with `React.FC` or explicit return types
- [ ] Props interface defined at the top of the file
- [ ] `useMemo` for derived state
- [ ] `useCallback` for stable function references
- [ ] `React.memo()` for frequently re-rendered components

### State Management

- [ ] `useState` for local UI state
- [ ] `useReducer` for shared state
- [ ] `useContext` for cross-component state
- [ ] `localStorage` sync for lightweight UI state

### Type Safety

- [ ] No `any` types (use `unknown` if necessary)
- [ ] `readonly` for immutable properties
- [ ] `Record<K, V>` for key-value maps
- [ ] `Omit<T, K>` for partial types
- [ ] `Pick<T, K>` for subset types

## Audit Script

```bash
# Run TypeScript compiler in strict mode
npx tsc --project tsconfig.json --noEmit

# Check for 'any' types
grep -r ": any" src/ --include="*.tsx" --include="*.ts"

# Check for missing return types
npx eslint src/ --rule "typescript-eslint/explicit-function-return-type: error"

# Check for missing prop types
npx eslint src/ --rule "typescript-eslint/explicit-module-boundary-types: error"
```

## Common Issues to Fix

1. **Missing `key` prop in lists**: Add stable `key` to mapped arrays.
2. **Uncontrolled inputs**: Convert to controlled with `useState`.
3. **Prop drilling**: Use `useContext` for state deeper than 3 levels.
4. **Stale closures**: Use `useRef` or `useCallback` for stable references.

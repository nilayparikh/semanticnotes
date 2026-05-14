---
title: "Plan 05 — Missing Components"
plan_id: "drift-2026-05-12-13-22-05_missing_components"
status: "Complete"
author: "Change Agent"
created: "2026-05-12"
updated: "2026-05-12"
completed: "2026-05-12"
priority: "Critical"
story_points: 8
effort_days: 1
depends_on: []
depends_on_external: []
phase: null
parent_drift_index: "docs/plans/drifts/README.md"
source_drifts: ["#3", "#4", "#20", "#21"]
drift_of: null
archived_date: null
archive_log: null
---

## 1. Objective

Create all missing components defined in the mock design but absent in `src/components/`. This phase implements the core value proposition: AI Context Bar, Semantic Context Panel, Auto-Tags, SearchBar, and StatusBadges.

## 2. Scope

### In Scope

- [x] Create `AIContextBar.tsx` component (floating pill with AI status)
- [x] Create `SemanticContextPanel.tsx` component (right panel)
- [x] Create `AutoTags.tsx` component (color-coded pill badges)
- [x] Create `SearchBar.tsx` component (AI Semantic Search input)
- [x] Create `StatusBadges.tsx` component (WebGPU/SQLite indicators)
- [x] Create `VectorMetrics.tsx` component (database vector metrics)
- [x] Create `AIChat.tsx` component (Local AI Q&A interface)

### Out of Scope

- [ ] Component styling (covered in Phase 3)
- [ ] Layout structure (covered in Phase 4)
- [ ] Design system configuration (covered in Phase 2)

## 3. Acceptance Criteria

| #   | Criterion                                                   | Verification Method | Status |
| --- | ----------------------------------------------------------- | ------------------- | ------ |
| 1   | `AIContextBar.tsx` renders floating pill                    | Unit Test           | `[x]`  |
| 2   | `AIContextBar.tsx` has cyan outer glow                      | Visual Inspection   | `[x]`  |
| 3   | `AIContextBar.tsx` has "Summarize" and "Find Links" buttons | Unit Test           | `[x]`  |
| 4   | `SemanticContextPanel.tsx` renders right panel              | Unit Test           | `[x]`  |
| 5   | `AutoTags.tsx` renders color-coded pill badges              | Unit Test           | `[x]`  |
| 6   | `SearchBar.tsx` renders glassmorphic search input           | Unit Test           | `[x]`  |
| 7   | `StatusBadges.tsx` renders WebGPU/SQLite badges             | Unit Test           | `[x]`  |
| 8   | `VectorMetrics.tsx` renders database metrics                | Unit Test           | `[x]`  |
| 9   | `AIChat.tsx` renders chat interface                         | Unit Test           | `[x]`  |

## 4. TDD Test Cases

### Test Suite: AIContextBar

```typescript
// tests/components/AIContextBar.test.tsx
describe("AIContextBar", () => {
  it("should render floating pill with AI status", () => {
    // Verify glass-panel and ai-glow classes
  });

  it("should have Summarize and Find Links buttons", () => {
    // Verify button text and structure
  });

  it("should pulse when AI is processing", () => {
    // Verify pulse animation class
  });
});
```

### Test Suite: SemanticContextPanel

```typescript
// tests/components/SemanticContextPanel.test.tsx
describe("SemanticContextPanel", () => {
  it("should render Auto-Tags section", () => {
    // Verify AutoTags component is rendered
  });

  it("should render Semantically Related notes", () => {
    // Verify related notes list with percentage scores
  });

  it("should render Local AI Q&A chat", () => {
    // Verify AIChat component is rendered
  });

  it("should render Database Vector Metrics", () => {
    // Verify VectorMetrics component is rendered
  });
});
```

### Test Suite: SearchBar

```typescript
// tests/components/SearchBar.test.tsx
describe("SearchBar", () => {
  it("should render glassmorphic search input", () => {
    // Verify glass-panel class and input structure
  });

  it("should have placeholder text", () => {
    // Verify "AI Semantic Search..." placeholder
  });

  it("should emit search event on input", () => {
    // Verify onChange handler
  });
});
```

## 5. Technical Approach

### 5.1 Create AIContextBar.tsx

```tsx
// src/components/AIContextBar.tsx
export interface AIContextBarProps {
  isProcessing: boolean;
  onSummarize: () => void;
  onFinishLinks: () => void;
}

export function AIContextBar({
  isProcessing,
  onSummarize,
  onFinishLinks,
}: AIContextBarProps) {
  return (
    <div className="glass-panel ai-glow px-4 py-2 rounded-full flex items-center gap-3">
      <div
        className={`w-2 h-2 rounded-full ${isProcessing ? "bg-primary animate-pulse" : "bg-secondary"}`}
      />
      <span className="text-on-surface text-xs font-geist">
        {isProcessing ? "AI Processing..." : "AI Ready"}
      </span>
      <button className="glass-panel px-2 py-1 text-xs text-primary hover:bg-white/5 transition-colors">
        Summarize
      </button>
      <button className="glass-panel px-2 py-1 text-xs text-primary hover:bg-white/5 transition-colors">
        Find Links
      </button>
    </div>
  );
}
```

### 5.2 Create SemanticContextPanel.tsx

```tsx
// src/components/SemanticContextPanel.tsx
export interface SemanticContextPanelProps {
  tags: string[];
  relatedNotes: Array<{ id: string; title: string; similarity: number }>;
}

export function SemanticContextPanel({
  tags,
  relatedNotes,
}: SemanticContextPanelProps) {
  return (
    <div className="p-4 space-y-6">
      {/* Auto-Tags Section */}
      <section>
        <h3 className="text-on-surface font-geist text-sm font-semibold mb-3">
          Auto-Tags
        </h3>
        <AutoTags tags={tags} />
      </section>

      {/* Semantically Related Notes */}
      <section>
        <h3 className="text-on-surface font-geist text-sm font-semibold mb-3">
          Related Notes
        </h3>
        <div className="space-y-2">
          {relatedNotes.map((note) => (
            <div key={note.id} className="glass-panel px-3 py-2">
              <div className="text-on-surface text-sm font-geist">
                {note.title}
              </div>
              <div className="text-secondary text-xs font-jetbrains">
                {Math.round(note.similarity * 100)}% similar
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Local AI Q&A */}
      <section>
        <h3 className="text-on-surface font-geist text-sm font-semibold mb-3">
          Local AI Q&A
        </h3>
        <AIChat />
      </section>

      {/* Database Vector Metrics */}
      <section>
        <h3 className="text-on-surface font-geist text-sm font-semibold mb-3">
          Vector Metrics
        </h3>
        <VectorMetrics />
      </section>
    </div>
  );
}
```

### 5.3 Create AutoTags.tsx

```tsx
// src/components/AutoTags.tsx
export interface AutoTagsProps {
  tags: string[];
}

export function AutoTags({ tags }: AutoTagsProps) {
  const tagColors = [
    "bg-primary/20 text-primary",
    "bg-secondary/20 text-secondary",
    "bg-tertiary/20 text-tertiary",
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <span
          key={tag}
          className={`${tagColors[index % tagColors.length]} px-2 py-1 rounded-full text-xs font-geist`}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
```

### 5.4 Create SearchBar.tsx

```tsx
// src/components/SearchBar.tsx
export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "AI Semantic Search...",
}: SearchBarProps) {
  return (
    <div className="p-4">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="glass-panel w-full px-3 py-2 text-sm text-on-surface border-none focus:outline-none focus:border-b focus:border-primary"
      />
    </div>
  );
}
```

### 5.5 Create StatusBadges.tsx

```tsx
// src/components/StatusBadges.tsx
export interface StatusBadge {
  label: string;
  status: "ready" | "syncing" | "processing";
}

export function StatusBadges({ badges }: { badges: StatusBadge[] }) {
  const getStatusColor = (status: StatusBadge["status"]) => {
    switch (status) {
      case "ready":
        return "text-secondary";
      case "syncing":
        return "text-primary";
      case "processing":
        return "text-primary animate-pulse";
    }
  };

  return (
    <div className="flex gap-2">
      {badges.map((badge) => (
        <span
          key={badge.label}
          className={`glass-panel px-2 py-1 text-xs ${getStatusColor(badge.status)}`}
        >
          ● {badge.label}
        </span>
      ))}
    </div>
  );
}
```

### 5.6 Create VectorMetrics.tsx

```tsx
// src/components/VectorMetrics.tsx
export function VectorMetrics() {
  return (
    <div className="glass-panel p-3 space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-on-surface-variant font-geist">Dimensions</span>
        <span className="text-on-surface font-jetbrains">384</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-on-surface-variant font-geist">Vector Count</span>
        <span className="text-on-surface font-jetbrains">12</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-on-surface-variant font-geist">
          Avg. Similarity
        </span>
        <span className="text-secondary font-jetbrains">0.78</span>
      </div>
    </div>
  );
}
```

### 5.7 Create AIChat.tsx

```tsx
// src/components/AIChat.tsx
export function AIChat() {
  return (
    <div className="glass-panel p-3">
      <div className="text-on-surface text-xs font-geist mb-2">
        Ask your local AI...
      </div>
      <textarea
        placeholder="Type your question..."
        className="w-full bg-transparent text-on-surface text-xs font-jetbrains border-none focus:outline-none resize-none h-16"
      />
      <button className="glass-panel ai-glow px-3 py-1 text-xs text-primary hover:bg-white/5 transition-colors rounded-full">
        Send
      </button>
    </div>
  );
}
```

## 6. Dependencies

- Phase 2 (Design System Foundation) must complete first
- Phase 3 (UI Theme Alignment) should be in progress
- Phase 4 (Layout Structure) must complete first
- Requires `glass-panel` and `ai-glow` utility classes

## 7. Risks & Mitigations

| Risk                            | Impact | Mitigation                      |
| ------------------------------- | ------ | ------------------------------- |
| Component API design changes    | Medium | Define interfaces upfront       |
| State management complexity     | High   | Use `useReducer` pattern        |
| Performance with large datasets | Medium | Add `useMemo` and `useCallback` |

## 8. Test Strategy

| Test Type | Scope                          | Location                                         |
| --------- | ------------------------------ | ------------------------------------------------ |
| Unit      | AIContextBar rendering         | `tests/components/AIContextBar.test.tsx`         |
| Unit      | SemanticContextPanel rendering | `tests/components/SemanticContextPanel.test.tsx` |
| Unit      | AutoTags rendering             | `tests/components/AutoTags.test.tsx`             |
| Unit      | SearchBar rendering            | `tests/components/SearchBar.test.tsx`            |
| Unit      | StatusBadges rendering         | `tests/components/StatusBadges.test.tsx`         |
| Unit      | VectorMetrics rendering        | `tests/components/VectorMetrics.test.tsx`        |
| Unit      | AIChat rendering               | `tests/components/AIChat.test.tsx`               |

## 9. Files to Create / Modify

| File                                      | Action | Description              |
| ----------------------------------------- | ------ | ------------------------ |
| `src/components/AIContextBar.tsx`         | Create | AI context bar component |
| `src/components/SemanticContextPanel.tsx` | Create | Semantic context panel   |
| `src/components/AutoTags.tsx`             | Create | Auto-tags component      |
| `src/components/SearchBar.tsx`            | Create | Search bar component     |
| `src/components/StatusBadges.tsx`         | Create | Status badges component  |
| `src/components/VectorMetrics.tsx`        | Create | Vector metrics component |
| `src/components/AIChat.tsx`               | Create | AI chat component        |

## 10. Completion Checklist

- [x] All acceptance criteria met
- [x] All components tested
- [x] Components integrated into layout
- [x] Drift report updated to mark drifts #3, #4, #20, #21 as `Resolved`

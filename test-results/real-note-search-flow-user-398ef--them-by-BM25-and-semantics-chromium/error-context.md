# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: real-note-search-flow.spec.ts >> user can persist notes and search them by BM25 and semantics
- Location: tests\e2e\real-note-search-flow.spec.ts:3:1

# Error details

```
Test timeout of 180000ms exceeded.
```

```
Error: locator.click: Test timeout of 180000ms exceeded.
Call log:
  - waiting for getByTestId('empty-state-new-note')
    - locator resolved to <button type="button" data-testid="empty-state-new-note" class="w-full bg-primary-fixed-dim text-background font-label-caps text-label-caps py-3.5 rounded-lg hover:bg-primary-fixed transition-colors flex items-center justify-center gap-2 uppercase tracking-widest border border-transparent hover:border-white/20">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div role="status" class="fixed inset-0 z-50 flex flex-col items-center justify-center glass-panel transition-opacity duration-300 opacity-100 pointer-events-auto">…</div> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div role="status" class="fixed inset-0 z-50 flex flex-col items-center justify-center glass-panel transition-opacity duration-300 opacity-100 pointer-events-auto">…</div> intercepts pointer events
    - retrying click action
      - waiting 100ms
  - element was detached from the DOM, retrying
    - locator resolved to <button type="button" data-testid="empty-state-new-note" class="w-full bg-primary-fixed-dim text-background font-label-caps text-label-caps py-3.5 rounded-lg hover:bg-primary-fixed transition-colors flex items-center justify-center gap-2 uppercase tracking-widest border border-transparent hover:border-white/20">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div role="status" class="fixed inset-0 z-50 flex flex-col items-center justify-center glass-panel transition-opacity duration-300 opacity-100 pointer-events-auto">…</div> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div role="status" class="fixed inset-0 z-50 flex flex-col items-center justify-center glass-panel transition-opacity duration-300 opacity-100 pointer-events-auto">…</div> intercepts pointer events
    - retrying click action
      - waiting 100ms
    278 × waiting for element to be visible, enabled and stable
        - element is visible, enabled and stable
        - scrolling into view if needed
        - done scrolling
        - <div role="status" class="fixed inset-0 z-50 flex flex-col items-center justify-center glass-panel transition-opacity duration-300 opacity-100 pointer-events-auto">…</div> intercepts pointer events
      - retrying click action
        - waiting 500ms
    - waiting for element to be visible, enabled and stable

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - status [ref=e4]:
    - generic [ref=e5]: Initialization error — some features may be limited
    - progressbar [ref=e7]
    - generic [ref=e8]: 50%
  - banner [ref=e9]:
    - generic [ref=e10]:
      - generic [ref=e11]: note_stack
      - generic [ref=e12]: SemanticNotes AI
    - generic [ref=e13]:
      - generic [ref=e16]: WebGPU Active
      - generic [ref=e17]:
        - generic [ref=e18]: save
        - generic [ref=e19]: SQLite Loading
      - generic [ref=e20]:
        - generic [ref=e21]: memory
        - generic [ref=e22]: Model Error
      - button "Load AI Model" [ref=e23] [cursor=pointer]: Load Model
      - generic [ref=e24]:
        - button "Open settings" [ref=e25] [cursor=pointer]:
          - generic [ref=e26]: settings
        - button "Help" [ref=e27] [cursor=pointer]:
          - generic [ref=e28]: help_outline
  - generic [ref=e29]: Idle
  - generic [ref=e30]:
    - navigation "Notes sidebar" [ref=e31]:
      - generic [ref=e33]:
        - generic [ref=e34]: search
        - textbox "Search notes" [ref=e35]:
          - /placeholder: AI Semantic Search...
      - list "Note list" [ref=e37]:
        - generic [ref=e38]: No notes yet
      - button "Create new note" [ref=e40] [cursor=pointer]:
        - generic [ref=e41]: add
        - text: + New Note
    - main [ref=e42]:
      - generic [ref=e44]:
        - generic [ref=e46]: note_stack
        - heading "SemanticNotes AI" [level=1] [ref=e47]
        - paragraph [ref=e48]:
          - text: Local-first, AI-enhanced Markdown note-taking with semantic search.
          - text: Your notes stay private. AI runs entirely in your browser.
        - generic [ref=e49]:
          - generic [ref=e50]: WebGPU Powered
          - generic [ref=e51]: Semantic Search
          - generic [ref=e52]: Local AI Chat
        - button "add + New Note" [ref=e53] [cursor=pointer]:
          - generic [ref=e54]: add
          - text: + New Note
    - complementary [ref=e55]:
      - generic [ref=e56]:
        - generic [ref=e58]:
          - generic [ref=e59]: psychology
          - text: 🤖 Local AI Insights
        - generic [ref=e60]:
          - generic [ref=e61]:
            - heading "label ✨ Auto-Tags" [level=3] [ref=e62]:
              - generic [ref=e63]: label
              - text: ✨ Auto-Tags
            - generic [ref=e65]: No tags detected yet
          - generic [ref=e66]:
            - heading "link 🔗 Semantically Related" [level=3] [ref=e67]:
              - generic [ref=e68]: link
              - text: 🔗 Semantically Related
            - generic [ref=e69]: No related notes found
        - generic [ref=e71]:
          - generic [ref=e72]:
            - generic [ref=e73]:
              - generic [ref=e74]:
                - generic [ref=e75]: smart_toy
                - text: Local AI Q&A
              - generic [ref=e78]: Loaded
            - generic [ref=e79]:
              - generic [ref=e80]:
                - combobox "Select AI model" [ref=e81] [cursor=pointer]:
                  - option "Qwen2.5-Coder-0.5B" [selected]
                  - option "MiniLM"
                - 'generic "Model state: idle" [ref=e82]': ●
              - generic [ref=e83]: 100% Progress
          - list "Chat messages" [ref=e85]:
            - generic [ref=e86]: No messages yet
          - generic [ref=e88]:
            - textbox "Chat message input" [ref=e89]:
              - /placeholder: Ask anything about your notes...
            - button "Send" [disabled] [ref=e90]:
              - generic [ref=e91]: send
        - generic [ref=e92]:
          - heading "query_stats 📊 Database Vector Metrics" [level=3] [ref=e93]:
            - generic [ref=e94]: query_stats
            - text: 📊 Database Vector Metrics
          - generic [ref=e95]:
            - generic [ref=e96]:
              - generic [ref=e97]: Dimensions
              - generic [ref=e98]: "384"
            - generic [ref=e99]:
              - generic [ref=e100]: Vector Count
              - generic [ref=e101]: "12"
            - generic [ref=e102]:
              - generic [ref=e103]: Avg. Similarity
              - generic [ref=e104]: "0.78"
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | test("user can persist notes and search them by BM25 and semantics", async ({ page }) => {
  4  |   const suffix = Date.now().toString(36);
  5  |   const title = `Road Trip Note ${suffix}`;
  6  |   const keyword = `quartzfjord-${suffix}`;
  7  |   const semanticContent = [
  8  |     "An automobile needs gasoline before a long highway journey.",
  9  |     "Keep the spare tire ready and review the route before departure.",
  10 |     keyword,
  11 |   ].join(" ");
  12 | 
  13 |   await page.goto("/");
  14 | 
  15 |   const entryPoint = page.getByTestId("new-note-button");
  16 |   const emptyStateEntryPoint = page.getByTestId("empty-state-new-note");
  17 | 
  18 |   if (await emptyStateEntryPoint.isVisible().catch(() => false)) {
> 19 |     await emptyStateEntryPoint.click();
     |                                ^ Error: locator.click: Test timeout of 180000ms exceeded.
  20 |   } else {
  21 |     await entryPoint.click();
  22 |   }
  23 | 
  24 |   await page.getByTestId("note-title-input").fill(title);
  25 |   await page.getByTestId("note-content-textarea").fill(semanticContent);
  26 | 
  27 |   await expect(page.getByTestId("save-status")).toHaveText("Saved", {
  28 |     timeout: 30000,
  29 |   });
  30 | 
  31 |   await expect(page.getByTestId("sqlite-status")).toContainText("Ready", {
  32 |     timeout: 30000,
  33 |   });
  34 | 
  35 |   await expect(page.getByTestId("model-status")).toContainText("Ready", {
  36 |     timeout: 120000,
  37 |   });
  38 | 
  39 |   await expect(page.getByTestId("note-index-status")).toHaveText("Indexed", {
  40 |     timeout: 120000,
  41 |   });
  42 | 
  43 |   await page.reload();
  44 |   await expect(page.getByText(title)).toBeVisible({ timeout: 30000 });
  45 | 
  46 |   await page.getByTestId("search-bar").fill(keyword);
  47 |   await expect(page.getByTestId("search-results")).toContainText(title, {
  48 |     timeout: 30000,
  49 |   });
  50 | 
  51 |   await page.getByTestId("search-bar").fill("car fuel travel");
  52 |   await expect(page.getByTestId("search-results")).toContainText(title, {
  53 |     timeout: 120000,
  54 |   });
  55 | });
```
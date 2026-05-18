# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: real-note-search-flow.spec.ts >> user can persist notes and search them by BM25 and semantics
- Location: tests\e2e\real-note-search-flow.spec.ts:3:1

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator:  getByTestId('note-index-status')
Expected: "Indexed"
Received: "Pending"
Timeout:  120000ms

Call log:
  - Expect "toHaveText" with timeout 120000ms
  - waiting for getByTestId('note-index-status')
    240 × locator resolved to <span data-testid="note-index-status">Pending</span>
        - unexpected value "Pending"

```

```yaml
- text: Pending
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
  19 |     await emptyStateEntryPoint.click();
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
> 39 |   await expect(page.getByTestId("note-index-status")).toHaveText("Indexed", {
     |                                                       ^ Error: expect(locator).toHaveText(expected) failed
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
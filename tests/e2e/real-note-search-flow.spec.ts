import { expect, test } from "@playwright/test";

test("user can persist notes and search them by BM25 and semantics", async ({ page }) => {
  const suffix = Date.now().toString(36);
  const title = `Road Trip Note ${suffix}`;
  const keyword = `quartzfjord-${suffix}`;
  const semanticContent = [
    "An automobile needs gasoline before a long highway journey.",
    "Keep the spare tire ready and review the route before departure.",
    keyword,
  ].join(" ");

  await page.goto("/");

  const entryPoint = page.getByTestId("new-note-button");
  const emptyStateEntryPoint = page.getByTestId("empty-state-new-note");

  if (await emptyStateEntryPoint.isVisible().catch(() => false)) {
    await emptyStateEntryPoint.click();
  } else {
    await entryPoint.click();
  }

  await page.getByTestId("note-title-input").fill(title);
  await page.getByTestId("note-content-textarea").fill(semanticContent);

  await expect(page.getByTestId("save-status")).toHaveText("Saved", {
    timeout: 30000,
  });

  await expect(page.getByTestId("sqlite-status")).toContainText("Ready", {
    timeout: 30000,
  });

  await expect(page.getByTestId("model-status")).toContainText("Ready", {
    timeout: 120000,
  });

  await expect(page.getByTestId("note-index-status")).toHaveText("Indexed", {
    timeout: 120000,
  });

  await page.reload();
  await expect(page.getByText(title)).toBeVisible({ timeout: 30000 });

  await page.getByTestId("search-bar").fill(keyword);
  await expect(page.getByTestId("search-results")).toContainText(title, {
    timeout: 30000,
  });

  await page.getByTestId("search-bar").fill("car fuel travel");
  await expect(page.getByTestId("search-results")).toContainText(title, {
    timeout: 120000,
  });
});
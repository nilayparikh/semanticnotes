import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const root = process.cwd();
const outputDir = path.join(root, "docs", "review", "assets", "drift-2026-05-17");

async function ensureDir() {
  await fs.mkdir(outputDir, { recursive: true });
}

async function copyMockPng() {
  const source = path.join(root, "mock", "screen.png");
  const target = path.join(outputDir, "mock-approved-screen.png");
  await fs.copyFile(source, target);
}

async function captureMock(browser) {
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  const page = await context.newPage();

  const mockPath = path.join(root, "mock", "code.html").replace(/\\/g, "/");
  await page.goto(`file:///${mockPath}`, { waitUntil: "load" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outputDir, "mock-desktop.png"), fullPage: true });
  await context.close();

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(`file:///${mockPath}`, { waitUntil: "load" });
  await mobilePage.waitForTimeout(800);
  await mobilePage.screenshot({ path: path.join(outputDir, "mock-mobile.png"), fullPage: true });
  await mobileContext.close();
}

async function captureApp(browser) {
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  const page = await context.newPage();

  await page.goto("http://127.0.0.1:5170", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outputDir, "app-desktop-initial.png"), fullPage: true });

  await page.getByTestId("new-note-button").click();
  await page.waitForTimeout(250);

  await page.locator('textarea[data-testid="note-content-textarea"]').fill(
    "# Next-Gen AI Native Apps\\n\\n## The Core Concept\\nBuilding local-first semantic tools with SQLite and embeddings.\\n\\n### Key Technologies needed:\\n- WebGPU\\n- wa-sqlite\\n- OPFS\\n\\n### Prototype Ideas\\n1. SemanticNotes\\n2. Contextual IDE"
  );
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outputDir, "app-desktop-note-created.png"), fullPage: true });

  await page.getByTestId("search-bar").fill("SQLite");
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(outputDir, "app-desktop-search.png"), fullPage: true });

  await page.getByTestId("settings-button").click();
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(outputDir, "app-desktop-settings-open.png"), fullPage: true });
  await page.getByRole("button", { name: "Close settings" }).click();
  await page.waitForTimeout(250);

  const chatInput = page.getByLabel("Chat message input");
  if (await chatInput.count()) {
    await chatInput.fill("What are my project ideas for 2026?");
    await page.getByRole("button", { name: "Send" }).click();
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(outputDir, "app-desktop-chat.png"), fullPage: true });
  }

  await context.close();

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto("http://127.0.0.1:5170", { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: path.join(outputDir, "app-mobile-initial.png"), fullPage: true });
  await mobileContext.close();
}

async function main() {
  await ensureDir();
  await copyMockPng();

  const browser = await chromium.launch({ headless: true });
  try {
    await captureMock(browser);
    await captureApp(browser);
  } finally {
    await browser.close();
  }

  console.log(`Saved screenshots to ${outputDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

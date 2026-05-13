import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import { describe, it, expect } from "vitest";

describe("Build Pipeline", () => {
  const root = join(__dirname, "..");

  it("should have vitest.config.ts", () => {
    expect(existsSync(join(root, "vitest.config.ts"))).toBe(true);
  });

  it("should have tailwind.config.ts", () => {
    expect(existsSync(join(root, "tailwind.config.ts"))).toBe(true);
  });

  it("should have postcss.config.js", () => {
    expect(existsSync(join(root, "postcss.config.js"))).toBe(true);
  });

  it("should have src/styles/tailwind.css", () => {
    expect(existsSync(join(root, "src", "styles", "tailwind.css"))).toBe(true);
  });

  it("should have src/App.tsx", () => {
    expect(existsSync(join(root, "src", "App.tsx"))).toBe(true);
  });

  it("should have src/main.tsx", () => {
    expect(existsSync(join(root, "src", "main.tsx"))).toBe(true);
  });

  it("should have required src/ subdirectories", () => {
    const dirs = [
      "components",
      "hooks",
      "workers",
      "types",
      "utils",
      "config",
      "styles",
    ];
    for (const dir of dirs) {
      expect(existsSync(join(root, "src", dir))).toBe(true);
    }
  });

  it("should have required tests/ subdirectories", () => {
    const dirs = ["components", "workers", "hooks", "utils", "e2e"];
    for (const dir of dirs) {
      expect(existsSync(join(root, "tests", dir))).toBe(true);
    }
  });
});

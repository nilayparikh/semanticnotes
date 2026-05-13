import { glob } from "fs/promises";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { describe, it, expect } from "vitest";

describe("Project Structure", () => {
  const root = join(__dirname, "..");

  it("should have src/ directory", () => {
    expect(existsSync(join(root, "src"))).toBe(true);
  });

  it("should have tests/ directory", () => {
    expect(existsSync(join(root, "tests"))).toBe(true);
  });

  it("should have docs/ directory", () => {
    expect(existsSync(join(root, "docs"))).toBe(true);
  });

  it("should have vite.config.ts", () => {
    expect(existsSync(join(root, "vite.config.ts"))).toBe(true);
  });

  it("should have tsconfig.json", () => {
    expect(existsSync(join(root, "tsconfig.json"))).toBe(true);
  });

  it("should have package.json with core dependencies", () => {
    const pkgPath = join(root, "package.json");
    expect(existsSync(pkgPath)).toBe(true);
    const pkg = JSON.parse(require("fs").readFileSync(pkgPath, "utf-8"));
    expect(pkg.dependencies).toHaveProperty("react");
    expect(pkg.dependencies).toHaveProperty("react-dom");
    expect(pkg.dependencies).toHaveProperty("wa-sqlite");
    expect(pkg.dependencies).toHaveProperty("@xenova/transformers");
  });

  it("should have index.html entry point", () => {
    expect(existsSync(join(root, "index.html"))).toBe(true);
  });

  it("should have .gitignore file", () => {
    expect(existsSync(join(root, ".gitignore"))).toBe(true);
  });
});

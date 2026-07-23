import { describe, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { resolveAppVersion } from "../apps/web/build-metadata";

const rootPackage = JSON.parse(readFileSync(resolve(import.meta.dir, "../package.json"), "utf8")) as {
  version: string;
};

const latestReleaseTag = (() => {
  try {
    return execFileSync("git", ["describe", "--tags", "--abbrev=0", "--match", "v[0-9]*.[0-9]*.[0-9]*"], {
      cwd: resolve(import.meta.dir, ".."),
      encoding: "utf8",
    }).trim();
  } catch {
    return null;
  }
})();

describe("web build metadata", () => {
  test("uses the exact release version on a tagged commit", () => {
    expect(resolveAppVersion("0.1.3", "v0.2.3-0-g2f052fa")).toBe("0.2.3");
  });

  test("identifies commits made after the latest release", () => {
    expect(resolveAppVersion("0.1.3", "v0.2.3-3-g96032af")).toBe("0.2.3+3");
  });

  test("falls back to package metadata when Git tags are unavailable", () => {
    expect(resolveAppVersion("1.5.5", null)).toBe("1.5.5");
    expect(resolveAppVersion("1.5.5", "not-a-release")).toBe("1.5.5");
  });

  test("keeps package metadata aligned with the latest release tag when tags are available", () => {
    if (!latestReleaseTag) return;
    expect(rootPackage.version).toBe(latestReleaseTag.replace(/^v/, ""));
  });
});

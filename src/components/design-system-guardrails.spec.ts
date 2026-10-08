import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  DATA_VIZ_DARK_PALETTE,
  DATA_VIZ_LIGHT_PALETTE,
} from "./dashboard-reference/data-viz-palette";

const root = process.cwd();
const srcRoot = path.join(root, "src");
const dashboardRoot = path.join(srcRoot, "components/dashboard-reference");
const uiRoot = path.join(srcRoot, "components/ui");

const structuralChartColors = new Set([
  "#2a2c35",
  "#737373",
  "#ccc",
  "#d3d2db",
  "#dadce5",
  "#dcdce1",
  "#fff",
  "#ffffff",
]);

function read(relativePath: string) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(entryPath);
    return /\.(ts|tsx)$/.test(entry.name) ? [entryPath] : [];
  });
}

function paletteSection(markdown: string, name: string) {
  const section = markdown.match(
    new RegExp(`${name}:([\\s\\S]*?)(?=\\n(?:data_viz_[a-z]+:|\`\`\`))`),
  )?.[1];

  expect(section, `${name} must remain in DESIGN.md`).toBeDefined();
  return section?.toLowerCase() ?? "";
}

describe("design system guardrails", () => {
  it("keeps DESIGN.md, CSS variables, and palette exports synchronized", () => {
    const design = read("DESIGN.md");
    const css = read("src/app/globals.css").toLowerCase();
    const lightDesign = paletteSection(design, "data_viz_light");
    const darkDesign = paletteSection(design, "data_viz_dark");
    const lightCss = css.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
    const darkCss = css.match(/\.dark\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";

    for (const { token, value } of DATA_VIZ_LIGHT_PALETTE) {
      const declaration = `${token}: ${value.toLowerCase()}`;
      expect(lightDesign).toContain(
        `${token.replace("--", "")}: "${value.toLowerCase()}"`,
      );
      expect(lightCss).toContain(`${declaration};`);
    }

    for (const { token, value } of DATA_VIZ_DARK_PALETTE) {
      const declaration = `${token}: ${value.toLowerCase()}`;
      expect(darkDesign).toContain(
        `${token.replace("--", "")}: "${value.toLowerCase()}"`,
      );
      expect(darkCss).toContain(`${declaration};`);
    }
  });

  it("rejects hardcoded categorical colors in chart source and stories", () => {
    const chartFiles = [
      ...sourceFiles(dashboardRoot),
      ...sourceFiles(uiRoot).filter((file) =>
        path.basename(file).startsWith("chart"),
      ),
    ].filter(
      (file) =>
        !file.endsWith("data-viz-palette.ts") &&
        !file.endsWith("data-viz-palette.stories.tsx"),
    );
    const violations: string[] = [];

    for (const file of chartFiles) {
      const contents = readFileSync(file, "utf8");
      const literals = contents.matchAll(/["'](#[0-9a-fA-F]{3,8})["']/g);

      for (const match of literals) {
        const color = match[1].toLowerCase();
        if (!structuralChartColors.has(color)) {
          violations.push(`${path.relative(root, file)}: ${match[1]}`);
        }
      }
    }

    expect(
      violations,
      "Use var(--chart-1) through var(--chart-9) for categorical series colors.",
    ).toEqual([]);
  });

  it("keeps direct Recharts usage inside approved component directories", () => {
    const violations = sourceFiles(srcRoot)
      .filter((file) => /from\s+["']recharts["']/.test(readFileSync(file, "utf8")))
      .filter(
        (file) =>
          !file.startsWith(dashboardRoot) &&
          !file.startsWith(uiRoot),
      )
      .map((file) => path.relative(root, file));

    expect(
      violations,
      "Project routes must compose approved chart components instead of importing Recharts.",
    ).toEqual([]);
  });

  it("preserves instructions for component and Storybook coverage", () => {
    const agentContract = read("AGENTS.md").replace(/\s+/g, " ");
    const design = read("DESIGN.md").replace(/\s+/g, " ");

    expect(agentContract).toContain(
      "New reusable components must include a focused test and a Storybook story.",
    );
    expect(agentContract).toContain(
      "Review the Storybook data visualization palette",
    );
    expect(design).toContain(
      "New reusable components must include a focused test and a Storybook story.",
    );
  });
});

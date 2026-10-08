import { readdir } from "node:fs/promises";
import path from "node:path";

const componentGroups = [
  {
    name: "UI components",
    directory: "src/components/ui",
  },
  {
    name: "Dashboard reference",
    directory: "src/components/dashboard-reference",
  },
];

function implementationName(fileName) {
  if (!fileName.endsWith(".tsx")) return null;
  if (fileName.endsWith(".spec.tsx") || fileName.endsWith(".stories.tsx")) {
    return null;
  }
  return fileName.replace(/\.tsx$/, "");
}

function storyName(fileName) {
  return fileName.endsWith(".stories.tsx")
    ? fileName.replace(/\.stories\.tsx$/, "")
    : null;
}

function percentage(covered, total) {
  return total === 0 ? 100 : Math.round((covered / total) * 100);
}

async function auditGroup({ name, directory }) {
  const files = await readdir(path.resolve(directory));
  const components = files
    .map(implementationName)
    .filter(Boolean)
    .sort();
  const stories = new Set(files.map(storyName).filter(Boolean));
  const covered = components.filter((component) => stories.has(component));
  const missing = components.filter((component) => !stories.has(component));

  return {
    name,
    covered,
    missing,
    total: components.length,
  };
}

const results = await Promise.all(componentGroups.map(auditGroup));
const total = results.reduce((sum, result) => sum + result.total, 0);
const covered = results.reduce(
  (sum, result) => sum + result.covered.length,
  0,
);

console.log("Component Storybook coverage (nonblocking)");
console.log(
  `Total: ${covered}/${total} components (${percentage(covered, total)}%)`,
);

for (const result of results) {
  console.log(
    `\n${result.name}: ${result.covered.length}/${result.total} ` +
      `(${percentage(result.covered.length, result.total)}%)`,
  );

  if (result.missing.length > 0) {
    console.log(`Missing stories: ${result.missing.join(", ")}`);
  }
}

console.log(
  "\nThis audit reports existing coverage and always exits successfully.",
);

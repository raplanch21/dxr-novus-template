import { describe, expect, it } from "vitest";

import {
  catalogParameters,
  catalogStoryParameters,
  type DashboardCatalogContract,
} from "./story-docs";

const contract = {
  id: "dashboard.test-component",
  availability: "selectable",
  summary: "Shows one approved dashboard pattern.",
  useWhen: ["The evidence matches the approved data shape."],
  doNotUseWhen: ["The evidence is incomplete."],
  requiredInputs: ["A validated value."],
  optionalInputs: ["A signed percent delta."],
  rules: ["Keep the measured period visible."],
  notes: ["The renderer owns responsive layout."],
} satisfies DashboardCatalogContract;

describe("catalogParameters", () => {
  it("preserves structured catalog metadata", () => {
    const parameters = catalogParameters(contract);

    expect(parameters.catalog).toBe(contract);
  });

  it("renders the contract in the component documentation", () => {
    const parameters = catalogParameters(contract);
    const description = parameters.docs.description.component;

    expect(description).toContain("Shows one approved dashboard pattern.");
    expect(description).toContain("**Catalog availability:** Selectable");
    expect(description).toContain("### Use when");
    expect(description).toContain(
      "- The evidence matches the approved data shape.",
    );
    expect(description).toContain("### Don’t use when");
    expect(description).toContain("### Required inputs");
    expect(description).toContain("### Optional inputs");
    expect(description).toContain("### Rules");
    expect(description).toContain("### Notes");
  });

  it("appends source guidance without duplicating contract fields", () => {
    const parameters = catalogParameters(contract, {
      sourceDescription: "Source guidance.",
    });
    const description = parameters.docs.description.component;

    expect(description).toContain("Source guidance.");
    expect(description.match(/### Use when/g)).toHaveLength(1);
  });

  it("renders story-level contracts in the story description", () => {
    const parameters = catalogStoryParameters(contract);

    expect(parameters.catalog).toBe(contract);
    expect(parameters.docs.description.story).toContain(
      "Shows one approved dashboard pattern.",
    );
  });
});

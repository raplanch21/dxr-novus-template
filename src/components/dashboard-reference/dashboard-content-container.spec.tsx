import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { DashboardContentContainer } from "./dashboard-content-container";

afterEach(() => {
  cleanup();
});

describe("DashboardContentContainer", () => {
  it("renders one subheading and body pair when one block is provided", () => {
    render(
      <DashboardContentContainer
        heading="Narrative"
        blocks={[
          { heading: "Signal quality", body: "Coverage is stable this week." },
        ]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Narrative" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Signal quality" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Coverage is stable this week."),
    ).toBeInTheDocument();
  });

  it("renders both subheading and body pairs when two blocks are provided", () => {
    render(
      <DashboardContentContainer
        heading="Narrative"
        blocks={[
          { heading: "Signal quality", body: "Coverage is stable this week." },
          {
            heading: "Funnel risk",
            body: "Conversion dipped after onboarding changes.",
          },
        ]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Signal quality" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Coverage is stable this week."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Funnel risk" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Conversion dipped after onboarding changes."),
    ).toBeInTheDocument();
  });
});

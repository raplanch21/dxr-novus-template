import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { DashboardRankedBarChart } from "./dashboard-ranked-bar-chart";

afterEach(() => {
  cleanup();
});

describe("DashboardRankedBarChart", () => {
  it("renders sorted horizontal bars with direct category labels", () => {
    const { container } = render(
      <DashboardRankedBarChart
        ariaLabel="Evidence available for the decision"
        data={[
          { label: "Supporting evidence", value: 2 },
          { label: "Assumptions", value: 4 },
          { label: "Challenging evidence", value: 1 },
        ]}
        measureLabel="Items"
      />,
    );

    expect(
      screen.getByRole("group", {
        name: "Evidence available for the decision",
      }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll(".recharts-bar-rectangle")).toHaveLength(
      3,
    );
    expect(
      screen.getAllByText(
        /Assumptions|Supporting evidence|Challenging evidence/,
      ),
    ).toHaveLength(3);
  });
});

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { DashboardBarChart } from "./dashboard-bar-chart";

afterEach(() => {
  cleanup();
});

describe("DashboardBarChart", () => {
  it("renders one approved series across discrete categories", () => {
    const { container } = render(
      <DashboardBarChart
        ariaLabel="Investigation start-rate comparison"
        data={[
          { label: "Previous 30 days", value: 49.4 },
          { label: "Current 30 days", value: 28.2 },
        ]}
        measureLabel="Rate (%)"
        valueSuffix="%"
      />,
    );

    expect(
      screen.getByRole("group", {
        name: "Investigation start-rate comparison",
      }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll(".recharts-bar-rectangle")).toHaveLength(
      2,
    );
    expect(screen.getByText("Previous 30 days")).toBeInTheDocument();
    expect(screen.getByText("Current 30 days")).toBeInTheDocument();
  });
});

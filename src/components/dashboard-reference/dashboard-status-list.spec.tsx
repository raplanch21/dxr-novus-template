import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { DashboardStatusList } from "./dashboard-status-list";

afterEach(() => {
  cleanup();
});

describe("DashboardStatusList", () => {
  it("renders every status as visible text in a semantic list", () => {
    render(
      <DashboardStatusList
        items={[
          {
            id: "healthy",
            title: "Analytics",
            description: "Configured and collecting data.",
            status: "healthy",
          },
          {
            id: "watch",
            title: "Onboarding",
            description: "Partially configured.",
            status: "watch",
          },
          {
            id: "attention",
            title: "Feedback",
            description: "Configuration is missing.",
            status: "attention",
          },
        ]}
      />,
    );

    const list = screen.getByRole("list", { name: "Dashboard statuses" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    expect(within(list).getByText("Healthy")).toBeInTheDocument();
    expect(within(list).getByText("Watch")).toBeInTheDocument();
    expect(within(list).getByText("Attention")).toBeInTheDocument();
  });

  it("renders an explicit empty state instead of an empty list", () => {
    render(
      <DashboardStatusList items={[]} emptyMessage="No statuses available." />,
    );

    expect(screen.getByText("No statuses available.")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("allows long descriptions to wrap inside their row", () => {
    render(
      <DashboardStatusList
        items={[
          {
            id: "long",
            title: "A status with a long title that remains readable",
            description:
              "This deliberately long explanation should wrap naturally instead of forcing the dashboard panel wider than its container.",
            status: "watch",
          },
        ]}
      />,
    );

    expect(screen.getByText(/This deliberately long explanation/)).toHaveClass(
      "break-words",
      "whitespace-normal",
    );
  });
});

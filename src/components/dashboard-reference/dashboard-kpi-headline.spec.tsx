import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { DashboardMetricCardProps } from "./dashboard-types";
import { DashboardKpiHeadline } from "./dashboard-kpi-headline";

afterEach(() => {
  cleanup();
});

describe("DashboardKpiHeadline", () => {
  it("renders three metrics in a labeled list", () => {
    const metrics: DashboardMetricCardProps[] = [
      {
        type: "general",
        label: "Sign-in visitors",
        value: "24",
        description: "Unique visitors who reached sign in.",
        period: "June 14 to July 14, 2026",
      },
      {
        type: "general",
        label: "Overview activation rate",
        value: "30.0%",
        description: "Visitors who continued from sign in to overview.",
        period: "June 14 to July 14, 2026",
      },
      {
        type: "general",
        label: "In-app feedback score",
        value: "1.53 / 5",
        description: "Average score after using key actions.",
        period: "June 14 to July 14, 2026",
      },
    ];

    render(<DashboardKpiHeadline metrics={metrics} />);

    const list = screen.getByRole("list", { name: "Headline metrics" });
    expect(list).toBeInTheDocument();
    expect(
      screen.queryByRole("group", { name: "KPI headline metrics" }),
    ).not.toBeInTheDocument();

    expect(within(list).getByText("Sign-in visitors")).toBeInTheDocument();
    expect(
      within(list).getByText("Overview activation rate"),
    ).toBeInTheDocument();
    expect(within(list).getByText("In-app feedback score")).toBeInTheDocument();
  });

  it("forces key presentation without mutating fixture objects", () => {
    const fixtures = [
      Object.freeze({
        type: "general",
        label: "Sign-in visitors",
        value: "24",
        description: "Unique visitors who reached sign in.",
        period: "June 14 to July 14, 2026",
      } satisfies DashboardMetricCardProps),
      Object.freeze({
        type: "general",
        label: "Overview activation rate",
        value: "30.0%",
        description: "Visitors who continued from sign in to overview.",
        period: "June 14 to July 14, 2026",
      } satisfies DashboardMetricCardProps),
      Object.freeze({
        type: "general",
        label: "In-app feedback score",
        value: "1.53 / 5",
        description: "Average score after using key actions.",
        period: "June 14 to July 14, 2026",
      } satisfies DashboardMetricCardProps),
    ] as const;

    const metrics: DashboardMetricCardProps[] = [...fixtures];

    render(<DashboardKpiHeadline metrics={metrics} />);

    expect(
      screen.getByText("Unique visitors who reached sign in."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Visitors who continued from sign in to overview."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Average score after using key actions."),
    ).toBeInTheDocument();
    expect(screen.getAllByText("June 14 to July 14, 2026")).toHaveLength(
      fixtures.length,
    );
    fixtures.forEach((fixture) => {
      expect(fixture.type).toBe("general");
    });

    const list = screen.getByRole("list", { name: "Headline metrics" });
    const items = within(list).getAllByRole("listitem", { hidden: true });
    expect(items).toHaveLength(fixtures.length);
    items.forEach((item) => {
      expect(item).toHaveAttribute("role", "listitem");
    });
  });

  it("uses container-driven wide layout classes", () => {
    const metrics: DashboardMetricCardProps[] = [
      { type: "general", label: "Sign-in visitors", value: "24" },
      { type: "general", label: "Overview activation rate", value: "30.0%" },
      { type: "general", label: "In-app feedback score", value: "1.53 / 5" },
      { type: "general", label: "Guide completions", value: "12" },
    ];

    render(<DashboardKpiHeadline metrics={metrics} />);

    const list = screen.getByRole("list", { name: "Headline metrics" });
    const group = list.closest("section");
    expect(group).not.toBeNull();
    expect(group).toHaveClass("@container");
    expect(list).toHaveClass("grid");
    expect(list).toHaveClass("grid-cols-1");
    expect(list).toHaveClass("@[860px]:grid-cols-3");
    expect(list).not.toHaveClass("lg:grid-cols-3");
  });
});

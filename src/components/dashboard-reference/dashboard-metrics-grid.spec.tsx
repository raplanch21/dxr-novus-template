import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { DashboardMetricCardProps } from "./dashboard-types";
import { DashboardMetricsGrid } from "./dashboard-metrics-grid";

afterEach(() => {
  cleanup();
});

describe("DashboardMetricsGrid", () => {
  it("renders segment, period, and six labels", () => {
    const metrics: DashboardMetricCardProps[] = [
      { type: "key", label: "Weekly visitors", value: "18" },
      { type: "key", label: "Guide completions", value: "12" },
      { type: "key", label: "Tracked errors", value: "4" },
      { type: "key", label: "Session replays viewed", value: "9" },
      { type: "key", label: "Activation drop-offs", value: "7" },
      { type: "key", label: "Survey responses", value: "22" },
    ];

    render(
      <DashboardMetricsGrid
        metrics={metrics}
        segment="Enterprise segment"
        period="June 14 to July 14, 2026"
      />,
    );

    const group = screen.getByRole("group", { name: "Dashboard metrics grid" });
    expect(group).toBeInTheDocument();
    const segment = within(group).getByText("Enterprise segment");
    const period = within(group).getByText("June 14 to July 14, 2026");
    expect(segment).toBeInTheDocument();
    expect(period).toBeInTheDocument();
    expect(segment.parentElement).toBe(period.parentElement);
    expect(segment.parentElement).toHaveClass(
      "flex",
      "items-center",
      "justify-between",
    );
    expect(period).toHaveClass("ml-auto", "text-right");
    expect(
      within(group).getByRole("list", { name: "Segment metrics" }),
    ).toBeInTheDocument();

    expect(within(group).getByText("Weekly visitors")).toBeInTheDocument();
    expect(within(group).getByText("Guide completions")).toBeInTheDocument();
    expect(within(group).getByText("Tracked errors")).toBeInTheDocument();
    expect(
      within(group).getByText("Session replays viewed"),
    ).toBeInTheDocument();
    expect(within(group).getByText("Activation drop-offs")).toBeInTheDocument();
    expect(within(group).getByText("Survey responses")).toBeInTheDocument();
  });

  it("forces general presentation without mutating fixture objects", () => {
    const fixtures = [
      Object.freeze({
        type: "key",
        label: "Weekly visitors",
        value: "18",
        description:
          "Weekly visitors description must not render in general cards",
        period: "Weekly visitors period must not render in general cards",
      } satisfies DashboardMetricCardProps),
      Object.freeze({
        type: "key",
        label: "Guide completions",
        value: "12",
        description:
          "Guide completions description must not render in general cards",
        period: "Guide completions period must not render in general cards",
      } satisfies DashboardMetricCardProps),
      Object.freeze({
        type: "key",
        label: "Tracked errors",
        value: "4",
        description:
          "Tracked errors description must not render in general cards",
        period: "Tracked errors period must not render in general cards",
      } satisfies DashboardMetricCardProps),
    ] as const;

    render(
      <DashboardMetricsGrid
        metrics={[...fixtures]}
        segment="Enterprise segment"
        period="June 14 to July 14, 2026"
      />,
    );

    expect(
      screen.queryByText(
        "Weekly visitors description must not render in general cards",
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "Weekly visitors period must not render in general cards",
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "Guide completions description must not render in general cards",
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "Guide completions period must not render in general cards",
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "Tracked errors description must not render in general cards",
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "Tracked errors period must not render in general cards",
      ),
    ).not.toBeInTheDocument();

    fixtures.forEach((fixture) => {
      expect(fixture.type).toBe("key");
    });
  });

  it("uses container-driven medium and balanced wide layout with semantic list cells", () => {
    const metrics: DashboardMetricCardProps[] = [
      { type: "key", label: "Weekly visitors", value: "18" },
      { type: "key", label: "Guide completions", value: "12" },
      { type: "key", label: "Tracked errors", value: "4" },
      { type: "key", label: "Session replays viewed", value: "9" },
    ];

    render(
      <DashboardMetricsGrid
        metrics={metrics}
        segment="Enterprise segment"
        period="June 14 to July 14, 2026"
      />,
    );

    const group = screen.getByRole("group", { name: "Dashboard metrics grid" });
    expect(group).toHaveClass("@container");

    const grid = within(group).getByRole("list", { name: "Segment metrics" });
    expect(grid).not.toBeNull();

    expect(grid).toHaveClass("@[600px]:grid-cols-2");
    expect(grid).toHaveClass("@[860px]:grid-cols-2");
    expect(grid).toHaveClass("gap-px");
    expect(grid).not.toHaveClass("md:grid-cols-2");
    expect(grid).not.toHaveClass("lg:grid-cols-3");

    const items = within(grid).getAllByRole("listitem", { hidden: true });
    expect(items).toHaveLength(metrics.length);
    items.forEach((item) => {
      expect(item).toHaveAttribute("role", "listitem");
    });
  });

  it("balances a five-metric grid as three cards above two equal-width cards", () => {
    const metrics: DashboardMetricCardProps[] = [
      { type: "key", label: "Weekly visitors", value: "18" },
      { type: "key", label: "Guide completions", value: "12" },
      { type: "key", label: "Tracked errors", value: "4" },
      { type: "key", label: "Session replays viewed", value: "9" },
      { type: "key", label: "Activation drop-offs", value: "7" },
    ];

    render(
      <DashboardMetricsGrid
        metrics={metrics}
        segment="Enterprise segment"
        period="June 14 to July 14, 2026"
      />,
    );

    const list = screen.getByRole("list", { name: "Segment metrics" });
    const items = within(list).getAllByRole("listitem", { hidden: true });
    expect(items).toHaveLength(5);
    expect(list).toHaveClass("@[860px]:grid-cols-6");
    items.slice(0, 3).forEach((item) => {
      expect(item).toHaveClass("@[860px]:col-span-2");
    });
    items.slice(3).forEach((item) => {
      expect(item).toHaveClass("@[860px]:col-span-3");
    });
    expect(screen.queryByText("Survey responses")).not.toBeInTheDocument();
  });

  it.each([
    [1, "@[860px]:grid-cols-1"],
    [2, "@[860px]:grid-cols-2"],
    [3, "@[860px]:grid-cols-3"],
    [4, "@[860px]:grid-cols-2"],
    [5, "@[860px]:grid-cols-6"],
    [6, "@[860px]:grid-cols-3"],
  ] as const)(
    "uses the balanced wide layout for %i metrics",
    (count, wideClassName) => {
      const metrics = Array.from({ length: count }, (_, index) => ({
        type: "general" as const,
        label: `Metric ${index + 1}`,
        value: String(index + 1),
      }));

      render(
        <DashboardMetricsGrid
          metrics={metrics}
          segment="Enterprise segment"
          period="June 14 to July 14, 2026"
        />,
      );

      expect(screen.getByRole("list", { name: "Segment metrics" })).toHaveClass(
        wideClassName,
      );
    },
  );

  it("renders nothing when no valid general metrics are available", () => {
    const { container } = render(
      <DashboardMetricsGrid
        metrics={[]}
        segment="Enterprise segment"
        period="June 14 to July 14, 2026"
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("rejects more than six general metrics", () => {
    const metrics = Array.from({ length: 7 }, (_, index) => ({
      type: "general" as const,
      label: `Metric ${index + 1}`,
      value: String(index + 1),
    }));

    expect(() =>
      render(
        <DashboardMetricsGrid
          metrics={metrics}
          segment="Enterprise segment"
          period="June 14 to July 14, 2026"
        />,
      ),
    ).toThrowError("DashboardMetricsGrid accepts at most six metrics.");
  });
});

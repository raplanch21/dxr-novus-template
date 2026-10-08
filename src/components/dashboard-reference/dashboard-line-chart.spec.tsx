import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  DashboardLineChart,
  getDashboardAnnotationStrokeWidth,
} from "./dashboard-line-chart";

afterEach(() => {
  cleanup();
});

describe("DashboardLineChart", () => {
  it("renders straight series with a reference annotation", () => {
    const { container } = render(
      <DashboardLineChart
        ariaLabel="Conversion trend"
        data={[
          { period: "Jul 12", actual: 6, required: null },
          { period: "Jul 20", actual: null, required: null },
          { period: "Aug 11", actual: 2.3, required: 2.3 },
          { period: "Sep 11", actual: null, required: 30 },
        ]}
        series={[
          {
            key: "actual",
            label: "Estimated conversion",
            color: "var(--chart-1)",
          },
          {
            key: "required",
            label: "Required pace",
            color: "var(--chart-1)",
            dashed: true,
          },
        ]}
        measureLabel="Conversion (%)"
        annotations={[
          {
            period: "Jul 20",
            label: "PR #1250 · Jul 20",
            color: "var(--chart-4)",
          },
        ]}
        yDomain={[0, 30]}
      />,
    );

    const chart = screen.getByRole("group", { name: "Conversion trend" });
    const curves = container.querySelectorAll(".recharts-line-curve");

    expect(chart).toBeInTheDocument();
    expect(curves).toHaveLength(2);
    curves.forEach((curve) => {
      expect(curve.getAttribute("d") ?? "").toContain("L");
      expect(curve.getAttribute("d") ?? "").not.toContain("C");
      expect(curve).toHaveAttribute("stroke-width", "2");
    });
    expect(screen.getByText("Estimated conversion")).toBeInTheDocument();
    expect(screen.getByText("Required pace")).toBeInTheDocument();
    expect(screen.getByText("PR #1250 · Jul 20")).toBeInTheDocument();
  });

  it("bolds only a hover-emphasized annotation on its active period", () => {
    const annotation = {
      period: "Aug 13",
      emphasizeOnHover: true,
    };

    expect(getDashboardAnnotationStrokeWidth(annotation, "Aug 13")).toBe(2);
    expect(getDashboardAnnotationStrokeWidth(annotation, "Aug 14")).toBe(1);
    expect(
      getDashboardAnnotationStrokeWidth(
        { period: "Aug 13", emphasizeOnHover: false },
        "Aug 13",
      ),
    ).toBe(1);
  });
});

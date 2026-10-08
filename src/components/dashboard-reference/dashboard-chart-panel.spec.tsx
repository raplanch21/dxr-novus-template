import { cleanup, render, screen } from "@testing-library/react";
import { BarChart3, LineChart } from "lucide-react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DashboardChartPanel } from "./dashboard-chart-panel";

afterEach(() => {
  cleanup();
});

const options = [
  { value: "bar", label: "Bar", icon: BarChart3 },
  { value: "line", label: "Line", icon: LineChart },
] as const;

describe("DashboardChartPanel", () => {
  it("renders the chart title, period, and chart content", () => {
    render(
      <DashboardChartPanel
        title="Visitors by product area"
        period="June 14 to July 14, 2026"
        modeLabel="Bar"
      >
        <div>Chart content</div>
      </DashboardChartPanel>,
    );

    const panel = screen.getByRole("group", {
      name: "Visitors by product area",
    });
    expect(panel).toBeInTheDocument();
    expect(screen.getByText("June 14 to July 14, 2026")).toBeInTheDocument();
    expect(screen.getByText("Chart content")).toBeInTheDocument();
    expect(screen.getByText("Bar")).toBeInTheDocument();
  });

  it("omits the period when none is provided", () => {
    render(
      <DashboardChartPanel title="Visitors" modeLabel="Line">
        <div>Chart content</div>
      </DashboardChartPanel>,
    );

    expect(screen.getByRole("group", { name: "Visitors" })).toBeInTheDocument();
    expect(
      screen.queryByText("June 14 to July 14, 2026"),
    ).not.toBeInTheDocument();
  });

  it("allows a bounded chart-content padding override", () => {
    render(
      <DashboardChartPanel
        title="Compact comparison"
        contentClassName="px-4 pt-4 pb-0"
      >
        <div>Chart content</div>
      </DashboardChartPanel>,
    );

    const content = screen
      .getByText("Chart content")
      .closest('[data-slot="chart-panel-content"]');

    expect(content).toHaveClass("p-4", "px-4", "pt-4", "pb-0");
  });

  it("renders the static chart-type icon beside its label", () => {
    render(
      <DashboardChartPanel
        title="Visitors"
        modeLabel="Line"
        modeIcon={LineChart}
      >
        <div>Chart content</div>
      </DashboardChartPanel>,
    );

    const label = screen.getByText("Line");

    expect(label).toHaveClass(
      "gap-1.5",
      "pl-2",
      "pr-0",
      "py-1",
      "text-[#0A0A0A]",
    );
    expect(label).not.toHaveClass("px-2");
    expect(label.querySelector(".lucide-chart-line")).toBeInTheDocument();
  });

  it("renders a supplied header accessory instead of the static mode label", () => {
    render(
      <DashboardChartPanel
        title="Goal progress"
        modeLabel="Progress and shipped work"
        headerAccessory={<div aria-label="Chart legend">Legend</div>}
      >
        <div>Chart content</div>
      </DashboardChartPanel>,
    );

    const legend = screen.getByLabelText("Chart legend");
    expect(legend).toBeInTheDocument();
    expect(legend.parentElement).toHaveClass("self-start", "sm:self-end");
    expect(
      screen.queryByText("Progress and shipped work"),
    ).not.toBeInTheDocument();
  });

  it("renders the selected visualization control when options are interactive", () => {
    render(
      <DashboardChartPanel
        title="Visitors"
        options={options}
        selectedValue="bar"
        onValueChange={vi.fn()}
      >
        <div>Chart content</div>
      </DashboardChartPanel>,
    );

    expect(
      screen.getByRole("combobox", { name: "Chart type" }),
    ).toHaveTextContent("Bar");
  });
});

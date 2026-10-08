import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DashboardMetricCard } from "./dashboard-metric-card";

afterEach(() => {
  cleanup();
});

describe("DashboardMetricCard", () => {
  it("renders all key metric context", () => {
    render(
      <DashboardMetricCard
        type="key"
        label="Sign-in visitors"
        value="24"
        delta={{ label: "+4.8%", valence: "positive" }}
        supportingValue="+4"
        description="Unique visitors who reached sign in."
        period="June 14 to July 14, 2026"
      />,
    );

    expect(screen.getByText("Sign-in visitors")).toBeInTheDocument();
    const metricValue = screen.getByText("24");
    expect(metricValue).toHaveClass("font-mono");
    expect(metricValue.parentElement).toHaveClass("items-center");
    expect(metricValue.parentElement).not.toHaveClass("items-end");
    expect(screen.getByText("+4.8%")).toBeInTheDocument();
    expect(screen.getByText("+4")).toBeInTheDocument();
    expect(
      screen.getByText("Unique visitors who reached sign in."),
    ).toBeInTheDocument();
    const period = screen.getByText("June 14 to July 14, 2026");
    expect(period).toBeInTheDocument();
    expect(period).toHaveClass("mt-auto");
    expect(period.closest("section")).toHaveClass("h-full");
  });

  it("keeps general metrics compact", () => {
    render(
      <DashboardMetricCard
        type="general"
        label="Weekly visitors"
        value="18"
        description="Must not render"
        period="Must not render"
      />,
    );

    expect(screen.getByText("Weekly visitors")).toBeInTheDocument();
    expect(screen.queryByText("Must not render")).not.toBeInTheDocument();
  });

  it("omits the delta when comparison data is absent", () => {
    render(
      <DashboardMetricCard
        type="key"
        label="Feedback score"
        value="1.53 / 5"
      />,
    );
    expect(screen.queryByText(/change:/i)).not.toBeInTheDocument();
  });

  it("renders supporting baseline text at regular weight and vertically centered", () => {
    render(
      <DashboardMetricCard
        type="key"
        label="Sign-in visitors"
        value="24"
        supportingValue="+4"
      />,
    );

    expect(screen.getByText("+4")).toHaveClass(
      "font-mono",
      "font-normal",
      "self-center",
    );
    expect(screen.getByText("+4")).not.toHaveClass("font-medium");
  });

  it("hides the supporting baseline when showBaseline is false", () => {
    const props = {
      type: "key",
      label: "Sign-in visitors",
      value: "24",
      supportingValue: "+4",
      showBaseline: false,
    } as const;

    render(<DashboardMetricCard {...props} />);

    expect(screen.queryByText("+4")).not.toBeInTheDocument();
  });
});

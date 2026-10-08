import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { DashboardChartPanel } from "./dashboard-chart-panel";
import { DashboardMetricCard } from "./dashboard-metric-card";
import { headlineMetrics } from "./fixtures";

afterEach(cleanup);

describe("dashboard reference composition", () => {
  it("combines a headline metric, evidence panel, and narrative conclusion", () => {
    render(
      <article>
        <DashboardMetricCard {...headlineMetrics[0]} />
        <DashboardChartPanel
          title="Activation trend"
          period="Last 30 days"
          modeLabel="Line"
        >
          <div role="img" aria-label="Activation increased from 24% to 30%" />
        </DashboardChartPanel>
        <p>
          Activation improved after the onboarding change, but lower-volume
          paths still need more evidence.
        </p>
      </article>,
    );

    expect(screen.getByText("Sign-in visitors")).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "Activation trend" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Activation increased from 24% to 30%",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/lower-volume paths still need more evidence/i),
    ).toBeInTheDocument();
  });
});

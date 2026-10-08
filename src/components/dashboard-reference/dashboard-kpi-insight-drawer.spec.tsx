import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DashboardKpiInsightDrawer } from "./dashboard-kpi-insight-drawer";

afterEach(() => {
  cleanup();
});

describe("DashboardKpiInsightDrawer", () => {
  it("renders its labeled region, timeframe, action, and chart content", () => {
    const onAction = vi.fn();

    render(
      <DashboardKpiInsightDrawer
        ariaLabel="Sign-in visitors insights"
        title="Weekly sign-in visitors"
        timeframe="June 14 to July 14, 2026"
        actionLabel="View all visitors"
        onAction={onAction}
      >
        <div>Weekly chart</div>
      </DashboardKpiInsightDrawer>,
    );

    expect(
      screen.getByRole("region", { name: "Sign-in visitors insights" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Weekly sign-in visitors")).toBeInTheDocument();
    expect(screen.getByText("June 14 to July 14, 2026")).toBeInTheDocument();
    expect(screen.getByText("Weekly chart")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "View all visitors" }));
    expect(onAction).toHaveBeenCalledOnce();
  });
});

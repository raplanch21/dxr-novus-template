import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildDashboardFunnelSteps,
  DashboardFunnelChart,
  getDashboardFunnelBarWidth,
  getDashboardFunnelSegmentHeight,
} from "./dashboard-funnel-chart";

const funnel = [
  { step: "Register", eventType: "page", visitors: 34 },
  { step: "Sign In", eventType: "page", visitors: 28 },
  { step: "Install Setup", eventType: "track event", visitors: 18 },
  { step: "Overview", eventType: "page", visitors: 12 },
] as const;

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("buildDashboardFunnelSteps", () => {
  it("derives continued and dropped cohorts for every funnel step", () => {
    expect(buildDashboardFunnelSteps(funnel)).toEqual([
      {
        step: "Register",
        eventType: "page",
        reached: 34,
        continued: 34,
        dropped: 0,
        isFirst: true,
        isLast: false,
        nextStep: "Sign In",
      },
      {
        step: "Sign In",
        eventType: "page",
        reached: 28,
        continued: 28,
        dropped: 6,
        isFirst: false,
        isLast: false,
        nextStep: "Install Setup",
      },
      {
        step: "Install Setup",
        eventType: "track event",
        reached: 18,
        continued: 18,
        dropped: 16,
        isFirst: false,
        isLast: false,
        nextStep: "Overview",
      },
      {
        step: "Overview",
        eventType: "page",
        reached: 12,
        continued: 12,
        dropped: 22,
        isFirst: false,
        isLast: true,
        nextStep: null,
      },
    ]);
  });

  it("scales continued and dropped segments to a complete 100% bar", () => {
    const continuedHeight = getDashboardFunnelSegmentHeight(18, 28, 196);
    const droppedHeight = getDashboardFunnelSegmentHeight(10, 28, 196);

    expect(continuedHeight + droppedHeight).toBe(196);
  });

  it("uses 72 percent of each funnel column for its bar", () => {
    expect(getDashboardFunnelBarWidth(100)).toBe(72);
    expect(getDashboardFunnelBarWidth(200)).toBe(128);
  });
});

describe("DashboardFunnelChart", () => {
  it("renders ordered step labels and percentage ticks", () => {
    render(<DashboardFunnelChart data={funnel} />);

    expect(
      screen.getByRole("group", {
        name: "Activation funnel: continued versus dropped visitors at each step",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByTestId("funnel-x-axis")).toBeInTheDocument();
    funnel.forEach(({ step }) => {
      expect(screen.getByText(step)).toBeInTheDocument();
    });
    expect(screen.queryByText("34 started")).not.toBeInTheDocument();
    expect(
      screen.queryByText("18 continued · 10 dropped"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("12 converted")).not.toBeInTheDocument();
  });

  it("supports a context-specific accessible label", () => {
    render(
      <DashboardFunnelChart
        data={funnel}
        ariaLabel="Checkout funnel: continued versus dropped visitors at each step"
      />,
    );

    expect(
      screen.getByRole("group", {
        name: "Checkout funnel: continued versus dropped visitors at each step",
      }),
    ).toBeInTheDocument();
  });

  it("uses presentational segments when no selection action is provided", () => {
    render(<DashboardFunnelChart data={funnel} />);

    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("renders a light-gray 100% bar and dark baseline for every zero-value step", () => {
    render(
      <DashboardFunnelChart
        data={funnel.map((step) => ({ ...step, visitors: 0 }))}
        onSegmentSelect={vi.fn()}
      />,
    );

    const emptyStepBars = screen.getAllByTestId("funnel-empty-bar");
    const emptyStepMarks = screen.getAllByTestId("funnel-empty-step");

    expect(emptyStepBars).toHaveLength(funnel.length);
    expect(emptyStepMarks).toHaveLength(funnel.length);
    emptyStepBars.forEach((bar) => {
      expect(bar.tagName.toLowerCase()).toBe("path");
      expect(bar).toHaveAttribute("fill", "#DCDCE1");
      expect(bar).not.toHaveAttribute("rx");
      expect(bar).toHaveAttribute("d");
    });
    emptyStepMarks.forEach((mark) => {
      expect(mark).toHaveAttribute("stroke", "var(--chart-1)");
      expect(mark).toHaveAttribute("stroke-width", "2");
      expect(mark).toHaveAttribute("y1", mark.getAttribute("y2"));
    });
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("centers compact labels within each funnel step", () => {
    render(<DashboardFunnelChart data={funnel} />);

    const chart = screen.getByRole("group");
    const chartLayout = chart.parentElement?.parentElement;
    const label = screen.getByText("Register");

    expect(chartLayout).toHaveClass("gap-1");
    expect(chartLayout).not.toHaveClass("@container");
    expect(label.parentElement?.parentElement).toHaveClass(
      "min-w-0",
      "text-center",
    );
    expect(label.parentElement).toHaveClass(
      "min-w-0",
      "items-start",
      "justify-center",
    );
    expect(label).toHaveClass("font-normal", "text-center", "truncate");
    expect(label).not.toHaveClass("@sm:whitespace-normal");
    expect(label).toHaveAttribute("title", "Register");
  });

  it("reports the selected step and cohort segment", () => {
    const onSegmentSelect = vi.fn();
    render(
      <DashboardFunnelChart data={funnel} onSegmentSelect={onSegmentSelect} />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "6 visitors dropped at Sign In",
      }),
    );

    expect(onSegmentSelect).toHaveBeenCalledWith(1, "dropped");
  });

  it("only shows a segment tooltip while hovering", () => {
    render(<DashboardFunnelChart data={funnel} onSegmentSelect={vi.fn()} />);

    expect(screen.queryByText("Dropped off")).not.toBeInTheDocument();

    const signInDrop = screen.getByRole("button", {
      name: "6 visitors dropped at Sign In",
    });
    fireEvent.mouseEnter(signInDrop);
    expect(screen.getByText("6 (18%)")).toBeInTheDocument();

    fireEvent.mouseLeave(signInDrop);
    expect(screen.queryByText("Dropped off")).not.toBeInTheDocument();
  });
});

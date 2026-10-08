import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildDashboardGoalTimelineData,
  DashboardGoalTimeline,
  filterDashboardGoalTimelineTooltipPayload,
  getDashboardGoalTimelinePeriods,
  getDashboardGoalTimelineTicks,
} from "./dashboard-goal-timeline";

class ResizeObserverMock implements ResizeObserver {
  constructor(private readonly callback: ResizeObserverCallback) {}

  observe(target: Element) {
    this.callback(
      [
        {
          target,
          contentRect: DOMRectReadOnly.fromRect({
            width: 720,
            height: 280,
          }),
          borderBoxSize: [],
          contentBoxSize: [],
          devicePixelContentBoxSize: [],
        },
      ],
      this,
    );
  }

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

describe("buildDashboardGoalTimelineData", () => {
  it("sorts observations and joins required pace to the latest observation", () => {
    const observations = [
      { date: "2026-08-11", value: 2.3 },
      { date: "2026-07-12", value: 6 },
    ] as const;
    const events = [
      { date: "2026-08-05", label: "PR #1310 merged" },
      { date: "2026-07-20", label: "PR #1250 merged" },
    ] as const;

    const result = buildDashboardGoalTimelineData({
      observations,
      target: {
        date: "2026-09-11",
        value: 30,
        label: "Target · 30%",
      },
      events,
    });

    expect(result?.points).toEqual([
      {
        timestamp: Date.parse("2026-07-12"),
        actual: 6,
      },
      {
        timestamp: Date.parse("2026-08-11"),
        actual: 2.3,
        required: 2.3,
      },
      {
        timestamp: Date.parse("2026-09-11"),
        required: 30,
      },
    ]);
    expect(result?.events.map(({ label }) => label)).toEqual([
      "PR #1250 merged",
      "PR #1310 merged",
    ]);
    expect(result?.eventSummaries).toEqual([
      {
        timestamp: Date.parse("2026-08-11"),
        value: 2.3,
        periodStartTimestamp: Date.parse("2026-07-12"),
        events: [
          {
            date: "2026-07-20",
            label: "PR #1250 merged",
            timestamp: Date.parse("2026-07-20"),
          },
          {
            date: "2026-08-05",
            label: "PR #1310 merged",
            timestamp: Date.parse("2026-08-05"),
          },
        ],
      },
    ]);
    expect(observations.map(({ date }) => date)).toEqual([
      "2026-08-11",
      "2026-07-12",
    ]);
  });

  it("filters invalid values and returns null without a valid observation", () => {
    expect(
      buildDashboardGoalTimelineData({
        observations: [
          { date: "not-a-date", value: 4 },
          { date: "2026-08-11", value: Number.NaN },
        ],
        target: {
          date: "2026-09-11",
          value: 30,
          label: "Target · 30%",
        },
        events: [{ date: "not-a-date", label: "Invalid event" }],
      }),
    ).toBeNull();
  });

  it("groups pull requests into the observation interval they precede", () => {
    const result = buildDashboardGoalTimelineData({
      observations: [
        { date: "2026-07-12", value: 6 },
        { date: "2026-08-11", value: 2.3 },
      ],
      target: {
        date: "2026-09-11",
        value: 30,
        label: "Target · 30%",
      },
      events: [
        { date: "2026-07-12", label: "PR #1200" },
        { date: "2026-07-20", label: "PR #1250" },
        { date: "2026-08-05", label: "PR #1310" },
        { date: "2026-08-20", label: "PR #1400" },
      ],
    });

    expect(
      result?.eventSummaries.map(({ timestamp, events }) => ({
        timestamp,
        labels: events.map(({ label }) => label),
      })),
    ).toEqual([
      {
        timestamp: Date.parse("2026-07-12"),
        labels: ["PR #1200"],
      },
      {
        timestamp: Date.parse("2026-08-11"),
        labels: ["PR #1250", "PR #1310"],
      },
    ]);
  });
});

describe("getDashboardGoalTimelineTicks", () => {
  it("uses rounded intervals instead of irregular automatic percentages", () => {
    expect(getDashboardGoalTimelineTicks([0, 33])).toEqual([0, 10, 20, 30]);
  });
});

describe("getDashboardGoalTimelinePeriods", () => {
  it("fills the full timeline with consecutive weeks and a final partial week", () => {
    expect(
      getDashboardGoalTimelinePeriods([
        Date.parse("2026-07-12"),
        Date.parse("2026-08-01"),
      ]),
    ).toEqual([
      {
        label: "Week 1",
        startTimestamp: Date.parse("2026-07-12"),
        endTimestamp: Date.parse("2026-07-19"),
        timestamp: Date.parse("2026-07-15T12:00:00.000Z"),
      },
      {
        label: "Week 2",
        startTimestamp: Date.parse("2026-07-19"),
        endTimestamp: Date.parse("2026-07-26"),
        timestamp: Date.parse("2026-07-22T12:00:00.000Z"),
      },
      {
        label: "Week 3",
        startTimestamp: Date.parse("2026-07-26"),
        endTimestamp: Date.parse("2026-08-01"),
        timestamp: Date.parse("2026-07-29"),
      },
    ]);
  });
});

describe("filterDashboardGoalTimelineTooltipPayload", () => {
  it("hides required pace when it only anchors the latest actual value", () => {
    const actual = {
      dataKey: "actual",
      value: 2.3,
      payload: { actual: 2.3, required: 2.3 },
    };
    const required = {
      dataKey: "required",
      value: 2.3,
      payload: { actual: 2.3, required: 2.3 },
    };

    expect(
      filterDashboardGoalTimelineTooltipPayload([actual, required]),
    ).toEqual([actual]);
  });

  it("keeps required pace at future-only points", () => {
    const required = {
      dataKey: "required",
      value: 30,
      payload: { required: 30 },
    };

    expect(filterDashboardGoalTimelineTooltipPayload([required])).toEqual([
      required,
    ]);
  });

  it("hides internal coordinate and PR placement fields", () => {
    const actual = {
      dataKey: "actual",
      value: 5.1,
      payload: { timestamp: Date.parse("2026-07-26"), actual: 5.1 },
    };
    const timestamp = {
      dataKey: "timestamp",
      value: Date.parse("2026-07-26"),
      payload: { timestamp: Date.parse("2026-07-26"), actual: 5.1 },
    };
    const plotValue = {
      dataKey: "plotValue",
      value: 5.1,
      payload: { timestamp: Date.parse("2026-07-26"), actual: 5.1 },
    };

    expect(
      filterDashboardGoalTimelineTooltipPayload([actual, timestamp, plotValue]),
    ).toEqual([actual]);
  });
});

describe("DashboardGoalTimeline", () => {
  it("renders the target, delivery marker, and visible non-hover summary", () => {
    render(
      <DashboardGoalTimeline
        ariaLabel="Signals conversion goal timeline"
        observations={[
          { date: "2026-07-12", value: 6 },
          { date: "2026-08-11", value: 2.3 },
        ]}
        target={{
          date: "2026-09-11",
          value: 30,
          label: "Target · 30%",
        }}
        events={[{ date: "2026-07-20", label: "PR #1250 · Jul 20" }]}
        valueFormatter={(value) => `${value}%`}
      />,
    );

    expect(
      screen.getByRole("group", {
        name: "Signals conversion goal timeline",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/6% on Jul 12, 2026 → 2.3% on Aug 11, 2026/),
    ).toBeVisible();
    expect(screen.getByText(/30% by Sep 11, 2026/)).toBeVisible();
    expect(screen.getByText("Merged PRs")).toBeVisible();
    expect(document.querySelectorAll('[data-slot="chart"]')).toHaveLength(1);
    expect(
      document.querySelectorAll(
        ".dashboard-goal-timeline__pr-events .recharts-scatter-symbol",
      ),
    ).toHaveLength(1);
  });

  it("shows an explicit status when no valid observations remain", () => {
    render(
      <DashboardGoalTimeline
        ariaLabel="Signals conversion goal timeline"
        observations={[{ date: "not-a-date", value: Number.NaN }]}
        target={{
          date: "2026-09-11",
          value: 30,
          label: "Target · 30%",
        }}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Goal timeline unavailable",
    );
  });
});

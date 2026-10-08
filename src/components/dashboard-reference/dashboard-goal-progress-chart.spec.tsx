import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  DashboardGoalProgressChart,
  DashboardGoalProgressLegend,
  type DashboardGoalProgressChartProps,
} from "./dashboard-goal-progress-chart";

afterEach(() => {
  cleanup();
});

const props: DashboardGoalProgressChartProps = {
  ariaLabel: "Signals conversion progress and shipped work",
  goalName: "Increase Signals-to-pull-request conversion to 30%",
  metric: "Estimated Signals list-to-View pull request conversion",
  unit: "%",
  direction: "increase",
  startDate: "2026-07-12",
  today: "2026-08-11",
  endDate: "2026-09-11",
  target: 30,
  projectionFloor: 0,
  projectionCeiling: 100,
  actual: [
    { date: "2026-07-12", value: 6 },
    { date: "2026-08-11", value: 2.3 },
  ],
  shippedWork: [
    {
      date: "2026-07-20",
      prNumber: 1250,
      title: "Clarify pull request lifecycle",
      hypothesis: {
        confidence: "Early signal",
        headline: "PR #1250 clarified the pull request lifecycle",
        evidence:
          "The release improved lifecycle visibility, but conversion later fell from 6.0% to 2.3%. The available evidence does not show that it improved conversion.",
        action:
          "Compare completion before and after the lifecycle change, then inspect where people still stop.",
      },
    },
  ],
  source: "Source: Novus Production · Signals goal fixtures",
};

describe("DashboardGoalProgressChart", () => {
  it("connects progress, shipped work, and a persistent hypothesis", () => {
    const { container } = render(
      <>
        <DashboardGoalProgressLegend />
        <DashboardGoalProgressChart {...props} />
      </>,
    );

    const chart = screen.getByRole("group", { name: props.ariaLabel });
    expect(chart).toBeInTheDocument();
    expect(screen.getByText("Actual")).toBeInTheDocument();
    expect(screen.getByText("Required pace")).toBeInTheDocument();
    expect(screen.getByText("Projection")).toBeInTheDocument();
    expect(
      within(chart).queryByLabelText("Chart legend"),
    ).not.toBeInTheDocument();
    expect(container.querySelector(".recharts-area-area")).toHaveAttribute(
      "fill",
      "var(--chart-1)",
    );
    container.querySelectorAll(".recharts-line-curve").forEach((curve) => {
      expect(curve).toHaveAttribute("stroke-width", "3");
    });
    expect(screen.getByText("2.3% today")).toBeInTheDocument();
    expect(screen.getByText("30% target")).toBeInTheDocument();
    expect(screen.getByText("0% projected")).toBeInTheDocument();
    expect(screen.getByText("30% short")).toBeInTheDocument();
    expect(screen.getByTestId("shared-today-line")).toBeInTheDocument();
    expect(
      screen.getByText("Goal-linked pull requests merged by week"),
    ).toBeInTheDocument();
    expect(screen.getByText("Sun")).toBeInTheDocument();
    expect(screen.getByText("Tue")).toBeInTheDocument();
    expect(screen.getByText("Thu")).toBeInTheDocument();
    expect(screen.getByText("Sat")).toBeInTheDocument();
    expect(screen.getByText("Jul 26")).toBeInTheDocument();
    expect(screen.getByText("Aug 23")).toBeInTheDocument();
    expect(screen.getByText("Today · Aug 11")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Weekly timeline · shared by goal progress and shipped work",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /Jul 20: 1 linked pull request merged.*PR #1250/i,
      }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("heading", {
        name: "PR #1250 clarified the pull request lifecycle",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Evidence")).toBeInTheDocument();
    expect(screen.getByText("Act next")).toBeInTheDocument();
    expect(screen.getByText(props.source)).toBeInTheDocument();
  });

  it("updates the persistent hypothesis when linked work is selected", () => {
    render(
      <DashboardGoalProgressChart
        {...props}
        shippedWork={[
          ...props.shippedWork,
          {
            date: "2026-08-05",
            prNumber: 1300,
            title: "Improve Signals investigation status",
            hypothesis: {
              confidence: "High confidence",
              headline: "PR #1300 improved investigation status",
              evidence: "The test fixture links a second shipped item.",
              action: "Compare behavior after the status change.",
            },
          },
        ]}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "PR #1300 improved investigation status",
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: /Jul 20: 1 linked pull request merged/i,
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: "PR #1250 clarified the pull request lifecycle",
      }),
    ).toBeInTheDocument();
  });

  it("explains when no shipped work is linked", () => {
    render(<DashboardGoalProgressChart {...props} shippedWork={[]} />);

    expect(
      screen.getByRole("heading", { name: "No shipped-work hypothesis yet" }),
    ).toBeInTheDocument();
  });

  it("omits projection when only one observation exists", () => {
    render(
      <DashboardGoalProgressChart {...props} actual={[props.actual[0]]} />,
    );

    expect(
      screen.getByText(
        /more observations are needed before Novus can project progress/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Projection unavailable")).toBeInTheDocument();
  });

  it("does not draw misleading geometry for an invalid range", () => {
    render(<DashboardGoalProgressChart {...props} endDate="2026-07-01" />);

    expect(
      screen.getByRole("heading", { name: "Goal progress is unavailable" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Projection")).not.toBeInTheDocument();
  });
});

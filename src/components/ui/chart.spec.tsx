import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  ChartActiveDot,
  ChartContainer,
  ChartTooltipPanel,
  ChartTooltipContent,
  type ChartConfig,
} from "./chart";

afterEach(() => {
  cleanup();
});

const config = {
  activated: {
    label: "Activated visitors",
    color: "var(--chart-1)",
  },
  retained: {
    label: "Retained visitors",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

describe("ChartActiveDot", () => {
  it("renders a compact series-colored dot with a white outline", () => {
    const { container } = render(
      <svg>
        <ChartActiveDot cx={20} cy={20} color="var(--chart-2)" />
      </svg>,
    );
    const dot = container.querySelector('[data-slot="chart-active-dot"]');

    expect(dot).toHaveAttribute("r", "5");
    expect(dot).toHaveAttribute("fill", "var(--chart-2)");
    expect(dot).toHaveAttribute("stroke", "#ffffff");
    expect(dot).toHaveAttribute("stroke-width", "2");
  });
});

describe("ChartTooltipContent", () => {
  it("aligns shared tooltip labels and values without punctuation", () => {
    render(
      <ChartTooltipPanel
        title="Jul 19"
        rows={[
          {
            label: "View NPS report",
            value: "57",
            color: "var(--chart-1)",
          },
          {
            label: "Ask Agent Mode",
            value: "48",
            color: "var(--chart-2)",
          },
        ]}
      />,
    );

    const tooltip = screen
      .getByText("Jul 19")
      .closest('[data-slot="chart-tooltip-content"]');
    const firstRow = screen
      .getByText("View NPS report")
      .closest('[data-slot="chart-tooltip-row"]');
    const value = screen.getByText("57");

    expect(tooltip).toHaveClass("w-max");
    expect(firstRow).toHaveClass("grid", "w-full");
    expect(screen.queryByText("View NPS report:")).not.toBeInTheDocument();
    expect(value).toHaveClass("text-right", "tabular-nums");
  });

  it("renders an Inter series label and Geist Mono quantity as one value pair", () => {
    render(
      <ChartContainer
        config={config}
        initialDimension={{ width: 320, height: 200 }}
      >
        <ChartTooltipContent
          active
          label="May 18"
          payload={[
            {
              graphicalItemId: "activated",
              dataKey: "activated",
              name: "activated",
              value: 1970,
              payload: { period: "May 18", activated: 1970 },
            },
          ]}
        />
      </ChartContainer>,
    );

    const label = screen.getByText("Activated visitors");
    const value = screen.getByText("1,970");
    const valueRow = label.closest('[data-slot="chart-tooltip-row"]');
    const tooltip = label.closest('[data-slot="chart-tooltip-content"]');

    expect(value).toBeInTheDocument();
    expect(screen.queryByText("Activated visitors:")).not.toBeInTheDocument();
    expect(tooltip).toHaveClass("w-max");
    expect(tooltip).not.toHaveClass("min-w-32");
    expect(label).not.toHaveClass("font-mono");
    expect(label).toHaveClass("whitespace-nowrap");
    expect(value).toHaveClass("font-mono", "text-right", "tabular-nums");
    expect(valueRow).toHaveClass("grid", "w-full");
    expect(
      tooltip?.querySelector('[style*="--color-bg"]'),
    ).not.toBeInTheDocument();
  });

  it("renders a time comparison with its previous-period delta", () => {
    render(
      <ChartContainer
        config={config}
        initialDimension={{ width: 320, height: 200 }}
      >
        <ChartTooltipContent
          active
          variant="comparison"
          label="May 18"
          measure="unique visitors"
          comparison={{
            rows: [
              { period: "May 11", activated: 1840 },
              { period: "May 18", activated: 1970 },
            ],
            labelKey: "period",
            periodNoun: "week",
          }}
          payload={[
            {
              graphicalItemId: "activated",
              dataKey: "activated",
              name: "activated",
              value: 1970,
              payload: { period: "May 18", activated: 1970 },
            },
          ]}
        />
      </ChartContainer>,
    );

    expect(screen.getByText("Activated visitors")).toBeInTheDocument();
    expect(screen.getByText("May 18")).toBeInTheDocument();
    expect(screen.getByText("1,970 unique visitors")).toBeInTheDocument();
    expect(screen.getByText("+7%")).toBeInTheDocument();
    expect(screen.getByText(/from previous week/)).toHaveTextContent(
      "from previous week (1,840 -> 1,970)",
    );
  });

  it("renders a categorical comparison from the payload baseline", () => {
    render(
      <ChartContainer
        config={config}
        initialDimension={{ width: 320, height: 200 }}
      >
        <ChartTooltipContent
          active
          variant="comparison"
          label="Product Knowledge"
          measure="unique visitors"
          comparison={{ prevKey: "prevVisitors", periodNoun: "period" }}
          payload={[
            {
              graphicalItemId: "activated",
              dataKey: "activated",
              name: "activated",
              value: 34,
              payload: {
                area: "Product Knowledge",
                activated: 34,
                prevVisitors: 27,
              },
            },
          ]}
        />
      </ChartContainer>,
    );

    expect(screen.getByText("Product Knowledge")).toBeInTheDocument();
    expect(screen.getByText("34 unique visitors")).toBeInTheDocument();
    expect(screen.getByText("+26%")).toBeInTheDocument();
  });

  it("renders multiple series in one comparison tooltip", () => {
    render(
      <ChartContainer
        config={config}
        initialDimension={{ width: 320, height: 200 }}
      >
        <ChartTooltipContent
          active
          variant="comparison"
          label="May 18"
          measure="visitors"
          comparison={{
            rows: [
              { period: "May 11", activated: 1840, retained: 1290 },
              { period: "May 18", activated: 1970, retained: 1460 },
            ],
            labelKey: "period",
            periodNoun: "week",
          }}
          payload={[
            {
              graphicalItemId: "activated",
              dataKey: "activated",
              name: "activated",
              value: 1970,
              color: "var(--chart-1)",
              payload: { period: "May 18", activated: 1970, retained: 1460 },
            },
            {
              graphicalItemId: "retained",
              dataKey: "retained",
              name: "retained",
              value: 1460,
              color: "var(--chart-2)",
              payload: { period: "May 18", activated: 1970, retained: 1460 },
            },
          ]}
        />
      </ChartContainer>,
    );

    expect(screen.getByText("Activated visitors")).toBeInTheDocument();
    expect(screen.getByText("Retained visitors")).toBeInTheDocument();
    expect(screen.getByText("1,970")).toBeInTheDocument();
    expect(screen.getByText("1,460")).toBeInTheDocument();
    expect(screen.queryByText("1,970 visitors")).not.toBeInTheDocument();

    const tooltip = screen
      .getByText("May 18")
      .closest('[data-slot="chart-tooltip-content"]');
    const valueRow = screen
      .getByText("1,970")
      .closest('[data-slot="chart-tooltip-row"]');
    const swatches = tooltip?.querySelectorAll(
      '[data-slot="chart-tooltip-swatch"]',
    );

    expect(tooltip).toHaveClass("w-max");
    expect(tooltip).not.toHaveClass("w-fit");
    expect(tooltip).not.toHaveClass("min-w-[280px]");
    expect(valueRow).toHaveClass("grid", "w-full");
    expect(screen.getByText("1,970")).toHaveClass("text-right", "tabular-nums");
    expect(swatches).toHaveLength(2);
    swatches?.forEach((swatch) => {
      expect(swatch).toHaveClass("rounded-[2px]");
    });
  });

  it("omits comparison copy when the selected period has no baseline", () => {
    render(
      <ChartContainer
        config={config}
        initialDimension={{ width: 320, height: 200 }}
      >
        <ChartTooltipContent
          active
          variant="comparison"
          label="May 11"
          measure="visitors"
          comparison={{
            rows: [{ period: "May 11", activated: 1840 }],
            labelKey: "period",
            periodNoun: "week",
          }}
          payload={[
            {
              graphicalItemId: "activated",
              dataKey: "activated",
              name: "activated",
              value: 1840,
              payload: { period: "May 11", activated: 1840 },
            },
          ]}
        />
      </ChartContainer>,
    );

    expect(screen.getByText("1,840")).toBeInTheDocument();
    expect(screen.queryByText("1,840 visitors")).not.toBeInTheDocument();
    expect(screen.queryByText(/from previous week/)).not.toBeInTheDocument();
  });
});

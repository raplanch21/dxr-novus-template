import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DashboardDrillFullScreenModal,
  DashboardDrillSideBlade,
  type DashboardDrillKvPayload,
  type DashboardDrillTablePayload,
} from "./dashboard-drill-surfaces";

const tablePayload: DashboardDrillTablePayload = {
  dataType: "table",
  title: "Register details",
  subtitle: "Mapped category: Visitor Activity",
  summary: "Activation funnel entry at Register",
  metricContext: {
    value: "34",
    delta: "-8.1%",
    timeframe: "June 14 to July 14, 2026",
  },
  selection: {
    section: "kpi",
    chartMode: "funnel",
    sourceChartTitle: "Activation funnel",
    label: "Register",
    value: 34,
    seriesKey: "continued",
    interaction: "bar",
  },
  columns: ["Visitor ID", "Account name", "Last active"],
  rows: Array.from({ length: 34 }, (_, index) => ({
    "Visitor ID":
      index === 0
        ? "ava.rivera@northgate.io"
        : `visitor-${index + 1}@northgate.io`,
    "Account name": "Northgate Labs",
    "Last active": "Jul 14, 2026",
  })),
};

const kvPayload: DashboardDrillKvPayload = {
  dataType: "kv",
  title: "Instrumentation details",
  subtitle: "Mapped category: Instrumentation coverage",
  selection: {
    section: "instrumentation",
    chartMode: "bar",
    sourceChartTitle: "Instrumentation status",
    label: "Complete",
    value: 12,
    seriesKey: "complete",
    interaction: "bar",
  },
  items: [
    { label: "Status", value: "Complete" },
    { label: "Tracked events", value: "12" },
  ],
};

afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
});

describe("DashboardDrillSideBlade", () => {
  it("keeps closed payload content hidden and non-dialog", () => {
    render(
      <DashboardDrillSideBlade
        payload={tablePayload}
        isOpen={false}
        onClose={vi.fn()}
        widthMode="half"
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const closedBlade = screen
      .getByText("Register details")
      .closest("[aria-hidden]");
    expect(closedBlade).toHaveAttribute("aria-hidden", "true");
    expect(closedBlade).toHaveAttribute("inert");
  });

  it("renders nothing inside the closed shell when payload is null", () => {
    const { container } = render(
      <DashboardDrillSideBlade
        payload={null}
        isOpen={false}
        onClose={vi.fn()}
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      container.querySelector("[aria-hidden='true']"),
    ).toBeEmptyDOMElement();
  });

  it("renders a half-width table dialog, focuses Close, and closes on Escape", async () => {
    const onClose = vi.fn();

    render(
      <DashboardDrillSideBlade
        payload={tablePayload}
        isOpen
        onClose={onClose}
        widthMode="half"
      />,
    );

    expect(
      screen.getByRole("dialog", {
        name: "Activation funnel: Register details",
      }),
    ).toHaveStyle({ width: "50%" });
    expect(
      screen.getByRole("columnheader", { name: "Visitor ID" }),
    ).toBeInTheDocument();
    expect(screen.getByText("ava.rivera@northgate.io")).toBeInTheDocument();
    expect(screen.getByText("34 visitors")).toBeInTheDocument();
    expect(screen.getByRole("table")).toHaveAttribute("data-slot", "table");
    expect(screen.getByRole("table").parentElement).toHaveAttribute(
      "data-slot",
      "table-container",
    );
    expect(
      screen.getByRole("columnheader", { name: "Visitor ID" }),
    ).toHaveClass("sticky", "top-0");
    expect(
      screen.getByText("ava.rivera@northgate.io").closest("td"),
    ).toHaveClass("sticky", "left-0");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Close" })).toHaveFocus(),
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("sorts table rows from the production-style column controls", () => {
    const sortablePayload: DashboardDrillTablePayload = {
      ...tablePayload,
      rows: [
        {
          "Visitor ID": "zara@example.com",
          "Account name": "Zulu",
          "Last active": "Jul 14, 2026",
        },
        {
          "Visitor ID": "ava@example.com",
          "Account name": "Alpha",
          "Last active": "Jul 13, 2026",
        },
      ],
    };

    render(
      <DashboardDrillSideBlade
        payload={sortablePayload}
        isOpen
        onClose={vi.fn()}
        widthMode="half"
      />,
    );

    const table = screen.getByRole("table");
    const visitorHeader = screen.getByRole("columnheader", {
      name: "Visitor ID",
    });
    const sortButton = within(visitorHeader).getByRole("button", {
      name: "Sort by Visitor ID",
    });

    fireEvent.click(sortButton);
    expect(visitorHeader).toHaveAttribute("aria-sort", "ascending");
    expect(within(table).getAllByRole("row")[1]).toHaveTextContent(
      "ava@example.com",
    );

    fireEvent.click(sortButton);
    expect(visitorHeader).toHaveAttribute("aria-sort", "descending");
    expect(within(table).getAllByRole("row")[1]).toHaveTextContent(
      "zara@example.com",
    );
  });

  it("keeps long sortable headers on one line in a scrollable table", () => {
    const longHeaderPayload: DashboardDrillTablePayload = {
      ...tablePayload,
      columns: [
        "Step",
        "Visitors started",
        "Dropped",
        "Conversion rate by step",
        "Average time from previous step",
        "Median time from previous step",
      ],
      rows: [
        {
          Step: "1. Register",
          "Visitors started": 34,
          Dropped: null,
          "Conversion rate by step": "100%",
          "Average time from previous step": null,
          "Median time from previous step": null,
        },
      ],
    };

    render(
      <DashboardDrillFullScreenModal
        payload={longHeaderPayload}
        isOpen
        onClose={vi.fn()}
      />,
    );

    const table = screen.getByRole("table");
    const longHeader = screen.getByRole("button", {
      name: "Sort by Average time from previous step",
    });

    expect(table).toHaveClass("w-max!", "min-w-full", "table-auto!");
    expect(table.parentElement?.parentElement).toHaveClass("overflow-x-auto");
    expect(longHeader).toHaveClass("whitespace-nowrap");
    expect(longHeader).not.toHaveClass("w-full", "whitespace-normal");
  });

  it("renders KV details and closes from its visible action", () => {
    const onClose = vi.fn();

    render(
      <DashboardDrillSideBlade
        payload={kvPayload}
        isOpen
        onClose={onClose}
        widthMode="half"
      />,
    );

    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Complete")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe("DashboardDrillFullScreenModal", () => {
  it("does not render for a closed or null payload", () => {
    const { rerender } = render(
      <DashboardDrillFullScreenModal
        payload={tablePayload}
        isOpen={false}
        onClose={vi.fn()}
      />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    rerender(
      <DashboardDrillFullScreenModal payload={null} isOpen onClose={vi.fn()} />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders a modal full-list table and restores focus after closing", async () => {
    const opener = document.createElement("button");
    document.body.append(opener);
    opener.focus();
    const onClose = vi.fn();
    const fullListPayload: DashboardDrillTablePayload = {
      ...tablePayload,
      title: "Sign-in visitors",
      isFullMetricList: true,
      selection: {
        ...tablePayload.selection,
        sourceChartTitle: "Sign-in visitors",
        label: "Visitors",
      },
    };

    const { rerender } = render(
      <DashboardDrillFullScreenModal
        payload={fullListPayload}
        isOpen
        onClose={onClose}
      />,
    );

    expect(
      screen.getByRole("dialog", { name: "Sign-in visitors" }),
    ).toHaveAttribute("aria-modal", "true");
    expect(
      screen.getByRole("columnheader", { name: "Visitor ID" }),
    ).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Close drill-down" }),
      ).toHaveFocus(),
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();

    rerender(
      <DashboardDrillFullScreenModal
        payload={fullListPayload}
        isOpen={false}
        onClose={onClose}
      />,
    );
    await waitFor(() => expect(opener).toHaveFocus());
    opener.remove();
  });
});

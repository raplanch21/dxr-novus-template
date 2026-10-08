import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DashboardTable } from "./dashboard-table";

afterEach(() => {
  cleanup();
});

describe("DashboardTable", () => {
  it("renders ranked rows and invokes header and row actions", () => {
    const onHeaderAction = vi.fn();
    const onRowSelect = vi.fn();
    const rows = [
      { id: "overview", label: "Overview", value: "3,193" },
      { id: "dashboard", label: "Dashboard", value: "3,193" },
    ] as const;

    render(
      <DashboardTable
        variant="ranked"
        title="Top pages by visitors"
        description="Where users spend their time"
        rows={rows}
        headerAction={{ label: "Table", onClick: onHeaderAction }}
        onRowSelect={onRowSelect}
      />,
    );

    const heading = screen.getByRole("heading", {
      name: "Top pages by visitors",
    });
    const description = screen.getByText("Where users spend their time");
    const headerAction = screen.getByRole("button", { name: "Table" });

    expect(heading).toHaveClass(
      "text-[16px]",
      "leading-6",
      "font-normal",
      "text-[#0A0A0A]",
    );
    expect(description).toHaveClass(
      "text-[12.64px]",
      "leading-[1.5]",
      "text-[#737373]",
    );
    expect(headerAction).toHaveClass(
      "h-auto",
      "px-2",
      "py-1",
      "text-[14px]",
      "leading-4",
      "font-normal",
    );
    const table = screen.getByRole("table", { name: "Top pages by visitors" });
    expect(table).not.toHaveClass("mt-2");
    expect(within(table).getByText("1")).toHaveClass("px-0", "text-center");
    const interactiveRow = within(table).getByText("Overview").closest("tr");
    expect(interactiveRow).not.toHaveClass("hover:bg-transparent");
    const values = within(table).getAllByText("3,193");
    expect(values).toHaveLength(2);
    expect(values[0]).toHaveClass("font-normal");
    expect(values[0]).not.toHaveClass("font-bold");

    const rankedColumns = Array.from(table.querySelectorAll("col"));
    expect(rankedColumns.map((column) => column.className)).toEqual([
      "w-12",
      "w-[50%]",
      "",
      "w-12",
    ]);
    expect(
      table.querySelector(".lucide-chevron-right")?.closest("td"),
    ).toHaveClass("pr-4");

    const selectableRow = screen.getByRole("row", {
      name: "Open Overview details",
    });

    expect(selectableRow).toHaveAttribute("tabindex", "0");
    expect(
      screen.queryByRole("button", { name: "Open Overview details" }),
    ).not.toBeInTheDocument();

    fireEvent.click(headerAction);
    fireEvent.click(selectableRow);
    fireEvent.keyDown(selectableRow, { key: "Enter" });
    fireEvent.keyDown(selectableRow, { key: " " });

    expect(onHeaderAction).toHaveBeenCalledTimes(1);
    expect(onRowSelect).toHaveBeenCalledTimes(3);
    expect(onRowSelect).toHaveBeenLastCalledWith(rows[0]);
  });

  it("connects a partial records list to its aggregate and actions", () => {
    const onRowSelect = vi.fn();
    const onViewAll = vi.fn();
    const record = {
      id: "session-1",
      primary: "Aug 6, 2026, 2:57 PM",
      secondaryLabel: "Session",
      secondary: "50981735…",
    };

    render(
      <DashboardTable
        variant="records"
        title="Rage-click sessions"
        description="June 14 to July 14, 2026"
        summary={{ total: 43, label: "sessions", onViewAll }}
        rows={[record]}
        onRowSelect={onRowSelect}
      />,
    );

    expect(screen.getByText("43")).toHaveClass("font-mono");
    expect(screen.getByText("sessions")).toBeInTheDocument();
    expect(screen.getByText("Showing the most recent")).toBeInTheDocument();
    const table = screen.getByRole("table", { name: "Rage-click sessions" });
    expect(within(table).getByText(record.primary)).toBeInTheDocument();
    const secondaryLabel = within(table).getByText(record.secondaryLabel);
    expect(secondaryLabel).toHaveClass("font-sans");
    expect(secondaryLabel.parentElement).toHaveClass(
      "flex-col",
      "@[480px]:flex-row",
    );
    const secondary = within(table).getByText(record.secondary);
    expect(secondary).toHaveClass("truncate", "font-mono");
    expect(secondary.closest("td")).toHaveClass("text-left");
    expect(
      Array.from(table.querySelectorAll("col")).map(
        (column) => column.className,
      ),
    ).toEqual(["w-[50%]", "", "w-12"]);

    const recordRow = screen.getByRole("row", {
      name: `Open ${record.primary} details`,
    });
    fireEvent.click(recordRow);
    const viewAll = screen.getByRole("button", {
      name: "View all sessions",
    });
    expect(
      viewAll.closest('[data-testid="dashboard-table-summary"]'),
    ).toBeInTheDocument();
    expect(viewAll.closest("header")).not.toBeInTheDocument();
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
    fireEvent.click(viewAll);

    expect(onRowSelect).toHaveBeenCalledWith(record);
    expect(onViewAll).toHaveBeenCalledTimes(1);
  });

  it("omits the record summary when no summary value is provided", () => {
    render(
      <DashboardTable
        variant="records"
        title="Recent sessions"
        description="Most recent records"
        rows={[{ id: "session-1", primary: "Today", secondary: "session-1" }]}
      />,
    );

    expect(
      screen.queryByTestId("dashboard-table-summary"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Showing the/)).not.toBeInTheDocument();
  });

  it("does not describe a complete records list as a partial preview", () => {
    render(
      <DashboardTable
        variant="records"
        title="Recent sessions"
        description="June 14 to July 14, 2026"
        summary={{
          total: 1,
          label: "session",
          onViewAll: vi.fn(),
        }}
        rows={[{ id: "session-1", primary: "Today", secondary: "Session 1" }]}
      />,
    );

    expect(screen.queryByText(/Showing the/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "View all session" }),
    ).not.toBeInTheDocument();
  });

  it("keeps a truthful zero summary beside the records empty state", () => {
    render(
      <DashboardTable
        variant="records"
        title="Recent sessions"
        description="June 14 to July 14, 2026"
        summary={{ total: 0, label: "sessions" }}
        rows={[]}
        emptyMessage="No matching sessions were found."
      />,
    );

    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("sessions")).toBeInTheDocument();
    expect(
      screen.getByText("No matching sessions were found."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Showing the/)).not.toBeInTheDocument();
  });

  it.each(["ranked", "records"] as const)(
    "renders an explicit empty state for %s tables",
    (variant) => {
      const props =
        variant === "ranked"
          ? {
              variant,
              title: "Top pages",
              description: "Ranked pages",
              rows: [],
            }
          : {
              variant,
              title: "Recent sessions",
              description: "Session records",
              rows: [],
            };

      render(<DashboardTable {...props} emptyMessage="No rows available." />);

      expect(screen.getByText("No rows available.")).toBeInTheDocument();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    },
  );

  it("allows long ranked labels to shrink without widening the table", () => {
    render(
      <DashboardTable
        variant="ranked"
        title="Ranked items"
        description="Compact-width stress"
        rows={[
          {
            id: "long-item",
            label:
              "A very long ranked item label that must remain inside the available width",
            value: "12,345",
          },
        ]}
      />,
    );

    const longLabel = screen.getByText(/A very long ranked item label/);
    expect(longLabel).toHaveClass("truncate");
    expect(longLabel.closest("tr")).toHaveClass("hover:bg-transparent");
  });
});

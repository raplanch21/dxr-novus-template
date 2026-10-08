import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DashboardSectionDivider } from "./dashboard-section-divider";

afterEach(() => {
  cleanup();
});

describe("DashboardSectionDivider", () => {
  it("renders a padded section number and heading title", () => {
    render(
      <DashboardSectionDivider number={1} title="Instrumentation coverage" />,
    );

    expect(screen.getByText("01")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Instrumentation coverage" }),
    ).toBeInTheDocument();
  });

  it("renders a bottom rule with vertically centered, Figma-aligned content", () => {
    render(
      <DashboardSectionDivider number={1} title="Instrumentation coverage" />,
    );

    const heading = screen.getByRole("heading", {
      name: "Instrumentation coverage",
    });
    const section = heading.closest("section");
    const headingGroup = heading.parentElement;

    expect(section).toHaveClass(
      "items-center",
      "justify-between",
      "border-b",
      "border-border",
      "pb-4",
    );
    expect(headingGroup).toHaveClass("items-center", "gap-9");
  });

  it("hides actions when callbacks are not provided", () => {
    render(<DashboardSectionDivider number={2} title="Narrative analysis" />);

    expect(
      screen.queryByRole("button", { name: "Edit with Novus" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Ask Novus" }),
    ).not.toBeInTheDocument();
  });

  it("shows action buttons only for provided callbacks", () => {
    const onAsk = vi.fn();

    render(
      <DashboardSectionDivider
        number={3}
        title="Funnel readiness"
        onAsk={onAsk}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Edit with Novus" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Ask Novus" }),
    ).toBeInTheDocument();
  });

  it("invokes callbacks when visible action buttons are clicked", () => {
    const onEdit = vi.fn();
    const onAsk = vi.fn();

    render(
      <DashboardSectionDivider
        number={4}
        title="Risk and recommendation"
        onEdit={onEdit}
        onAsk={onAsk}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit with Novus" }));
    fireEvent.click(screen.getByRole("button", { name: "Ask Novus" }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onAsk).toHaveBeenCalledTimes(1);
  });

  it("uses container query action layout classes instead of viewport breakpoints", () => {
    const onEdit = vi.fn();
    const onAsk = vi.fn();

    render(
      <DashboardSectionDivider
        number={5}
        title="Action layout"
        onEdit={onEdit}
        onAsk={onAsk}
      />,
    );

    const section = screen
      .getByRole("heading", { name: "Action layout" })
      .closest("section");
    expect(section).not.toBeNull();
    expect(section).toHaveClass("@container");

    const askButton = screen.getByRole("button", { name: "Ask Novus" });
    const actionsContainer = askButton.parentElement;
    expect(actionsContainer).not.toBeNull();
    expect(actionsContainer).toHaveClass("@[480px]:w-auto");
    expect(actionsContainer).toHaveClass("@[480px]:justify-end");
    expect(actionsContainer).not.toHaveClass("sm:w-auto");
    expect(actionsContainer).not.toHaveClass("sm:justify-end");
  });
});

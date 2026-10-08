import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppShell } from "./app-shell";

const navigation = vi.hoisted(() => ({
  pathname: "/projects",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

afterEach(() => {
  cleanup();
  navigation.pathname = "/projects";
});

describe("AppShell", () => {
  it("renders the reference navigation and project breadcrumb", () => {
    render(
      <AppShell>
        <div>Project content</div>
      </AppShell>,
    );

    expect(screen.getByRole("link", { name: "Novus" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "href",
      "/projects",
    );
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByText("Launch")).toBeInTheDocument();
    expect(screen.getByText("Cortex")).toBeInTheDocument();
    expect(screen.queryByText("Goals")).not.toBeInTheDocument();
    expect(screen.queryByText("Launches")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ask Novus" })).toBeInTheDocument();

    const breadcrumb = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(breadcrumb).getByRole("link", { name: "Directory" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(within(breadcrumb).getByText("Your first project")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("lets people collapse and expand the navigation", () => {
    render(
      <AppShell>
        <div>Project content</div>
      </AppShell>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Collapse navigation" }),
    );

    expect(
      screen.getByRole("button", { name: "Expand navigation" }),
    ).toHaveAttribute("aria-expanded", "false");
  });
});

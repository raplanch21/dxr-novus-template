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
  it("renders neutral navigation and a Projects breadcrumb", () => {
    render(
      <AppShell>
        <div>Project content</div>
      </AppShell>,
    );

    expect(screen.getByRole("link", { name: "Novus" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "href",
      "/projects",
    );
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    const breadcrumb = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(breadcrumb).getByText("Projects")).toHaveAttribute(
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

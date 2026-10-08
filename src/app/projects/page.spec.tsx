import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import ProjectsPage from "./page";

afterEach(cleanup);

describe("ProjectsPage", () => {
  it("shows the project page header and subheader", () => {
    render(<ProjectsPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Your first project" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Build and explore your Novus prototype in this workspace.",
      ),
    ).toBeInTheDocument();
  });
});

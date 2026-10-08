import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import ProjectsPage from "./page";

afterEach(cleanup);

describe("ProjectsPage", () => {
  it("shows the empty Projects state", () => {
    render(<ProjectsPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Projects" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "No projects yet" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/isolated route under src\/app\/projects/i),
    ).toBeInTheDocument();
  });
});

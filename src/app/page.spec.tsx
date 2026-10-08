import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import Home from "./page";

afterEach(cleanup);

describe("Home", () => {
  it("labels the project directory", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Project directory",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Your first project/ }),
    ).toHaveAttribute("href", "/projects");
    expect(
      screen.getByRole("heading", { level: 2, name: "Project resources" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

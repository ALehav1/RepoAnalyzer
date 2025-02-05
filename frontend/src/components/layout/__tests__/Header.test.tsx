import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "../Header";
import { MemoryRouter } from "react-router-dom";

// Mock useTheme hook
jest.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: jest.fn(),
  }),
}));

describe("Header", () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
  });

  it("renders logo and navigation links", () => {
    expect(screen.getByText("Repository Analyzer")).toBeInTheDocument();
    expect(screen.getByText("Repositories")).toBeInTheDocument();
    expect(screen.getByText("Analysis")).toBeInTheDocument();
    expect(screen.getByText("Patterns")).toBeInTheDocument();
  });

  it("renders theme toggle button", () => {
    expect(screen.getByRole("button", { name: /toggle theme/i })).toBeInTheDocument();
  });

  it("has correct navigation links", () => {
    const reposLink = screen.getByText("Repositories").closest("a");
    const analysisLink = screen.getByText("Analysis").closest("a");
    const patternsLink = screen.getByText("Patterns").closest("a");

    expect(reposLink).toHaveAttribute("href", "/repositories");
    expect(analysisLink).toHaveAttribute("href", "/analysis");
    expect(patternsLink).toHaveAttribute("href", "/patterns");
  });

  it("has accessible navigation", () => {
    const nav = screen.getByRole("navigation");
    expect(nav).toBeInTheDocument();
  });
});

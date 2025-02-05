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

  it("handles long navigation items without breaking layout", () => {
    const LongHeader = () => (
      <Header>
        <div data-testid="long-nav">
          {Array(10).fill("Very Long Navigation Item").map((text, i) => (
            <a key={i} href={`/link-${i}`}>{text}</a>
          ))}
        </div>
      </Header>
    );

    render(
      <MemoryRouter>
        <LongHeader />
      </MemoryRouter>
    );

    const nav = screen.getByTestId("long-nav");
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveStyle({ overflowX: "auto" });
  });

  it("maintains theme toggle state after re-render", () => {
    let theme = "light";
    const setTheme = jest.fn((newTheme) => { theme = newTheme; });
    
    jest.spyOn(require("@/hooks/useTheme"), "useTheme").mockImplementation(() => ({
      theme,
      setTheme,
    }));

    const { rerender } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const themeButton = screen.getByRole("button", { name: /toggle theme/i });
    fireEvent.click(themeButton);
    
    expect(setTheme).toHaveBeenCalledWith("dark");

    rerender(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: /toggle theme/i })).toBeInTheDocument();
  });

  it("handles custom class names", () => {
    render(
      <MemoryRouter>
        <Header className="custom-header-class" />
      </MemoryRouter>
    );

    const header = screen.getByRole("banner");
    expect(header).toHaveClass("custom-header-class");
  });

  it("handles keyboard navigation", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const links = screen.getAllByRole("link");
    links[0].focus();

    // Simulate tab navigation
    for (let i = 1; i < links.length; i++) {
      fireEvent.keyDown(document.activeElement!, { key: "Tab" });
      expect(document.activeElement).toBe(links[i]);
    }
  });

  it("maintains focus after theme toggle", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const themeButton = screen.getByRole("button", { name: /toggle theme/i });
    themeButton.focus();
    fireEvent.click(themeButton);

    expect(document.activeElement).toBe(themeButton);
  });
});

import { render, screen } from "@testing-library/react";
import { Sidebar } from "../Sidebar";
import { MemoryRouter } from "react-router-dom";

describe("Sidebar", () => {
  const renderWithRouter = (path: string = "/") => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <Sidebar />
      </MemoryRouter>
    );
  };

  it("renders navigation sections", () => {
    renderWithRouter();
    expect(screen.getByText("Navigation")).toBeInTheDocument();
    expect(screen.getByText("Analysis")).toBeInTheDocument();
  });

  it("renders all navigation links", () => {
    renderWithRouter();
    const links = [
      "Files",
      "Branches",
      "Patterns",
      "Documentation",
      "Code Quality",
      "Dependencies",
      "Security",
    ];

    links.forEach((link) => {
      expect(screen.getByText(link)).toBeInTheDocument();
    });
  });

  it("highlights active link", () => {
    renderWithRouter("/files");
    const filesLink = screen.getByText("Files").closest("a");
    expect(filesLink).toHaveClass("bg-accent");
  });

  it("applies custom className", () => {
    render(
      <MemoryRouter>
        <Sidebar className="custom-class" />
      </MemoryRouter>
    );
    
    const sidebar = screen.getByText("Navigation").closest(".pb-12");
    expect(sidebar).toHaveClass("custom-class");
  });

  it("renders icons for navigation items", () => {
    renderWithRouter();
    const fileIcon = screen.getByText("Files").querySelector("svg");
    const branchIcon = screen.getByText("Branches").querySelector("svg");
    const codeIcon = screen.getByText("Patterns").querySelector("svg");
    const readerIcon = screen.getByText("Documentation").querySelector("svg");

    expect(fileIcon).toBeInTheDocument();
    expect(branchIcon).toBeInTheDocument();
    expect(codeIcon).toBeInTheDocument();
    expect(readerIcon).toBeInTheDocument();
  });

  it("handles deeply nested navigation items", () => {
    render(
      <MemoryRouter>
        <Sidebar>
          <div data-testid="nested-nav">
            {Array(5).fill(null).map((_, i) => (
              <div key={i} className="space-y-2">
                <h3>Section {i + 1}</h3>
                {Array(3).fill(null).map((_, j) => (
                  <div key={j} className="pl-4">
                    <h4>Subsection {j + 1}</h4>
                    {Array(2).fill(null).map((_, k) => (
                      <a key={k} href={`/section-${i}/subsection-${j}/item-${k}`}>
                        Item {k + 1}
                      </a>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Sidebar>
      </MemoryRouter>
    );

    const nestedNav = screen.getByTestId("nested-nav");
    expect(nestedNav).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(30); // 5 sections * 3 subsections * 2 items
  });

  it("handles route changes without remounting", () => {
    const { rerender } = render(
      <MemoryRouter initialEntries={["/files"]}>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText("Files").closest("a")).toHaveClass("bg-accent");

    rerender(
      <MemoryRouter initialEntries={["/patterns"]}>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText("Patterns").closest("a")).toHaveClass("bg-accent");
  });

  it("handles collapsed state in mobile view", () => {
    // Mock window.matchMedia
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === "(max-width: 768px)",
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    const sidebar = screen.getByRole("complementary");
    expect(sidebar).toHaveClass("hidden", "md:block");
  });

  it("handles external navigation links", () => {
    render(
      <MemoryRouter>
        <Sidebar>
          <a
            href="https://external-link.com"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="external-link"
          >
            External Link
          </a>
        </Sidebar>
      </MemoryRouter>
    );

    const externalLink = screen.getByTestId("external-link");
    expect(externalLink).toHaveAttribute("target", "_blank");
    expect(externalLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("maintains scroll position after route change", () => {
    const { rerender } = render(
      <MemoryRouter initialEntries={["/files"]}>
        <div style={{ height: "1000px" }}>
          <Sidebar />
        </div>
      </MemoryRouter>
    );

    const sidebar = screen.getByRole("complementary");
    const initialScrollTop = 100;
    sidebar.scrollTop = initialScrollTop;

    rerender(
      <MemoryRouter initialEntries={["/patterns"]}>
        <div style={{ height: "1000px" }}>
          <Sidebar />
        </div>
      </MemoryRouter>
    );

    expect(sidebar.scrollTop).toBe(initialScrollTop);
  });
});

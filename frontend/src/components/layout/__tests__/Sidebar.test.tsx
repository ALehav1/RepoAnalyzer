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
});

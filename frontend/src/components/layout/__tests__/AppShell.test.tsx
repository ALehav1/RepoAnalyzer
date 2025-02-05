import { render, screen } from "@testing-library/react";
import { AppShell } from "../AppShell";
import { MemoryRouter } from "react-router-dom";

describe("AppShell", () => {
  const mockHeader = <div data-testid="mock-header">Header</div>;
  const mockSidebar = <div data-testid="mock-sidebar">Sidebar</div>;
  const mockContent = <div data-testid="mock-content">Content</div>;

  it("renders header, sidebar, and content", () => {
    render(
      <MemoryRouter>
        <AppShell header={mockHeader} sidebar={mockSidebar}>
          {mockContent}
        </AppShell>
      </MemoryRouter>
    );

    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    expect(screen.getByTestId("mock-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("mock-content")).toBeInTheDocument();
  });

  it("renders without sidebar", () => {
    render(
      <MemoryRouter>
        <AppShell header={mockHeader}>{mockContent}</AppShell>
      </MemoryRouter>
    );

    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-sidebar")).not.toBeInTheDocument();
    expect(screen.getByTestId("mock-content")).toBeInTheDocument();
  });

  it("renders without header", () => {
    render(
      <MemoryRouter>
        <AppShell sidebar={mockSidebar}>{mockContent}</AppShell>
      </MemoryRouter>
    );

    expect(screen.queryByTestId("mock-header")).not.toBeInTheDocument();
    expect(screen.getByTestId("mock-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("mock-content")).toBeInTheDocument();
  });

  it("handles long content without breaking layout", () => {
    const longContent = "x".repeat(1000);
    render(
      <MemoryRouter>
        <AppShell header={mockHeader} sidebar={mockSidebar}>
          <div data-testid="long-content">{longContent}</div>
        </AppShell>
      </MemoryRouter>
    );

    const content = screen.getByTestId("long-content");
    expect(content).toBeInTheDocument();
    expect(content.parentElement).toHaveStyle({ overflow: "auto" });
  });

  it("handles nested AppShell components", () => {
    render(
      <MemoryRouter>
        <AppShell header={mockHeader} sidebar={mockSidebar}>
          <AppShell data-testid="nested-shell">
            {mockContent}
          </AppShell>
        </AppShell>
      </MemoryRouter>
    );

    expect(screen.getByTestId("nested-shell")).toBeInTheDocument();
  });

  it("handles dynamic content updates", () => {
    const { rerender } = render(
      <MemoryRouter>
        <AppShell header={mockHeader} sidebar={mockSidebar}>
          <div data-testid="dynamic-content">Initial</div>
        </AppShell>
      </MemoryRouter>
    );

    expect(screen.getByText("Initial")).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <AppShell header={mockHeader} sidebar={mockSidebar}>
          <div data-testid="dynamic-content">Updated</div>
        </AppShell>
      </MemoryRouter>
    );

    expect(screen.getByText("Updated")).toBeInTheDocument();
  });

  it("maintains layout when header or sidebar change", () => {
    const { rerender } = render(
      <MemoryRouter>
        <AppShell 
          header={<div data-testid="initial-header">Initial Header</div>}
          sidebar={<div data-testid="initial-sidebar">Initial Sidebar</div>}
        >
          {mockContent}
        </AppShell>
      </MemoryRouter>
    );

    expect(screen.getByText("Initial Header")).toBeInTheDocument();
    expect(screen.getByText("Initial Sidebar")).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <AppShell 
          header={<div data-testid="updated-header">Updated Header</div>}
          sidebar={<div data-testid="updated-sidebar">Updated Sidebar</div>}
        >
          {mockContent}
        </AppShell>
      </MemoryRouter>
    );

    expect(screen.getByText("Updated Header")).toBeInTheDocument();
    expect(screen.getByText("Updated Sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("mock-content")).toBeInTheDocument();
  });

  it("handles undefined children gracefully", () => {
    render(
      <MemoryRouter>
        <AppShell header={mockHeader} sidebar={mockSidebar}>
          {undefined}
        </AppShell>
      </MemoryRouter>
    );

    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    expect(screen.getByTestId("mock-sidebar")).toBeInTheDocument();
  });
});

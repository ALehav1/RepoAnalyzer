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
});

import type { Meta, StoryObj } from "@storybook/react";
import { AppShell } from "../AppShell";
import { Header } from "../Header";
import { Sidebar } from "../Sidebar";
import { MemoryRouter } from "react-router-dom";

const meta: Meta<typeof AppShell> = {
  title: "Layout/AppShell",
  component: AppShell,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof AppShell>;

export const Default: Story = {
  args: {
    header: <Header />,
    sidebar: <Sidebar />,
    children: (
      <div className="p-6">
        <h1 className="text-3xl font-bold">Main Content</h1>
        <p className="mt-2 text-muted-foreground">
          This is the main content area of the application.
        </p>
      </div>
    ),
  },
};

export const WithoutSidebar: Story = {
  args: {
    header: <Header />,
    children: (
      <div className="p-6">
        <h1 className="text-3xl font-bold">Main Content</h1>
        <p className="mt-2 text-muted-foreground">
          This is the main content area without a sidebar.
        </p>
      </div>
    ),
  },
};

export const WithoutHeader: Story = {
  args: {
    sidebar: <Sidebar />,
    children: (
      <div className="p-6">
        <h1 className="text-3xl font-bold">Main Content</h1>
        <p className="mt-2 text-muted-foreground">
          This is the main content area without a header.
        </p>
      </div>
    ),
  },
};

export const LongContent: Story = {
  args: {
    header: <Header />,
    sidebar: <Sidebar />,
    children: (
      <div className="p-6">
        <h1 className="text-3xl font-bold">Long Content</h1>
        {Array(20).fill(null).map((_, i) => (
          <div key={i} className="mt-4">
            <h2 className="text-xl font-semibold">Section {i + 1}</h2>
            <p className="mt-2 text-muted-foreground">
              {Array(5).fill("Lorem ipsum dolor sit amet. ").join("")}
            </p>
          </div>
        ))}
      </div>
    ),
  },
};

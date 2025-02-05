import type { Meta, StoryObj } from "@storybook/react";
import { Header } from "../Header";
import { MemoryRouter } from "react-router-dom";

const meta: Meta<typeof Header> = {
  title: "Layout/Header",
  component: Header,
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
type Story = StoryObj<typeof Header>;

export const Default: Story = {
  args: {},
};

export const WithLongNavigation: Story = {
  args: {
    children: (
      <div className="flex items-center space-x-4">
        {Array(10).fill("Very Long Navigation Item").map((text, i) => (
          <a
            key={i}
            href={`/link-${i}`}
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {text}
          </a>
        ))}
      </div>
    ),
  },
};

export const WithCustomBranding: Story = {
  args: {
    children: (
      <div className="flex items-center space-x-4">
        <img
          src="https://via.placeholder.com/32"
          alt="Logo"
          className="h-8 w-8"
        />
        <span className="text-lg font-bold">Custom Brand</span>
      </div>
    ),
  },
};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  args: {},
};

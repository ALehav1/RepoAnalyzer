import type { Meta, StoryObj } from "@storybook/react";
import { Sidebar } from "../Sidebar";
import { MemoryRouter } from "react-router-dom";

const meta: Meta<typeof Sidebar> = {
  title: "Layout/Sidebar",
  component: Sidebar,
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
type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {
  args: {},
};

export const WithActiveRoute: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={["/files"]}>
        <Story />
      </MemoryRouter>
    ),
  ],
  args: {},
};

export const WithNestedNavigation: Story = {
  args: {
    children: (
      <div className="space-y-4">
        {Array(5).fill(null).map((_, i) => (
          <div key={i} className="space-y-2">
            <h3 className="font-medium">Section {i + 1}</h3>
            {Array(3).fill(null).map((_, j) => (
              <div key={j} className="pl-4 space-y-1">
                <h4 className="text-sm font-medium">Subsection {j + 1}</h4>
                {Array(2).fill(null).map((_, k) => (
                  <a
                    key={k}
                    href={`/section-${i}/subsection-${j}/item-${k}`}
                    className="block text-sm text-muted-foreground hover:text-primary"
                  >
                    Item {k + 1}
                  </a>
                ))}
              </div>
            ))}
          </div>
        ))}
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

export const WithCustomWidth: Story = {
  args: {
    className: "w-80",
  },
};

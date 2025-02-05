import type { Preview } from "@storybook/react";
import { ThemeProvider } from "@/components/theme-provider";
import "../src/index.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default preview;

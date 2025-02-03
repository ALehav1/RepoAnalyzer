import { MantineThemeOverride } from '@mantine/core';

export const theme: MantineThemeOverride = {
  primaryColor: 'indigo',
  primaryShade: 6,
  fontFamily: 'Inter, sans-serif',
  headings: {
    fontFamily: 'Inter, sans-serif',
    sizes: {
      h1: { fontSize: '2rem' },
      h2: { fontSize: '1.5rem' },
      h3: { fontSize: '1.25rem' },
    },
  },
  components: {
    Button: {
      defaultProps: {
        size: 'md',
      },
      styles: {
        root: {
          fontWeight: 500,
        },
      },
    },
    Card: {
      defaultProps: {
        shadow: 'sm',
        radius: 'md',
      },
    },
  },
  globalStyles: (theme) => ({
    '*, *::before, *::after': {
      boxSizing: 'border-box',
    },
    body: {
      ...theme.fn.fontStyles(),
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
      color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[9],
      lineHeight: theme.lineHeight,
    },
  }),
};

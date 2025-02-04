import { MantineThemeOverride } from '@mantine/core';

export const theme: MantineThemeOverride = {
  colors: {
    brand: [
      '#F0F8FF', // 0: Lightest
      '#C2E0FF', // 1
      '#A5D8FF', // 2
      '#7CC4FA', // 3
      '#4FAEF7', // 4
      '#2491F4', // 5: Primary
      '#1283F0', // 6
      '#0B6BD4', // 7
      '#0A5CAB', // 8
      '#07468C', // 9: Darkest
    ],
  },
  primaryColor: 'brand',
  primaryShade: 5,
  fontFamily: 'Inter, sans-serif',
  headings: {
    fontFamily: 'Inter, sans-serif',
    sizes: {
      h1: { fontSize: '2rem', fontWeight: 600 },
      h2: { fontSize: '1.5rem', fontWeight: 600 },
      h3: { fontSize: '1.25rem', fontWeight: 500 },
      h4: { fontSize: '1.1rem', fontWeight: 500 },
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
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    Card: {
      defaultProps: {
        shadow: 'sm',
        radius: 'md',
        p: 'lg',
      },
      styles: (theme) => ({
        root: {
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.white,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows.md,
          },
        },
      }),
    },
    AppShell: {
      styles: (theme) => ({
        main: {
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
        },
      }),
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
    a: {
      color: theme.colors.brand[6],
      textDecoration: 'none',
      transition: 'color 0.2s ease',
      '&:hover': {
        color: theme.colors.brand[7],
      },
    },
  }),
};

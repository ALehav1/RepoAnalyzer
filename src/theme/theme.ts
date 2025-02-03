import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#4F46E5', contrastText: '#FFFFFF' },
    secondary: { main: '#10B981', contrastText: '#FFFFFF' },
    error: { main: '#EF4444' },
    background: { default: '#F9FAFB' },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h1: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.3 },
    body1: { fontSize: '1rem', lineHeight: 1.5 },
    button: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { 
          textTransform: 'none',
          padding: '8px 16px',
          borderRadius: '6px',
        },
        contained: {
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: { 
        variant: 'outlined',
        fullWidth: true,
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '6px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MantineProvider, ColorSchemeProvider, ColorScheme } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Notifications } from '@mantine/notifications';
import { useState } from 'react';
import { AppShell } from '@mantine/core';
import ErrorBoundary from './components/ErrorBoundary';
import AppNavbar from './components/layout/AppNavbar';
import HomePage from './pages/HomePage';
import SavedReposPage from './pages/SavedReposPage';
import RepoDetailPage from './pages/RepoDetailPage';
import BestPracticesPage from './pages/BestPracticesPage';
import ChatPage from './pages/ChatPage';
import { theme } from './theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export default function App() {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');

  const toggleColorScheme = (value?: ColorScheme) => {
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
          <MantineProvider theme={{ ...theme, colorScheme }} withGlobalStyles withNormalizeCSS>
            <Notifications />
            <Router>
              <AppShell
                padding="md"
                navbar={<AppNavbar />}
                styles={(theme) => ({
                  main: {
                    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
                  },
                })}
              >
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/saved-repos" element={<SavedReposPage />} />
                  <Route path="/repo/:id" element={<RepoDetailPage />} />
                  <Route path="/best-practices" element={<BestPracticesPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                </Routes>
              </AppShell>
            </Router>
          </MantineProvider>
        </ColorSchemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

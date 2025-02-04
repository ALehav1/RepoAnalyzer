import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Notifications } from '@mantine/notifications';
import { useState } from 'react';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { AppShellLayout } from './components/layout/AppShellLayout';
import { HomePage } from './pages/HomePage';
import { SavedReposPage } from './pages/SavedReposPage';
import { RepoDetailPage } from './pages/RepoDetailPage';
import { BestPracticesPage } from './pages/BestPracticesPage';
import { ChatPage } from './pages/ChatPage';
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

export function App() {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  const toggleColorScheme = () => {
    setColorScheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ErrorBoundary>
      <MantineProvider theme={theme} defaultColorScheme={colorScheme}>
        <ColorSchemeScript defaultColorScheme={colorScheme} />
        <Notifications />
        <QueryClientProvider client={queryClient}>
          <Router>
            <AppShellLayout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/saved-repos" element={<SavedReposPage />} />
                <Route path="/repo/:id" element={<RepoDetailPage />} />
                <Route path="/best-practices" element={<BestPracticesPage />} />
                <Route path="/chat" element={<ChatPage />} />
              </Routes>
            </AppShellLayout>
          </Router>
        </QueryClientProvider>
      </MantineProvider>
    </ErrorBoundary>
  );
}

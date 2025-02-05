import { useState } from 'react';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { AppShell, ErrorBoundary, Header, Sidebar } from '@/components/layout';
import { RepositoryInput, AnalysisView } from '@/components/repository';
import { theme } from '@/theme';

function App() {
  const [repoUrl, setRepoUrl] = useState<string>('');

  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Notifications />
      <ErrorBoundary>
        <AppShell
          header={<Header />}
          sidebar={<Sidebar />}
        >
          <div className="container py-6">
            <RepositoryInput
              onAnalyze={setRepoUrl}
              isLoading={false}
            />
            {repoUrl && <AnalysisView repoUrl={repoUrl} />}
          </div>
        </AppShell>
      </ErrorBoundary>
    </MantineProvider>
  );
}

export default App;

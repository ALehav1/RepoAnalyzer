import { useState } from 'react';
import { AppShell, ErrorBoundary, Header } from '@/components/layout';
import { RepositoryInput, AnalysisView } from '@/components/repository';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toast, ToastProvider } from '@/components/common/ui';

function AppContent() {
  const [repoUrl, setRepoUrl] = useState<string>('');

  return (
    <div className={`min-h-screen bg-background`}>
      <ErrorBoundary>
        <AppShell header={<Header />}>
          <div className="max-w-4xl mx-auto p-4">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight mb-4">Repository Analysis</h1>
              <p className="text-muted-foreground">
                Enter a repository URL to analyze its code patterns and quality.
              </p>
            </div>

            <div className="space-y-8">
              <RepositoryInput onAnalyze={setRepoUrl} isLoading={false} />
              {repoUrl && <AnalysisView repositoryUrl={repoUrl} />}
            </div>
          </div>
        </AppShell>
      </ErrorBoundary>
      <Toast />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ThemeProvider>
  );
}

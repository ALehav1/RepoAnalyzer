import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from './components/ui/toaster'
import { RepoProvider } from './context/RepoContext'
import { ThemeProvider } from './components/theme-provider'
import Layout from './components/layout'
import LoadRepo from './pages/LoadRepo'
import SavedRepos from './pages/SavedRepos'
import RepoDetail from './pages/RepoDetail'
import Chat from './pages/Chat'
import GlobalChat from './pages/GlobalChat'
import BestPractices from './pages/BestPractices'

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RepoProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Global Routes */}
              <Route path="/" element={<LoadRepo />} />
              <Route path="/saved" element={<SavedRepos />} />
              <Route path="/chat" element={<GlobalChat />} />
              <Route path="/practices" element={<BestPractices />} />

              {/* Repository-Specific Routes */}
              <Route path="/repos/:id" element={<RepoDetail />} />
              <Route path="/repos/:id/chat" element={<Chat />} />
              <Route path="/repos/:id/practices" element={<BestPractices />} />
            </Routes>
          </Layout>
          <Toaster />
        </Router>
      </RepoProvider>
    </ThemeProvider>
  )
}

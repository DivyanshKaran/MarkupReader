import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home, About } from './pages';
import { HomePage, ProjectView, Layout, DocPage, DocsHome, ErrorBoundary, NotFoundPage, ConnectionStatus, PWAInstallPrompt } from './components';
import { ThemeProvider } from './contexts';
import LoadingSpinner from './components/LoadingSpinner';
// import { registerServiceWorker } from './utils/serviceWorker';

const App: React.FC = () => {
  useEffect(() => {
    // Register service worker (temporarily disabled for CSS debugging)
    // registerServiceWorker();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <Layout>
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" text="Loading application..." />
              </div>
            }>
              <Routes>
                {/* Documentation routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/:projectName" element={<ProjectView />} />
                <Route path="/:projectName/:fileName" element={<DocPage />} />

                {/* Additional routes */}
                <Route path="/docs" element={<DocsHome />} />
                <Route path="/about" element={<About />} />
                <Route path="/old-home" element={<Home />} />

                {/* Catch-all route for 404 */}
                <Route path="*" element={<NotFoundPage type="page" />} />
              </Routes>
            </Suspense>
            <ConnectionStatus />
            <PWAInstallPrompt />
          </Layout>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
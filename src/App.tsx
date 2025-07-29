import React, { useState, useCallback } from 'react';
import { FlagProvider } from '@/components/FlagProvider';
import { LazyFlagDashboard, LazyPerformanceMetrics, LazyFlagTestingUI } from '@/components/LazyComponents';

interface AppProps {
  onReady?: () => void;
}

type Tab = 'dashboard' | 'metrics' | 'testing';

export const App: React.FC<AppProps> = ({ onReady }) => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
  }, []);

  const handleFlagSystemReady = useCallback(() => {
    console.log('Flag system ready');
    onReady?.();
  }, [onReady]);

  return (
    <FlagProvider
      userId="demo-user-123"
      userSegments={['beta', 'premium']}
      onReady={handleFlagSystemReady}
    >
      <div className="app">
        <nav className="app-nav">
          <div className="nav-brand">
            <h1>⚡ Fast Flags</h1>
            <span className="nav-subtitle">High Performance Feature Flags</span>
          </div>
          <div className="nav-tabs">
            <button
              className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleTabChange('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`nav-tab ${activeTab === 'metrics' ? 'active' : ''}`}
              onClick={() => handleTabChange('metrics')}
            >
              Performance
            </button>
            <button
              className={`nav-tab ${activeTab === 'testing' ? 'active' : ''}`}
              onClick={() => handleTabChange('testing')}
            >
              Testing
            </button>
          </div>
        </nav>

        <main className="app-main">
          {activeTab === 'dashboard' && <LazyFlagDashboard />}
          {activeTab === 'metrics' && <LazyPerformanceMetrics />}
          {activeTab === 'testing' && <LazyFlagTestingUI />}
        </main>

        <footer className="app-footer">
          <p>Built with performance in mind • Bundle size optimized • Cache-first architecture</p>
        </footer>
      </div>
    </FlagProvider>
  );
};
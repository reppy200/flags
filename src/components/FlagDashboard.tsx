import React, { memo, useMemo, useState } from 'react';
import { useFeatureFlags, useFlagRefresh } from '@/hooks/useFeatureFlag';
import { useFlags, useFlagLoading, useFlagError } from '@/stores/flagStore';
import { throttle } from '@/utils/performance';

interface FlagCardProps {
  flagId: string;
  flag: any;
  isEnabled: boolean;
  onRefresh: (flagId: string) => void;
}

const FlagCard = memo<FlagCardProps>(({ flagId, flag, isEnabled, onRefresh }) => {
  const handleRefresh = () => onRefresh(flagId);
  
  return (
    <div className={`flag-card ${isEnabled ? 'enabled' : 'disabled'}`}>
      <div className="flag-header">
        <h3>{flag.name}</h3>
        <div className={`flag-status ${isEnabled ? 'on' : 'off'}`}>
          {isEnabled ? 'ON' : 'OFF'}
        </div>
      </div>
      <p className="flag-description">{flag.description}</p>
      <div className="flag-actions">
        <button 
          onClick={handleRefresh}
          className="refresh-btn"
          aria-label={`Refresh ${flag.name}`}
        >
          Refresh
        </button>
      </div>
    </div>
  );
});

FlagCard.displayName = 'FlagCard';

export const FlagDashboard: React.FC = memo(() => {
  const flags = useFlags();
  const loading = useFlagLoading();
  const error = useFlagError();
  const { refreshFlag } = useFlagRefresh();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEnabled, setFilterEnabled] = useState<boolean | null>(null);

  const flagIds = useMemo(() => Object.keys(flags), [flags]);
  const flagValues = useFeatureFlags(flagIds);

  // Throttled search to prevent excessive filtering
  const throttledSearch = useMemo(
    () => throttle((term: string) => setSearchTerm(term), 300),
    []
  );

  const filteredFlags = useMemo(() => {
    return Object.entries(flags).filter(([flagId, flag]) => {
      const matchesSearch = !searchTerm || 
        flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flag.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterEnabled === null || 
        flagValues[flagId] === filterEnabled;
      
      return matchesSearch && matchesFilter;
    });
  }, [flags, flagValues, searchTerm, filterEnabled]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading flags...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Error Loading Flags</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="flag-dashboard">
      <header className="dashboard-header">
        <h1>Feature Flags Dashboard</h1>
        <div className="dashboard-stats">
          <span>Total: {flagIds.length}</span>
          <span>Enabled: {Object.values(flagValues).filter(Boolean).length}</span>
        </div>
      </header>

      <div className="dashboard-filters">
        <input
          type="text"
          placeholder="Search flags..."
          onChange={(e) => throttledSearch(e.target.value)}
          className="search-input"
        />
        <select
          value={filterEnabled === null ? 'all' : filterEnabled.toString()}
          onChange={(e) => {
            const value = e.target.value;
            setFilterEnabled(value === 'all' ? null : value === 'true');
          }}
          className="filter-select"
        >
          <option value="all">All Flags</option>
          <option value="true">Enabled Only</option>
          <option value="false">Disabled Only</option>
        </select>
      </div>

      <div className="flags-grid">
        {filteredFlags.map(([flagId, flag]) => (
          <FlagCard
            key={flagId}
            flagId={flagId}
            flag={flag}
            isEnabled={flagValues[flagId]}
            onRefresh={refreshFlag}
          />
        ))}
      </div>

      {filteredFlags.length === 0 && (
        <div className="no-flags">
          <p>No flags match your criteria</p>
        </div>
      )}
    </div>
  );
});

FlagDashboard.displayName = 'FlagDashboard';
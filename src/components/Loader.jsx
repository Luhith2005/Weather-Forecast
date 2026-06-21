import React from 'react';

export default function Loader() {
  return (
    <div className="dashboard-grid animate-fade-in">
      {/* Left Column Skeleton */}
      <div className="left-column">
        {/* Main Weather Card Skeleton */}
        <div className="glass-panel weather-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <div className="shimmer" style={{ width: '180px', height: '32px', borderRadius: '8px', marginBottom: '0.5rem' }} />
              <div className="shimmer" style={{ width: '100px', height: '20px', borderRadius: '6px' }} />
            </div>
            <div className="shimmer" style={{ width: '80px', height: '32px', borderRadius: '100px' }} />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
            <div className="shimmer" style={{ width: '140px', height: '70px', borderRadius: '12px' }} />
            <div className="shimmer" style={{ width: '70px', height: '70px', borderRadius: '50%' }} />
          </div>
          
          <div className="weather-details-grid" style={{ marginBottom: '2rem' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div className="shimmer" style={{ width: '40px', height: '40px', borderRadius: '12px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div className="shimmer" style={{ width: '50px', height: '12px', borderRadius: '4px' }} />
                  <div className="shimmer" style={{ width: '70px', height: '16px', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>

          <div className="forecast-divider" style={{ borderTop: '1px solid var(--glass-border)', margin: '2rem 0 1.5rem 0' }} />
          
          <div className="weather-card-forecast-section">
            <div className="shimmer" style={{ width: '150px', height: '22px', borderRadius: '6px', marginBottom: '1.25rem' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.5fr 2fr', alignItems: 'center', padding: '1rem 1.25rem', border: '1px solid var(--glass-border)', borderRadius: '18px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div className="shimmer" style={{ width: '60px', height: '16px', borderRadius: '4px' }} />
                    <div className="shimmer" style={{ width: '40px', height: '12px', borderRadius: '4px' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="shimmer" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                    <div className="shimmer" style={{ width: '50px', height: '14px', borderRadius: '4px' }} />
                  </div>
                  <div />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <div className="shimmer" style={{ width: '100px', height: '12px', borderRadius: '4px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Recent Searches / Saved Locations Skeleton */}
        <div className="glass-panel recent-searches-card">
          <div className="shimmer" style={{ width: '120px', height: '22px', borderRadius: '6px', marginBottom: '1rem' }} />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div className="shimmer" style={{ width: '90px', height: '32px', borderRadius: '100px' }} />
            <div className="shimmer" style={{ width: '80px', height: '32px', borderRadius: '100px' }} />
            <div className="shimmer" style={{ width: '100px', height: '32px', borderRadius: '100px' }} />
          </div>
        </div>
      </div>
      
      {/* Right Column Skeleton */}
      <div className="right-column">
        {/* Metrics 2x2 Grid Skeleton */}
        <div className="metrics-card-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-panel metric-panel">
              <div className="shimmer" style={{ width: '50px', height: '50px', borderRadius: '20px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <div className="shimmer" style={{ width: '80px', height: '14px', borderRadius: '4px' }} />
                <div className="shimmer" style={{ width: '120px', height: '24px', borderRadius: '6px' }} />
              </div>
            </div>
          ))}
        </div>
        
        {/* Location Map Skeleton */}
        <div className="glass-panel map-card" style={{ height: '320px', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="shimmer" style={{ width: '120px', height: '22px', borderRadius: '6px' }} />
            <div className="shimmer" style={{ width: '80px', height: '28px', borderRadius: '100px' }} />
          </div>
          <div className="shimmer" style={{ flex: 1, borderRadius: '16px' }} />
        </div>
      </div>
    </div>
  );
}

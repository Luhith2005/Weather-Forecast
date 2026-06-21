import React from 'react';

export default function Loader() {
  return (
    <div className="dashboard-grid animate-fade-in">
      {/* Left side skeletons */}
      <div className="left-column">
        {/* Current weather skeleton */}
        <div className="glass-panel weather-card" style={{ minHeight: '380px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <div className="shimmer" style={{ width: '140px', height: '32px', borderRadius: '8px', marginBottom: '0.5rem' }} />
              <div className="shimmer" style={{ width: '80px', height: '20px', borderRadius: '6px' }} />
            </div>
            <div className="shimmer" style={{ width: '70px', height: '32px', borderRadius: '100px' }} />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
            <div className="shimmer" style={{ width: '130px', height: '70px', borderRadius: '12px' }} />
            <div className="shimmer" style={{ width: '70px', height: '70px', borderRadius: '50%' }} />
          </div>
          
          <div className="weather-details-grid">
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
        </div>
        
        {/* Recent searches skeleton */}
        <div className="glass-panel recent-searches-card">
          <div className="shimmer" style={{ width: '120px', height: '22px', borderRadius: '6px', marginBottom: '1rem' }} />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div className="shimmer" style={{ width: '90px', height: '32px', borderRadius: '100px' }} />
            <div className="shimmer" style={{ width: '80px', height: '32px', borderRadius: '100px' }} />
            <div className="shimmer" style={{ width: '100px', height: '32px', borderRadius: '100px' }} />
          </div>
        </div>
      </div>
      
      {/* Right side skeletons */}
      <div className="right-column">
        {/* Secondary metrics grid skeleton */}
        <div className="metrics-card-grid">
          {[1, 2].map((i) => (
            <div key={i} className="glass-panel metric-panel">
              <div className="shimmer" style={{ width: '50px', height: '50px', borderRadius: '20px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <div className="shimmer" style={{ width: '80px', height: '14px', borderRadius: '4px' }} />
                <div className="shimmer" style={{ width: '120px', height: '24px', borderRadius: '6px' }} />
              </div>
            </div>
          ))}
        </div>
        
        {/* 5-day forecast skeleton */}
        <div className="glass-panel forecast-card" style={{ flex: 1 }}>
          <div className="shimmer" style={{ width: '150px', height: '24px', borderRadius: '6px', marginBottom: '1.5rem' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 2fr', alignItems: 'center', padding: '1rem', border: '1px solid var(--glass-border)', borderRadius: '18px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div className="shimmer" style={{ width: '70px', height: '16px', borderRadius: '4px' }} />
                  <div className="shimmer" style={{ width: '40px', height: '12px', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="shimmer" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                  <div className="shimmer" style={{ width: '60px', height: '14px', borderRadius: '4px' }} />
                </div>
                <div />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <div className="shimmer" style={{ width: '35px', height: '16px', borderRadius: '4px' }} />
                  <div className="shimmer" style={{ width: '35px', height: '16px', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

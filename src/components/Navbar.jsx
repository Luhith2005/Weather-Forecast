import React, { useState, useEffect } from 'react';
import { Sun, Moon, CloudSun, Clock } from 'lucide-react';

export default function Navbar({ isDarkMode, toggleTheme, timezone }) {
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateClock = () => {
      try {
        const options = {
          timeZone: timezone || undefined,
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        };
        const formatter = new Intl.DateTimeFormat('en-US', options);
        setTimeString(formatter.format(new Date()));
      } catch (e) {
        setTimeString(new Date().toLocaleTimeString());
      }
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  return (
    <nav className="glass-panel navbar animate-fade-in">
      <div className="brand">
        <CloudSun size={32} className="brand-icon" />
        <h1 className="brand-title">Skyline Weather</h1>
      </div>
      
      <div className="nav-actions">
        <div className="clock">
          <Clock size={16} />
          <span>{timeString || '--:--:-- --'}</span>
        </div>
        
        <button 
          onClick={toggleTheme} 
          className="theme-toggle" 
          aria-label="Toggle Theme"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </nav>
  );
}

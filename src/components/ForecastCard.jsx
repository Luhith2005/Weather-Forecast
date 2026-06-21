import React from 'react';
import * as Icons from 'lucide-react';
import { getWeatherConfig } from '../services/weatherApi';

export default function ForecastCard({ weatherData, unit, selectedDayIndex, setSelectedDayIndex }) {
  if (!weatherData || !weatherData.daily) return null;

  const { daily } = weatherData;
  const days = daily.time; // This contains 7 days (index 0 to 6)

  // Convert temperature to Fahrenheit if selected
  const formatTemp = (val) => {
    const converted = unit === 'C' ? val : (val * 9) / 5 + 32;
    return Math.round(converted);
  };

  const getAbbreviatedDay = (dateStr, index) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <div className="glass-panel forecast-card animate-fade-in stagger-2">
      <h3 className="card-title" style={{ marginBottom: '1.25rem' }}>
        <Icons.Calendar size={20} style={{ color: 'var(--accent-color)' }} />
        7-Day Forecast
      </h3>

      <div className="google-daily-row">
        {days.map((dateStr, index) => {
          const code = daily.weather_code[index];
          const tempMax = daily.temperature_2m_max[index];
          const tempMin = daily.temperature_2m_min[index];

          const { iconName } = getWeatherConfig(code, 1); // Default to day icons
          const DayIcon = Icons[iconName] || Icons.HelpCircle;

          const isActive = selectedDayIndex === index;

          return (
            <div
              key={dateStr}
              className={`google-daily-card ${isActive ? 'active' : ''} animate-fade-in stagger-${index + 1}`}
              onClick={() => setSelectedDayIndex(index)}
              title={`View weather details for ${new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long' })}`}
            >
              <span className="google-daily-day">{getAbbreviatedDay(dateStr, index)}</span>
              
              <DayIcon size={26} className="google-daily-icon" />

              <div className="google-daily-temps">
                <span className="google-daily-max">{formatTemp(tempMax)}°</span>
                <span className="google-daily-min">{formatTemp(tempMin)}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

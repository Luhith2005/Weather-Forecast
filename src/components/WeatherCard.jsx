import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { getWeatherConfig } from '../services/weatherApi';

export default function WeatherCard({ weatherData, cityDetails, unit, setUnit, onGeolocate, selectedDayIndex, isFavorite, onToggleFavorite }) {
  const [activeTab, setActiveTab] = useState('temp'); // 'temp', 'precip', 'wind'
  const [localTimeString, setLocalTimeString] = useState('');

  // Clock ticks only if Today (selectedDayIndex === 0) is selected
  useEffect(() => {
    if (selectedDayIndex !== 0) return;

    const updateTime = () => {
      try {
        const options = {
          timeZone: cityDetails.timezone || undefined,
          weekday: 'long',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        };
        setLocalTimeString(new Intl.DateTimeFormat('en-US', options).format(new Date()));
      } catch (e) {
        setLocalTimeString(new Date().toLocaleDateString('en-US', { weekday: 'long' }) + ', ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [cityDetails.timezone, selectedDayIndex]);

  if (!weatherData) return null;

  const current = weatherData.current;
  const daily = weatherData.daily;
  const hourly = weatherData.hourly;

  // 1. Determine active weather metrics based on selectedDayIndex (0 = Today, 1 = Tomorrow, etc.)
  let temp, humidity, windSpeed, precipitation, weatherCode, isDay, displayTime, conditionLabel, conditionIconName;

  if (selectedDayIndex === 0) {
    // Read actual precipitation probability for current hour from forecast datasets
    let currentPrecipProb = 0;
    try {
      const cityNow = new Date(new Date().toLocaleString('en-US', { timeZone: cityDetails.timezone || 'auto' }));
      const currentHr = cityNow.getHours();
      if (hourly && hourly.precipitation_probability && hourly.precipitation_probability[currentHr] !== undefined) {
        currentPrecipProb = hourly.precipitation_probability[currentHr];
      }
    } catch (e) {
      const currentHr = new Date().getHours();
      if (hourly && hourly.precipitation_probability && hourly.precipitation_probability[currentHr] !== undefined) {
        currentPrecipProb = hourly.precipitation_probability[currentHr];
      }
    }

    // Current Weather
    temp = current.temperature_2m;
    apparentTemp = current.apparent_temperature;
    humidity = current.relative_humidity_2m;
    windSpeed = current.wind_speed_10m;
    precipitation = currentPrecipProb;
    weatherCode = current.weather_code;
    isDay = current.is_day;
    displayTime = localTimeString || '--';
    
    const config = getWeatherConfig(weatherCode, isDay);
    conditionLabel = config.label;
    conditionIconName = config.iconName;
  } else {
    // Future Forecast Day Weather
    const idx = selectedDayIndex;
    temp = daily.temperature_2m_max[idx]; // Main temperature is max temp for the day
    weatherCode = daily.weather_code[idx];
    isDay = 1; // Default to day icons for future forecasts

    // Format future date string
    const dateStr = daily.time[idx];
    try {
      const date = new Date(dateStr + 'T00:00:00');
      displayTime = date.toLocaleDateString('en-US', { weekday: 'long', hour12: false }) + ', Forecast';
    } catch (e) {
      displayTime = dateStr;
    }

    const config = getWeatherConfig(weatherCode, isDay);
    conditionLabel = config.label;
    conditionIconName = config.iconName;

    // Calculate daily average metrics from hourly forecast data arrays
    const dayStartHour = idx * 24;
    
    // Average Humidity
    const dayHumidity = (hourly && hourly.relative_humidity_2m) ? hourly.relative_humidity_2m.slice(dayStartHour, dayStartHour + 24) : [];
    humidity = dayHumidity.length > 0 ? Math.round(dayHumidity.reduce((a, b) => a + b, 0) / 24) : 0;

    // Average Wind Speed
    const dayWind = (hourly && hourly.wind_speed_10m) ? hourly.wind_speed_10m.slice(dayStartHour, dayStartHour + 24) : [];
    windSpeed = dayWind.length > 0 ? Math.round(dayWind.reduce((a, b) => a + b, 0) / 24 * 10) / 10 : 0;

    // Max Precipitation Probability
    const dayPrecip = (hourly && hourly.precipitation_probability) ? hourly.precipitation_probability.slice(dayStartHour, dayStartHour + 24) : [];
    precipitation = dayPrecip.length > 0 ? Math.max(...dayPrecip) : 0;
  }

  // Helper apparentTemp definition
  var apparentTemp = apparentTemp || temp;

  // Temperature unit conversion
  const formatTemp = (val) => {
    const converted = unit === 'C' ? val : (val * 9) / 5 + 32;
    return Math.round(converted);
  };

  const WeatherIcon = Icons[conditionIconName] || Icons.HelpCircle;

  // 2. Fetch hourly metrics for the horizontal scroll lists
  const getHourlyList = () => {
    let startIndex = 0;
    if (selectedDayIndex === 0) {
      // Start near current hour of the location
      try {
        const cityNow = new Date(new Date().toLocaleString('en-US', { timeZone: cityDetails.timezone || 'auto' }));
        startIndex = Math.max(0, cityNow.getHours() - 1);
      } catch (e) {
        startIndex = new Date().getHours();
      }
    } else {
      // Start at midnight of selected day
      startIndex = selectedDayIndex * 24;
    }

    const items = [];
    for (let i = 0; i < 8; i++) {
      const idx = startIndex + i * 3; // Space by 3 hours
      if (hourly && hourly.time && idx < hourly.time.length) {
        items.push({
          time: hourly.time[idx],
          temp: (hourly.temperature_2m && hourly.temperature_2m[idx] !== undefined) ? hourly.temperature_2m[idx] : 0,
          precip: (hourly.precipitation_probability && hourly.precipitation_probability[idx] !== undefined) ? hourly.precipitation_probability[idx] : 0,
          windSpeed: (hourly.wind_speed_10m && hourly.wind_speed_10m[idx] !== undefined) ? hourly.wind_speed_10m[idx] : 0,
          windDir: (hourly.wind_direction_10m && hourly.wind_direction_10m[idx] !== undefined) ? hourly.wind_direction_10m[idx] : 0,
          weatherCode: (hourly.weather_code && hourly.weather_code[idx] !== undefined) ? hourly.weather_code[idx] : 0,
        });
      }
    }
    return items;
  };

  const formatHourString = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-US', {
        timeZone: cityDetails.timezone || undefined,
        hour: 'numeric',
        hour12: true
      }).toLowerCase();
    } catch (e) {
      return new Date(isoString).toLocaleTimeString([], { hour: 'numeric', hour12: true }).toLowerCase();
    }
  };

  const hourlyList = getHourlyList();

  // Combine city search strings for clean rendering
  const fullLocationName = `${cityDetails.name}${cityDetails.admin1 ? `, ${cityDetails.admin1}` : ''}${cityDetails.country ? `, ${cityDetails.country}` : ''}`;

  return (
    <div className="glass-panel weather-card animate-fade-in">
      {/* 1. Header Location & Precise location */}
      <div className="location-header">
        <div className="location-header-left">
          <Icons.MapPin className="location-header-icon" size={24} />
          <span className="location-header-title">{fullLocationName}</span>
          <button 
            className={`favorite-toggle-btn ${isFavorite ? 'active' : ''}`}
            onClick={onToggleFavorite}
            title={isFavorite ? "Remove from saved locations" : "Save to locations"}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '0.25rem',
              color: isFavorite ? '#eab308' : 'var(--text-muted)',
              transition: 'var(--transition-smooth)',
              marginLeft: '0.5rem'
            }}
          >
            <Icons.Star size={20} fill={isFavorite ? '#eab308' : 'none'} />
          </button>
        </div>
        
        <button onClick={onGeolocate} className="precise-location-btn">
          <Icons.Locate size={16} />
          Use precise location
        </button>
      </div>

      {/* 2. Google Weather Temperature Main Block */}
      <div className="google-temp-block">
        <div className="google-temp-left">
          <WeatherIcon size={80} className="weather-icon-large" />
          
          <div className="google-temp-num-wrapper">
            <span className="google-temp-num">{formatTemp(temp)}</span>
            <span className="google-temp-unit-links">
              <span 
                className={`google-temp-unit-link ${unit === 'C' ? 'active' : ''}`}
                onClick={() => setUnit('C')}
              >
                °C
              </span>
              <span className="google-temp-unit-divider">|</span>
              <span 
                className={`google-temp-unit-link ${unit === 'F' ? 'active' : ''}`}
                onClick={() => setUnit('F')}
              >
                °F
              </span>
            </span>
          </div>

          <div className="google-temp-sidebar-metrics">
            <span>Feels like: {formatTemp(apparentTemp)}°{unit}</span>
            <span>Precipitation: {precipitation}%</span>
            <span>Humidity: {humidity}%</span>
            <span>Wind: {windSpeed} km/h</span>
          </div>
        </div>

        <div className="google-temp-right">
          <h2 className="google-temp-right-title">Weather</h2>
          <span className="google-temp-right-time">{displayTime}</span>
          <span className="google-temp-right-desc">{conditionLabel}</span>
        </div>
      </div>

      {/* 3. Hourly Forecast Tabs Navigation */}
      <div className="google-tabs-row">
        <button 
          className={`google-tab-item ${activeTab === 'temp' ? 'active' : ''}`}
          onClick={() => setActiveTab('temp')}
        >
          Temperature
        </button>
        <button 
          className={`google-tab-item ${activeTab === 'precip' ? 'active' : ''}`}
          onClick={() => setActiveTab('precip')}
        >
          Precipitation
        </button>
        <button 
          className={`google-tab-item ${activeTab === 'wind' ? 'active' : ''}`}
          onClick={() => setActiveTab('wind')}
        >
          Wind
        </button>
      </div>

      {/* 4. Google Horizontal Scrollable Hourly Graph */}
      <div className="google-hourly-scroll">
        {hourlyList.map((hourData) => {
          const hourConf = getWeatherConfig(hourData.weatherCode, 1);
          const HourIcon = Icons[hourConf.iconName] || Icons.HelpCircle;

          return (
            <div key={hourData.time} className="google-hourly-item animate-fade-in">
              {/* Tab specific top value */}
              {activeTab === 'temp' && (
                <span className="google-hourly-val">{formatTemp(hourData.temp)}°</span>
              )}
              {activeTab === 'precip' && (
                <span className="google-hourly-val" style={{ color: '#2563eb' }}>{hourData.precip}%</span>
              )}
              {activeTab === 'wind' && (
                <span className="google-hourly-val">{Math.round(hourData.windSpeed)} km/h</span>
              )}

              {/* Tab specific center visual graphic */}
              {activeTab === 'temp' && (
                <div className="google-hourly-icon">
                  <HourIcon size={26} />
                </div>
              )}
              {activeTab === 'precip' && (
                <div className="google-hourly-icon" style={{ color: '#3b82f6' }}>
                  <Icons.Droplets size={22} />
                </div>
              )}
              {activeTab === 'wind' && (
                <div className="google-hourly-wind">
                  <Icons.ArrowUp 
                    className="google-hourly-wind-arrow" 
                    size={22} 
                    style={{ transform: `rotate(${hourData.windDir}deg)` }}
                  />
                </div>
              )}

              <span className="google-hourly-time">{formatHourString(hourData.time)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

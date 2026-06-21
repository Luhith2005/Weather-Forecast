import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { getWeatherConfig } from '../services/weatherApi';

export default function WeatherCard({ weatherData, cityDetails, unit, setUnit, onGeolocate, selectedDayIndex, setSelectedDayIndex, isFavorite, onToggleFavorite }) {
  const [activeTab, setActiveTab] = useState('temp'); 
  const [localTimeString, setLocalTimeString] = useState('');

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

  let temp, humidity, windSpeed, precipitation, weatherCode, isDay, displayTime, conditionLabel, conditionIconName;

  if (selectedDayIndex === 0) {

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

    const idx = selectedDayIndex;
    temp = daily.temperature_2m_max[idx]; 
    weatherCode = daily.weather_code[idx];
    isDay = 1; 

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

    const dayStartHour = idx * 24;
    
    const dayHumidity = (hourly && hourly.relative_humidity_2m) ? hourly.relative_humidity_2m.slice(dayStartHour, dayStartHour + 24) : [];
    humidity = dayHumidity.length > 0 ? Math.round(dayHumidity.reduce((a, b) => a + b, 0) / 24) : 0;

    const dayWind = (hourly && hourly.wind_speed_10m) ? hourly.wind_speed_10m.slice(dayStartHour, dayStartHour + 24) : [];
    windSpeed = dayWind.length > 0 ? Math.round(dayWind.reduce((a, b) => a + b, 0) / 24 * 10) / 10 : 0;

    const dayPrecip = (hourly && hourly.precipitation_probability) ? hourly.precipitation_probability.slice(dayStartHour, dayStartHour + 24) : [];
    precipitation = dayPrecip.length > 0 ? Math.max(...dayPrecip) : 0;
  }

  var apparentTemp = apparentTemp || temp;

  const formatTemp = (val) => {
    const converted = unit === 'C' ? val : (val * 9) / 5 + 32;
    return Math.round(converted);
  };

  const WeatherIcon = Icons[conditionIconName] || Icons.HelpCircle;

  const getHourlyList = () => {
    let startIndex = 0;
    if (selectedDayIndex === 0) {

      try {
        const cityNow = new Date(new Date().toLocaleString('en-US', { timeZone: cityDetails.timezone || 'auto' }));
        startIndex = Math.max(0, cityNow.getHours() - 1);
      } catch (e) {
        startIndex = new Date().getHours();
      }
    } else {

      startIndex = selectedDayIndex * 24;
    }

    const items = [];
    for (let i = 0; i < 8; i++) {
      const idx = startIndex + i * 3; 
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

  const fullLocationName = `${cityDetails.name}${cityDetails.admin1 ? `, ${cityDetails.admin1}` : ''}${cityDetails.country ? `, ${cityDetails.country}` : ''}`;

  return (
    <div className="glass-panel weather-card animate-fade-in">
      {}
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

      {}
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

      {}
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

      {}
      <div className="google-hourly-scroll">
        {hourlyList.map((hourData) => {
          const hourConf = getWeatherConfig(hourData.weatherCode, 1);
          const HourIcon = Icons[hourConf.iconName] || Icons.HelpCircle;

          return (
            <div key={hourData.time} className="google-hourly-item animate-fade-in">
              {}
              {activeTab === 'temp' && (
                <span className="google-hourly-val">{formatTemp(hourData.temp)}°</span>
              )}
              {activeTab === 'precip' && (
                <span className="google-hourly-val" style={{ color: '#2563eb' }}>{hourData.precip}%</span>
              )}
              {activeTab === 'wind' && (
                <span className="google-hourly-val">{Math.round(hourData.windSpeed)} km/h</span>
              )}

              {}
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

      <div className="forecast-divider" style={{ borderTop: '1px solid var(--glass-border)', margin: '2rem 0 1.5rem 0' }} />
      
      <div className="weather-card-forecast-section animate-fade-in">
        <h3 className="card-title" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <Icons.Calendar size={18} style={{ color: 'var(--accent-color)' }} />
          7-Day Forecast
        </h3>
        
        <div className="forecast-list">
          {daily.time.slice(0, 7).map((dateStr, index) => {
            const code = daily.weather_code[index];
            const tempMax = daily.temperature_2m_max[index];
            const tempMin = daily.temperature_2m_min[index];
            const { label: dayLabel, iconName: dayIconName } = getWeatherConfig(code, 1);
            const DayIcon = Icons[dayIconName] || Icons.HelpCircle;
            const isActive = selectedDayIndex === index;

            const minTempRange = Math.min(...daily.temperature_2m_min.slice(0, 7));
            const maxTempRange = Math.max(...daily.temperature_2m_max.slice(0, 7));
            const range = maxTempRange - minTempRange;
            const leftPercent = range > 0 ? Math.max(0, ((tempMin - minTempRange) / range) * 100) : 0;
            const rightPercent = range > 0 ? Math.max(0, ((maxTempRange - tempMax) / range) * 100) : 0;

            const getAbbreviatedDay = (dStr, idx) => {
              if (idx === 0) return 'Today';
              try {
                const date = new Date(dStr + 'T00:00:00');
                return date.toLocaleDateString('en-US', { weekday: 'short' });
              } catch (e) {
                return dStr;
              }
            };

            return (
              <div
                key={dateStr}
                className={`forecast-item ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedDayIndex(index)}
                style={{ cursor: 'pointer' }}
                title={`View details for ${getAbbreviatedDay(dateStr, index)}`}
              >
                <div>
                  <span className="forecast-day">{getAbbreviatedDay(dateStr, index)}</span>
                  <div className="forecast-date" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '2px' }}>
                    {new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                
                <div className="forecast-weather">
                  <DayIcon size={20} className="forecast-icon" />
                  <span className="forecast-desc">{dayLabel}</span>
                </div>

                <div />

                <div className="forecast-temp">
                  <div className="temp-range-bar">
                    <span className="temp-min">{formatTemp(tempMin)}°</span>
                    <div className="range-slider">
                      <div className="range-fill" style={{ left: `${leftPercent}%`, right: `${rightPercent}%` }} />
                    </div>
                    <span className="temp-max">{formatTemp(tempMax)}°</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import WeatherCard from '../components/WeatherCard';
import ForecastCard from '../components/ForecastCard';
import Loader from '../components/Loader';
import MapPanel from '../components/MapPanel';
import { fetchWeatherData, fetchAirQuality } from '../services/weatherApi';

const DEFAULT_CITY = {
  name: 'Hyderabad',
  latitude: 17.3850,
  longitude: 78.4867,
  country: 'India',
  country_code: 'IN',
  admin1: 'Telangana',
  timezone: 'Asia/Kolkata'
};

export default function Home() {
  const [currentCity, setCurrentCity] = useState(DEFAULT_CITY);

  const [weatherData, setWeatherData] = useState(null);
  const [airQualityData, setAirQualityData] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favoriteCities');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState('C');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isMapMaximized, setIsMapMaximized] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true; 
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedDayIndex(0);
          setCurrentCity({
            name: 'Current Location',
            latitude,
            longitude,
            country: '',
            country_code: '',
            admin1: '',
            timezone: 'auto'
          });

          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (data && data.address) {
                const addr = data.address;
                const resolvedName = addr.suburb || addr.neighbourhood || addr.city || addr.town || addr.village || addr.municipality || 'Current Location';
                const resolvedAdmin = addr.state || '';
                const resolvedCountry = addr.country || '';
                setCurrentCity((prev) => ({
                  ...prev,
                  name: resolvedName,
                  admin1: resolvedAdmin,
                  country: resolvedCountry
                }));
              }
            })
            .catch((e) => console.error('Reverse geocoding error:', e));
        },
        (err) => {
          console.log('Auto location detection denied or failed. Loading saved or default city.');
        }
      );
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMapMaximized(false);
      }
    };
    if (isMapMaximized) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMapMaximized]);

  useEffect(() => {
    let active = true;

    async function loadWeatherData() {
      setIsLoading(true);
      setError(null);
      try {
        const [wData, aqData] = await Promise.all([
          fetchWeatherData(
            currentCity.latitude,
            currentCity.longitude,
            currentCity.timezone
          ),
          fetchAirQuality(
            currentCity.latitude,
            currentCity.longitude
          )
        ]);
        if (active) {
          setWeatherData(wData);
          setAirQualityData(aqData);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        if (active) {
          setError('Failed to fetch weather data. Please check your internet connection and try again.');
          setIsLoading(false);
        }
      }
    }

    loadWeatherData();

    return () => {
      active = false;
    };
  }, [currentCity]);

  const handleToggleFavorite = (cityToToggle) => {
    setFavorites((prev) => {
      const isAlreadyFav = prev.some(
        (c) => (c.name.toLowerCase() === cityToToggle.name.toLowerCase()) ||
               (Math.abs(c.latitude - cityToToggle.latitude) < 0.01 && 
                Math.abs(c.longitude - cityToToggle.longitude) < 0.01)
      );
      let updated;
      if (isAlreadyFav) {
        updated = prev.filter(
          (c) => !(c.name.toLowerCase() === cityToToggle.name.toLowerCase() ||
                   (Math.abs(c.latitude - cityToToggle.latitude) < 0.01 && 
                    Math.abs(c.longitude - cityToToggle.longitude) < 0.01))
        );
      } else {
        const cityToSave = {
          name: cityToToggle.name,
          latitude: cityToToggle.latitude,
          longitude: cityToToggle.longitude,
          country: cityToToggle.country || '',
          country_code: cityToToggle.country_code || '',
          admin1: cityToToggle.admin1 || '',
          timezone: cityToToggle.timezone || 'auto'
        };
        updated = [...prev, cityToSave];
      }
      localStorage.setItem('favoriteCities', JSON.stringify(updated));
      return updated;
    });
  };

  const isCurrentCityFavorite = favorites.some(
    (c) => (c.name.toLowerCase() === currentCity.name.toLowerCase()) ||
           (Math.abs(c.latitude - currentCity.latitude) < 0.01 && 
            Math.abs(c.longitude - currentCity.longitude) < 0.01)
  );

  const getUVIndexInfo = (uvValue) => {
    if (uvValue === undefined || uvValue === null) return { text: '--', color: 'var(--text-muted)' };
    const val = parseFloat(uvValue);
    if (val <= 2) return { text: 'Low', color: '#10b981' };
    if (val <= 5) return { text: 'Moderate', color: '#f59e0b' };
    if (val <= 7) return { text: 'High', color: '#f97316' };
    if (val <= 10) return { text: 'Very High', color: '#ef4444' };
    return { text: 'Extreme', color: '#a855f7' };
  };

  const getAQIInfo = (aqiValue) => {
    if (aqiValue === undefined || aqiValue === null) return { text: '--', color: 'var(--text-muted)' };
    const val = parseInt(aqiValue, 10);
    if (val <= 50) return { text: 'Good', color: '#10b981' };
    if (val <= 100) return { text: 'Moderate', color: '#f59e0b' };
    if (val <= 150) return { text: 'Unhealthy (Sens.)', color: '#f97316' };
    if (val <= 200) return { text: 'Unhealthy', color: '#ef4444' };
    if (val <= 300) return { text: 'Very Unhealthy', color: '#a855f7' };
    return { text: 'Hazardous', color: '#7f1d1d' };
  };

  const currentAQI = airQualityData?.current?.us_aqi;
  const currentUV = weatherData?.daily?.uv_index_max?.[selectedDayIndex];

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setSelectedDayIndex(0);
        setCurrentCity({
          name: 'Current Location',
          latitude,
          longitude,
          country: '',
          country_code: '',
          admin1: '',
          timezone: 'auto'
        });

        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data && data.address) {
              const addr = data.address;
              const resolvedName = addr.suburb || addr.neighbourhood || addr.city || addr.town || addr.village || addr.municipality || 'Current Location';
              const resolvedAdmin = addr.state || '';
              const resolvedCountry = addr.country || '';
              setCurrentCity((prev) => ({
                ...prev,
                name: resolvedName,
                admin1: resolvedAdmin,
                country: resolvedCountry
              }));
            }
          })
          .catch((e) => console.error('Reverse geocoding error:', e));
      },
      (err) => {
        console.error(err);
        setError('Unable to access your location. Please type to search manually.');
        setIsLoading(false);
      }
    );
  };

  const handleSelectCity = (city) => {
    setError(null);
    setSelectedDayIndex(0);
    setCurrentCity(city);
  };

  const handleSearchError = (msg) => {
    setError(msg);
  };

  const formatTime = (isoString, timezone) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-US', {
        timeZone: timezone || undefined,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (e) {
      return new Date(isoString).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar
        isDarkMode={isDarkMode}
        toggleTheme={() => setIsDarkMode(!isDarkMode)}
        timezone={weatherData?.timezone || currentCity.timezone}
      />
      
      <SearchBar
        onSelectCity={handleSelectCity}
        onSearchError={handleSearchError}
        currentCityName={currentCity.name}
        onGeolocate={handleGeolocate}
      />

      {error && (
        <div className="glass-panel error-alert animate-fade-in">
          <Icons.AlertCircle size={24} />
          <div>
            <div className="error-title">Error</div>
            <div className="error-msg">{error}</div>
          </div>
        </div>
      )}

      {isLoading ? (
        <Loader />
      ) : (
        <div className="dashboard-grid">
          {}
          <div className="left-column">
            <WeatherCard
              weatherData={weatherData}
              cityDetails={{
                ...currentCity,
                timezone: weatherData?.timezone || currentCity.timezone
              }}
              unit={unit}
              setUnit={setUnit}
              onGeolocate={handleGeolocate}
              selectedDayIndex={selectedDayIndex}
              isFavorite={isCurrentCityFavorite}
              onToggleFavorite={() => handleToggleFavorite(currentCity)}
            />

            <div className="glass-panel recent-searches-card animate-fade-in stagger-3">
              <h3 className="card-title">
                <Icons.Star size={18} fill="#eab308" style={{ color: '#eab308' }} />
                Saved Locations
              </h3>
              {favorites.length === 0 ? (
                <div className="no-history">No saved locations yet. Star a city to save it!</div>
              ) : (
                <div className="recent-list">
                  {favorites.map((city) => (
                    <div
                      key={city.name + city.latitude}
                      className="recent-item animate-fade-in"
                      onClick={() => handleSelectCity(city)}
                    >
                      <span>{city.name}</span>
                      <button
                        className="recent-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(city);
                        }}
                        title="Remove city from favorites"
                      >
                        <Icons.X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {}
          <div className="right-column">
            <div className="metrics-card-grid">
              <div className="glass-panel metric-panel animate-fade-in stagger-3">
                <div className="metric-panel-icon">
                  <Icons.Sunrise size={24} />
                </div>
                <div className="metric-panel-data">
                  <span className="metric-panel-title">Sunrise</span>
                  <span className="metric-panel-value">
                    {weatherData && weatherData.daily
                      ? formatTime(weatherData.daily.sunrise[selectedDayIndex], weatherData.timezone || currentCity.timezone)
                      : '--:--'}
                  </span>
                  <span className="metric-panel-subtext">Local sunrise time</span>
                </div>
              </div>

              <div className="glass-panel metric-panel animate-fade-in stagger-4">
                <div className="metric-panel-icon">
                  <Icons.Sunset size={24} />
                </div>
                <div className="metric-panel-data">
                  <span className="metric-panel-title">Sunset</span>
                  <span className="metric-panel-value">
                    {weatherData && weatherData.daily
                      ? formatTime(weatherData.daily.sunset[selectedDayIndex], weatherData.timezone || currentCity.timezone)
                      : '--:--'}
                  </span>
                  <span className="metric-panel-subtext">Local sunset time</span>
                </div>
              </div>

              <div className="glass-panel metric-panel animate-fade-in stagger-5">
                <div className="metric-panel-icon">
                  <Icons.SunDim size={24} />
                </div>
                <div className="metric-panel-data">
                  <span className="metric-panel-title">UV Index</span>
                  <span className="metric-panel-value">
                    {currentUV !== undefined ? currentUV.toFixed(1) : '--'}
                  </span>
                  <span className="metric-panel-subtext" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    Risk: <span style={{ color: getUVIndexInfo(currentUV).color, fontWeight: 600 }}>{getUVIndexInfo(currentUV).text}</span>
                  </span>
                </div>
              </div>

              <div className="glass-panel metric-panel animate-fade-in stagger-6">
                <div className="metric-panel-icon">
                  <Icons.Wind size={24} />
                </div>
                <div className="metric-panel-data">
                  <span className="metric-panel-title">Air Quality (AQI)</span>
                  <span className="metric-panel-value">
                    {currentAQI !== undefined ? currentAQI : '--'}
                  </span>
                  <span className="metric-panel-subtext" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span 
                      style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        backgroundColor: getAQIInfo(currentAQI).color,
                        display: 'inline-block' 
                      }} 
                    />
                    Status: <span style={{ color: getAQIInfo(currentAQI).color, fontWeight: 600 }}>{getAQIInfo(currentAQI).text}</span>
                  </span>
                </div>
              </div>
            </div>

            <ForecastCard 
              weatherData={weatherData} 
              unit={unit} 
              selectedDayIndex={selectedDayIndex}
              setSelectedDayIndex={setSelectedDayIndex}
            />

            {}
            <div className="glass-panel map-card animate-fade-in stagger-4" style={{ height: '320px', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <Icons.Map size={20} style={{ color: 'var(--accent-color)' }} />
                  Location Map
                </h3>
                <button 
                  onClick={() => setIsMapMaximized(true)}
                  className="precise-location-btn"
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  title="Maximize Map"
                >
                  <Icons.Maximize2 size={14} />
                  Maximize
                </button>
              </div>
              
              <div className="map-card-container" onClick={() => setIsMapMaximized(true)}>
                <div className="map-click-overlay" />
                <MapPanel 
                  latitude={currentCity.latitude}
                  longitude={currentCity.longitude}
                  cityName={currentCity.name}
                  isMaximized={false}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {isMapMaximized && (
        <div className="map-modal-backdrop" onClick={() => setIsMapMaximized(false)}>
          <div className="glass-panel map-modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                <Icons.Map size={24} style={{ color: 'var(--accent-color)' }} />
                <span>{currentCity.name} Map View</span>
              </h3>
              <button 
                onClick={() => setIsMapMaximized(false)}
                className="map-modal-close-btn"
                title="Close Map"
              >
                <Icons.X size={20} />
              </button>
            </div>
            <div style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
              <MapPanel 
                latitude={currentCity.latitude}
                longitude={currentCity.longitude}
                cityName={currentCity.name}
                isMaximized={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

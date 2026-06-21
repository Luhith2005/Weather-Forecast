// Weather API service using Open-Meteo API (100% free, keyless)

/**
 * Searches for cities by name using Open-Meteo Geocoding API.
 * @param {string} query The city search query.
 * @returns {Promise<Array>} List of matched cities with coords and location metadata.
 */
export async function searchCities(query) {
  if (!query || query.trim().length < 2) return [];
  
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=25&language=en&format=json`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Geocoding API failed');
    const data = await response.json();
    const results = data.results || [];
    
    // Filter to only include cities/places in India
    return results
      .filter(city => 
        city.country_code?.toUpperCase() === 'IN' || 
        city.country?.toLowerCase() === 'india'
      )
      .slice(0, 5);
  } catch (error) {
    console.error('Error during geocoding search:', error);
    return [];
  }
}

/**
 * Fetches comprehensive weather metrics and daily forecast data.
 * @param {number} lat Latitude of location.
 * @param {number} lon Longitude of location.
 * @param {string} timezone Optional timezone (e.g. "Europe/London" or "auto").
 * @returns {Promise<object>} Current weather data and 5-day forecast.
 */
export async function fetchWeatherData(lat, lon, timezone = 'auto') {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=${encodeURIComponent(timezone)}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Weather API failed to retrieve data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

/**
 * Fetches current Air Quality Index and pollutant stats.
 * @param {number} lat Latitude of location.
 * @param {number} lon Longitude of location.
 * @returns {Promise<object|null>} AQI metadata.
 */
export async function fetchAirQuality(lat, lon) {
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Air Quality API failed');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching air quality:', error);
    return null;
  }
}

/**
 * Helper to get the correct weather details (label, description, icon name) based on WMO code.
 * @param {number} code WMO code.
 * @param {number|boolean} isDay Whether it is day time (1 or true) or night (0 or false).
 * @returns {object} { label, iconName }
 */
export function getWeatherConfig(code, isDay = 1) {
  const day = !!isDay;
  
  // WMO Weather interpretation codes
  // https://open-meteo.com/en/docs
  const mappings = {
    0: { label: 'Clear Sky', icon: day ? 'Sun' : 'Moon' },
    1: { label: 'Mainly Clear', icon: day ? 'CloudSun' : 'CloudMoon' },
    2: { label: 'Partly Cloudy', icon: day ? 'CloudSun' : 'CloudMoon' },
    3: { label: 'Overcast', icon: 'Cloud' },
    45: { label: 'Foggy', icon: 'CloudFog' },
    48: { label: 'Depositing Rime Fog', icon: 'CloudFog' },
    51: { label: 'Light Drizzle', icon: 'CloudDrizzle' },
    53: { label: 'Moderate Drizzle', icon: 'CloudDrizzle' },
    55: { label: 'Dense Drizzle', icon: 'CloudDrizzle' },
    56: { label: 'Light Freezing Drizzle', icon: 'CloudSnow' },
    57: { label: 'Dense Freezing Drizzle', icon: 'CloudSnow' },
    61: { label: 'Slight Rain', icon: 'CloudRain' },
    63: { label: 'Moderate Rain', icon: 'CloudRain' },
    65: { label: 'Heavy Rain', icon: 'CloudRain' },
    66: { label: 'Light Freezing Rain', icon: 'CloudSnow' },
    67: { label: 'Heavy Freezing Rain', icon: 'CloudSnow' },
    71: { label: 'Slight Snow Fall', icon: 'CloudSnow' },
    73: { label: 'Moderate Snow Fall', icon: 'CloudSnow' },
    75: { label: 'Heavy Snow Fall', icon: 'CloudSnow' },
    77: { label: 'Snow Grains', icon: 'CloudSnow' },
    80: { label: 'Slight Rain Showers', icon: 'CloudRainWind' },
    81: { label: 'Moderate Rain Showers', icon: 'CloudRainWind' },
    82: { label: 'Violent Rain Showers', icon: 'CloudRainWind' },
    85: { label: 'Slight Snow Showers', icon: 'CloudSnow' },
    86: { label: 'Heavy Snow Showers', icon: 'CloudSnow' },
    95: { label: 'Thunderstorm', icon: 'CloudLightning' },
    96: { label: 'Thunderstorm with Slight Hail', icon: 'CloudLightning' },
    99: { label: 'Thunderstorm with Heavy Hail', icon: 'CloudLightning' }
  };
  
  const config = mappings[code] || { label: 'Unknown Weather', icon: 'HelpCircle' };
  return { label: config.label, iconName: config.icon };
}

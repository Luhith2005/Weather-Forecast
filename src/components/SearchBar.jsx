import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { searchCities } from '../services/weatherApi';

export default function SearchBar({ onSelectCity, onSearchError, currentCityName, onGeolocate }) {
  const [query, setQuery] = useState(currentCityName || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (currentCityName) {
      setQuery(currentCityName);
    }
  }, [currentCityName]);

  useEffect(() => {
    if (query.trim().length < 2 || query === 'Current Location') {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      const results = await searchCities(query);
      setSuggestions(results);
      setShowDropdown(results.length > 0);
      setIsSearching(false);
    }, 450);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city) => {
    setQuery(city.name);
    setSuggestions([]);
    setShowDropdown(false);
    onSelectCity({
      name: city.name,
      latitude: city.latitude,
      longitude: city.longitude,
      country: city.country,
      country_code: city.country_code,
      admin1: city.admin1,
      timezone: city.timezone || 'auto'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || query === 'Current Location') return;

    setIsSearching(true);
    const results = await searchCities(query);
    setIsSearching(false);

    if (results && results.length > 0) {
      handleSelect(results[0]);
    } else {
      onSearchError(`City "${query}" not found. Please try another name.`);
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  return (
    <div className="search-container animate-fade-in" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="glass-panel search-form">
        <div className="search-input-wrapper">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search city (e.g. Hyderabad, London, Tokyo...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowDropdown(suggestions.length > 0)}
          />
        </div>
        
        <div className="search-actions">
          {isSearching && <Loader2 size={18} className="spinner" style={{ color: 'var(--text-muted)' }} />}
          
          <button
            type="button"
            onClick={onGeolocate}
            className="icon-btn"
            title="Use Current Location"
          >
            <MapPin size={20} />
          </button>
          
          <button type="submit" className="search-btn">
            Search
          </button>
        </div>
      </form>

      {showDropdown && (
        <div className="glass-panel autocomplete-dropdown animate-fade-in">
          {suggestions.map((city) => (
            <button
              key={city.id}
              onClick={() => handleSelect(city)}
              className="autocomplete-item"
            >
              <strong>{city.name}</strong>
              {city.admin1 && <span>, {city.admin1}</span>}
              {city.country && <span className="autocomplete-location-details">{city.country}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

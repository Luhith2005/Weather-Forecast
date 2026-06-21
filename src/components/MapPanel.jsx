import React, { useEffect, useRef, useState } from 'react';

export default function MapPanel({ latitude, longitude, cityName, isMaximized }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const activeTileLayerRef = useRef(null);
  
  const [mapType, setMapType] = useState('streets');

  // Define tile urls
  const tileProviders = {
    streets: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors'
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, USDA, USGS'
    },
    terrain: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Esri, FAO, NOAA'
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!window.L) {
      console.error('Leaflet script not found');
      return;
    }

    const L = window.L;

    // Create map instance
    const map = L.map(mapContainerRef.current, {
      zoomControl: false // keep it clean
    }).setView([latitude, longitude], 11);
    
    mapRef.current = map;

    // Create and add default tile layer
    const streetsLayer = L.tileLayer(tileProviders.streets.url, {
      attribution: tileProviders.streets.attribution,
      maxZoom: 19
    }).addTo(map);
    activeTileLayerRef.current = streetsLayer;

    // Create marker
    const marker = L.marker([latitude, longitude]).addTo(map);
    marker.bindPopup(`<b>${cityName}</b>`).openPopup();
    markerRef.current = marker;

    // Resize observer to handle container size changes dynamically
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update center when coords change
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([latitude, longitude], isMaximized ? 13 : 11);
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude]);
        markerRef.current.bindPopup(`<b>${cityName}</b>`).openPopup();
      }
    }
  }, [latitude, longitude, cityName, isMaximized]);

  // Update tile layer when mapType changes
  useEffect(() => {
    if (!mapRef.current || !window.L) return;
    
    const L = window.L;
    
    // Remove previous layer
    if (activeTileLayerRef.current) {
      mapRef.current.removeLayer(activeTileLayerRef.current);
    }

    // Add new layer
    const provider = tileProviders[mapType];
    const newLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      maxZoom: mapType === 'satellite' ? 18 : 19
    }).addTo(mapRef.current);
    
    activeTileLayerRef.current = newLayer;
  }, [mapType]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden' }}>
      {/* Map Element */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

      {/* Layer Toggle Bar Over Map */}
      <div className="map-view-controls">
        <button 
          className={`map-view-btn ${mapType === 'streets' ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation(); // Avoid maximizing on overlay click
            setMapType('streets');
          }}
        >
          Streets
        </button>
        <button 
          className={`map-view-btn ${mapType === 'satellite' ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setMapType('satellite');
          }}
        >
          Satellite
        </button>
        <button 
          className={`map-view-btn ${mapType === 'terrain' ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setMapType('terrain');
          }}
        >
          Terrain
        </button>
      </div>
    </div>
  );
}

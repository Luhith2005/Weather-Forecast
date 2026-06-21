# Skyline Weather Forecast Dashboard

![Skyline Weather Dashboard](screenshot.png)

A premium, interactive weather dashboard built in **React.js** and **Vite**, styled to match the exact aesthetics, layout, and behaviors of the **Google Search Weather** interface.

---

## 🌟 Key Features

### 📍 Precise India Search & Suggestions
- Autocomplete geocoding search suggestions **filtered exclusively to India** (country code `IN`).
- Fully supports searches for neighborhoods, towns, and cities across the country.

### 🕒 Timezone-Aware ticking clock
- Dynamic digital header clock displaying the ticking local time and formatted date (weekday, month, date) adjusted automatically to the searched city's native timezone.

### 🌡️ Current Conditions & Apparent Temperature
- Large weather header highlighting active temperature units (°C / °F toggle).
- Integrated **Feels-Like** apparent temperature alongside real-time humidity, wind speed, and precipitation levels.
- Horizontal hourly scrolling tabs for Temperature graph, Precipitation probability, and dynamic rotating wind vector arrows.

### 📅 7-Day Vertical Forecast & Dynamic Range Bar
- Vertical forecast deck embedded directly inside the bottom of the main **Weather Card**, stacked downwards to prevent horizontal screen overflow.
- Features a **Dynamic Temperature Range Bar** that scales and shifts the temperature slider dynamically relative to the overall weekly temperature range (minimum and maximum of all 7 days).
- Selecting any daily row updates the entire dashboard with that day's statistics, hourly chart, and averages.

### 🗺️ Interactive Maps (Streets, Satellite, Terrain)
- Integrated custom keyless Leaflet map widget inside both the dashboard and the fullscreen maximized modal.
- Supports instant switches between **Streets** (OSM standard), **Satellite** (Esri World Imagery), and **Terrain** (Esri Topo Map) tile sets.

### ☀️ Air Quality & UV Index (Single Column Stack)
- Stacks key weather indices vertically for a cleaner, responsive structure:
  - **Air Quality (AQI)**: Displays the current US AQI index alongside descriptive status ratings and color safety dots.
  - **UV Index**: Daily maximum UV index with risk severity ratings.
  - **Sunrise & Sunset**: Daily local sunrise/sunset clock times.

### ⭐ Saved Locations (Favorites) with Seeding
- Gold star button to save/remove active cities from your **Saved Locations** sidebar, persisted across reloads using `localStorage`.
- Pre-seeded on first load with **Hyderabad**, **Bangalore**, and **Chennai** to demonstrate instant storage persistence.

### 🎨 Dynamic Weather Background Gradients
- App background gradient changes smoothly based on the current weather condition of the selected day (Sunny, Rainy, Cloudy, Stormy, or Night) for both light and dark modes.

---

## 🛠️ Tech Stack & Architecture

- **Core**: React.js 19 + Vite + ES6+
- **Styling**: Vanilla CSS (no Tailwind/Bootstrap) powered by responsive Grid/Flexbox layouts and custom CSS theme variables.
- **Icons**: Lucide React
- **Maps**: Leaflet.js CDN (keyless tile resolution)
- **API Services**:
  - **Open-Meteo Forecast API**: Keyless, free global weather and daily indices.
  - **Open-Meteo Geocoding API**: Coords translation.
  - **OpenStreetMap Nominatim API**: Async reverse-geocoding coordinates to local neighborhood names.
  - **Open-Meteo Air Quality API**: US AQI indices.

---

## 🚀 Quick Start

### 1. Clone & Navigate
```bash
git clone https://github.com/Luhith2005/Weather-Forecast.git
cd Weather-Forecast
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Locally
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 4. Build Production Bundle
```bash
npm run build
```
The optimized bundle will be compiled to the local `dist/` directory.

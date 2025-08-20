import React, { useState, useEffect } from 'react';
import WeatherList from './components/WeatherList';
import SearchBar from './components/SearchBar';
import LoadingSpinner from './components/LoadingSpinner';
import { fetchWeatherCities, searchWeatherByCity } from './services/weatherService';
import './App.css';

function App() {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [temperatureUnit, setTemperatureUnit] = useState('celsius');

  // Load initial weather data for default cities
  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchWeatherCities();
      setWeatherData(data.cities);
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data');
      console.error('Error loading weather data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (cityName) => {
    try {
      setSearchLoading(true);
      setError(null);
      const cityWeather = await searchWeatherByCity(cityName);
      
      // Check if city already exists in the list
      const existingIndex = weatherData.findIndex(
        weather => weather.city.toLowerCase() === cityWeather.city.toLowerCase()
      );
      
      if (existingIndex !== -1) {
        // Update existing city data
        const updatedData = [...weatherData];
        updatedData[existingIndex] = cityWeather;
        setWeatherData(updatedData);
      } else {
        // Add new city to the list
        setWeatherData(prevData => [cityWeather, ...prevData]);
      }
    } catch (err) {
      setError(err.message || 'City not found');
      console.error('Error searching city:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRefresh = () => {
    loadWeatherData();
  };

  const toggleTemperatureUnit = () => {
    setTemperatureUnit(prev => prev === 'celsius' ? 'fahrenheit' : 'celsius');
  };

  const convertTemperature = (celsius) => {
    if (temperatureUnit === 'fahrenheit') {
      return Math.round((celsius * 9/5) + 32);
    }
    return celsius;
  };

  if (loading && weatherData.length === 0) {
    return (
      <div className="app">
        <div className="container">
          <LoadingSpinner message="Loading weather data..." />
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <header className="app-header">
          <h1 className="app-title">🌤️ Weather Dashboard</h1>
          <p className="app-subtitle">Get real-time weather updates for cities worldwide</p>
        </header>

        {/* Controls */}
        <div className="controls">
          <SearchBar 
            onSearch={handleSearch} 
            loading={searchLoading}
          />
          <div className="control-buttons">
            <button 
              onClick={toggleTemperatureUnit}
              className="unit-toggle-btn"
              title={`Switch to ${temperatureUnit === 'celsius' ? 'Fahrenheit' : 'Celsius'}`}
            >
              °{temperatureUnit === 'celsius' ? 'C' : 'F'}
            </button>
            <button 
              onClick={handleRefresh}
              className="refresh-btn"
              disabled={loading}
              title="Refresh weather data"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="close-error">×</button>
          </div>
        )}

        {/* Loading Indicator for Search */}
        {searchLoading && (
          <div className="search-loading">
            <LoadingSpinner message="Searching city..." size="small" />
          </div>
        )}

        {/* Weather Data */}
        <WeatherList 
          weatherData={weatherData}
          temperatureUnit={temperatureUnit}
          convertTemperature={convertTemperature}
          loading={loading}
        />

        {/* Footer */}
        <footer className="app-footer">
          <p>Weather data provided by <a href="https://openweathermap.org" target="_blank" rel="noopener noreferrer">OpenWeatherMap</a></p>
          <p>Built with React.js & Node.js @prajudeveloper.com</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
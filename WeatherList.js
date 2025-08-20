

import React from 'react';
import WeatherCard from './WeatherCard';
import LoadingSpinner from './LoadingSpinner';

const WeatherList = ({ weatherData, temperatureUnit, convertTemperature, loading }) => {
  if (loading && weatherData.length === 0) {
    return <LoadingSpinner message="Loading weather data..." />;
  }

  if (!weatherData || weatherData.length === 0) {
    return (
      <div className="empty-state">
        <h3>No Weather Data Available</h3>
        <p>Try searching for a city or refresh the page</p>
      </div>
    );
  }

  return (
    <div className="weather-list">
      {weatherData.map((weather, index) => (
        <WeatherCard
          key={`${weather.id}-${index}`}
          weather={weather}
          temperatureUnit={temperatureUnit}
          convertTemperature={convertTemperature}
        />
      ))}
    </div>
  );
};

export default WeatherList;
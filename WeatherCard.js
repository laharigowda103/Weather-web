

import React from 'react';

const WeatherCard = ({ weather, temperatureUnit, convertTemperature }) => {
  const {
    city,
    country,
    temperature,
    description,
    icon,
    humidity,
    windSpeed,
    feelsLike,
    pressure,
    visibility
  } = weather;

  const displayTemp = convertTemperature(temperature);
  const displayFeelsLike = convertTemperature(feelsLike);
  const tempUnit = temperatureUnit === 'celsius' ? '°C' : '°F';

  return (
    <div className="weather-card">
      <div className="card-header">
        <div className="city-info">
          <h3>{city}</h3>
          <p>{country}</p>
        </div>
        <img
          src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
          alt={description}
          className="weather-icon"
        />
      </div>
      
      <div className="temperature">
        {displayTemp}{tempUnit}
      </div>
      
      <div className="description">
        {description}
      </div>
      
      <div className="weather-details">
        <div className="detail-item">
          <span>Feels like</span>
          <span>{displayFeelsLike}{tempUnit}</span>
        </div>
        <div className="detail-item">
          <span>Humidity</span>
          <span>{humidity}%</span>
        </div>
        <div className="detail-item">
          <span>Wind Speed</span>
          <span>{windSpeed} m/s</span>
        </div>
        <div className="detail-item">
          <span>Pressure</span>
          <span>{pressure} hPa</span>
        </div>
        {visibility && (
          <div className="detail-item">
            <span>Visibility</span>
            <span>{visibility} km</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherCard;
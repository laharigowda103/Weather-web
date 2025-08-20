const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const API_KEY = process.env.OPENWEATHER_API_KEY;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API key validation middleware
const validateApiKey = (req, res, next) => {
  if (!API_KEY) {
    console.error('OPENWEATHER_API_KEY not found in environment variables');
    return res.status(500).json({ 
      error: 'Server configuration error',
      message: 'API key not configured. Please add OPENWEATHER_API_KEY to .env file',
      details: 'Contact administrator'
    });
  }
  next();
};

// Default cities to display
const defaultCities = [
  'London',
  'New York',
  'Tokyo',
  'Sydney',
  'Mumbai',
  'Paris',
  'Dubai',
  'Singapore'
];

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Weather API server is running',
    timestamp: new Date().toISOString(),
    apiKeyConfigured: !!API_KEY
  });
});

// Get weather for default cities
app.get('/api/weather/cities', validateApiKey, async (req, res) => {
  try {
    console.log('Fetching weather for default cities...');
    
    const weatherPromises = defaultCities.map(async (city) => {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`,
          { timeout: 10000 }
        );
        return response.data;
      } catch (error) {
        console.error(`Error fetching ${city}:`, error.response?.data?.message || error.message);
        return null;
      }
    });

    const weatherResponses = await Promise.all(weatherPromises);
    
    const weatherData = weatherResponses
      .filter(data => data !== null)
      .map(data => ({
        id: data.id,
        city: data.name,
        country: data.sys.country,
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        feelsLike: Math.round(data.main.feels_like),
        pressure: data.main.pressure,
        visibility: data.visibility ? Math.round(data.visibility / 1000) : null,
        coordinates: {
          lat: data.coord.lat,
          lon: data.coord.lon
        }
      }));

    console.log(`Successfully fetched weather for ${weatherData.length} cities`);
    res.json({ cities: weatherData });

  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch weather data',
      message: 'Unable to retrieve weather information',
      details: error.response?.data?.message || error.message
    });
  }
});

// Search weather by city name
app.get('/api/weather/search/:city', validateApiKey, async (req, res) => {
  try {
    const { city } = req.params;
    
    if (!city || city.trim() === '') {
      return res.status(400).json({ 
        error: 'Invalid city name',
        message: 'City name is required and cannot be empty'
      });
    }

    const trimmedCity = city.trim();
    console.log(`🔍 Searching weather for: ${trimmedCity}`);

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(trimmedCity)}&appid=${API_KEY}&units=metric`,
      { 
        timeout: 10000,
        headers: {
          'User-Agent': 'WeatherApp/1.0'
        }
      }
    );

    const data = response.data;
    const weatherData = {
      id: data.id,
      city: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      feelsLike: Math.round(data.main.feels_like),
      pressure: data.main.pressure,
      visibility: data.visibility ? Math.round(data.visibility / 1000) : null,
      coordinates: {
        lat: data.coord.lat,
        lon: data.coord.lon
      }
    };

    console.log(`Successfully found weather for: ${weatherData.city}, ${weatherData.country}`);
    res.json(weatherData);

  } catch (error) {
    console.error('Error searching weather:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({ 
        error: 'Request timeout',
        message: 'The weather service is taking too long to respond. Please try again.'
      });
    }
    
    if (error.response) {
      const status = error.response.status;
      const apiError = error.response.data;
      
      if (status === 404) {
        return res.status(404).json({ 
          error: 'City not found',
          message: `Could not find weather data for "${req.params.city}". Please check the spelling and try again.`,
          suggestions: 'Try using the full city name or include country (e.g., "Paris, France")'
        });
      }
      
      if (status === 401) {
        return res.status(500).json({ 
          error: 'API authentication failed',
          message: 'Invalid API key. Please contact administrator.'
        });
      }
      
      if (status === 429) {
        return res.status(429).json({ 
          error: 'Too many requests',
          message: 'API rate limit exceeded. Please try again later.'
        });
      }
      
      return res.status(500).json({ 
        error: 'Weather service error',
        message: apiError.message || 'Failed to fetch weather data',
        details: `API returned ${status} status`
      });
    }
    
    // Network or other errors
    res.status(500).json({ 
      error: 'Network error',
      message: 'Unable to connect to weather service. Please check your internet connection and try again.',
      details: error.code || error.message
    });
  }
});

// Get 5-day forecast
app.get('/api/weather/forecast/:city', validateApiKey, async (req, res) => {
  try {
    const { city } = req.params;
    
    if (!city || city.trim() === '') {
      return res.status(400).json({ 
        error: 'Invalid city name',
        message: 'City name is required'
      });
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city.trim())}&appid=${API_KEY}&units=metric`,
      { timeout: 10000 }
    );

    const forecastData = response.data.list.slice(0, 8).map(item => ({
      date: item.dt_txt,
      temperature: Math.round(item.main.temp),
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      humidity: item.main.humidity,
      windSpeed: item.wind.speed
    }));

    res.json({
      city: response.data.city.name,
      country: response.data.city.country,
      forecast: forecastData
    });
  } catch (error) {
    console.error('Error fetching forecast:', error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({ 
        error: 'City not found',
        message: 'Unable to find forecast for this city'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch forecast data',
      message: 'Unable to retrieve weather forecast',
      details: error.response?.data?.message || error.message
    });
  }
});

// Default route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Weather App API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      cities: '/api/weather/cities',
      search: '/api/weather/search/:city',
      forecast: '/api/weather/forecast/:city'
    },
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    message: `The endpoint ${req.originalUrl} does not exist`,
    availableEndpoints: ['/api/health', '/api/weather/cities', '/api/weather/search/:city']
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: 'Something went wrong on the server',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('\nWeather API Server Started');
  console.log(` Server running on: http://localhost:${PORT}`);
  console.log(`CORS enabled for: http://localhost:3000`);
  console.log(`Started at: ${new Date().toISOString()}`);
  
  if (!API_KEY) {
    console.log('\nWARNING: OpenWeatherMap API key not found!');
    console.log('Please create a .env file with: OPENWEATHER_API_KEY=your_key_here');
    console.log('Get your free API key at: https://openweathermap.org/api\n');
  } else {
    console.log('OpenWeatherMap API key loaded successfully\n');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log(' SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('💤 Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('\n SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log(' Process terminated');
  });
});
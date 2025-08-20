

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.com/api' 
  : 'http://localhost:5000/api';

// Enhanced error handling
const handleApiError = async (response) => {
  let errorData;
  try {
    errorData = await response.json();
  } catch {
    errorData = { error: 'Unknown error', message: `HTTP ${response.status}` };
  }
  
  throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
};

// Fetch weather data for default cities
export const fetchWeatherCities = async () => {
  try {
    console.log('🌍 Fetching weather for default cities...');
    
    const response = await fetch(`${API_BASE_URL}/weather/cities`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(15000) // 15 second timeout
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    const data = await response.json();
    console.log(`Successfully fetched ${data.cities?.length || 0} cities`);
    return data;
  } catch (error) {
    console.error('Error fetching weather cities:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your internet connection.');
    }
    
    if (error.message.includes('fetch')) {
      throw new Error('Unable to connect to weather service. Please make sure the backend server is running.');
    }
    
    throw new Error(error.message || 'Failed to fetch weather data');
  }
};

// Search weather by city name
export const searchWeatherByCity = async (cityName) => {
  try {
    if (!cityName || typeof cityName !== 'string' || cityName.trim() === '') {
      throw new Error('City name is required');
    }

    const trimmedCity = cityName.trim();
    console.log(`🔍 Searching weather for: "${trimmedCity}"`);
    
    const response = await fetch(`${API_BASE_URL}/weather/search/${encodeURIComponent(trimmedCity)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(15000) // 15 second timeout
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    const data = await response.json();
    console.log(`Successfully found weather for: ${data.city}, ${data.country}`);
    return data;
  } catch (error) {
    console.error('Error searching weather:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Search timed out. Please try again.');
    }
    
    if (error.message.includes('fetch')) {
      throw new Error('Unable to connect to weather service. Please check if the backend server is running on port 5000.');
    }
    
    throw new Error(error.message || 'Failed to search city weather');
  }
};

// Fetch 5-day forecast for a city
export const fetchWeatherForecast = async (cityName) => {
  try {
    if (!cityName || typeof cityName !== 'string' || cityName.trim() === '') {
      throw new Error('City name is required');
    }

    const trimmedCity = cityName.trim();
    console.log(`📊 Fetching forecast for: "${trimmedCity}"`);
    
    const response = await fetch(`${API_BASE_URL}/weather/forecast/${encodeURIComponent(trimmedCity)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(15000)
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    const data = await response.json();
    console.log(`Successfully fetched forecast for: ${data.city}`);
    return data;
  } catch (error) {
    console.error('Error fetching forecast:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Forecast request timed out. Please try again.');
    }
    
    if (error.message.includes('fetch')) {
      throw new Error('Unable to connect to weather service. Please check if the backend server is running.');
    }
    
    throw new Error(error.message || 'Failed to fetch weather forecast');
  }
};

// Health check
export const checkAPIHealth = async () => {
  try {
    console.log('🔍 Checking API health...');
    
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API health check passed');
    return data;
  } catch (error) {
    console.error('API health check failed:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Health check timed out');
    }
    
    if (error.message.includes('fetch')) {
      throw new Error('Backend server is not running. Please start the server on port 5000.');
    }
    
    throw new Error(error.message || 'Failed to check API health');
  }
};

// Test function to verify connection
export const testConnection = async () => {
  try {
    await checkAPIHealth();
    return { success: true, message: 'Connection successful' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
import { WeatherResponse, ForecastResponse, LocationSearchResponse, DailyForecast } from '../types';
import { logger } from '../utils/logger';
import { cacheService } from './cache.service';

export class WeatherService {
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5';
  private readonly geoUrl = 'https://api.openweathermap.org/geo/1.0';
  
  // Mock API key for demo purposes
  private readonly apiKey = 'demo_api_key';

  async getCurrentWeather(location: string): Promise<WeatherResponse> {
    const cacheKey = `weather:current:${location.toLowerCase()}`;
    
    // Try to get from cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      logger.info(`Cache hit for current weather: ${location}`);
      return JSON.parse(cached);
    }

    try {
      // For demo purposes, we'll return mock data instead of making actual API calls
      const mockWeatherData = this.generateMockWeatherData(location);
      
      // Cache the result
      await cacheService.set(cacheKey, JSON.stringify(mockWeatherData), 300); // 5 minutes
      
      logger.info(`Fetched current weather for: ${location}`);
      return mockWeatherData;
    } catch (error) {
      logger.error(`Failed to fetch current weather for ${location}:`, error);
      throw new Error('Failed to fetch weather data');
    }
  }

  async getForecast(location: string, days: number): Promise<ForecastResponse> {
    const cacheKey = `weather:forecast:${location.toLowerCase()}:${days}`;
    
    // Try to get from cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      logger.info(`Cache hit for forecast: ${location}, ${days} days`);
      return JSON.parse(cached);
    }

    try {
      // For demo purposes, we'll return mock data
      const mockForecastData = this.generateMockForecastData(location, days);
      
      // Cache the result
      await cacheService.set(cacheKey, JSON.stringify(mockForecastData), 600); // 10 minutes
      
      logger.info(`Fetched forecast for: ${location}, ${days} days`);
      return mockForecastData;
    } catch (error) {
      logger.error(`Failed to fetch forecast for ${location}:`, error);
      throw new Error('Failed to fetch forecast data');
    }
  }

  async searchLocations(query: string): Promise<LocationSearchResponse> {
    const cacheKey = `locations:search:${query.toLowerCase()}`;
    
    // Try to get from cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      logger.info(`Cache hit for location search: ${query}`);
      return JSON.parse(cached);
    }

    try {
      // For demo purposes, we'll return mock data
      const mockLocationData = this.generateMockLocationData(query);
      
      // Cache the result
      await cacheService.set(cacheKey, JSON.stringify(mockLocationData), 1800); // 30 minutes
      
      logger.info(`Searched locations for: ${query}`);
      return mockLocationData;
    } catch (error) {
      logger.error(`Failed to search locations for ${query}:`, error);
      throw new Error('Failed to search locations');
    }
  }

  private generateMockWeatherData(location: string): WeatherResponse {
    const temperatures = [15, 18, 22, 25, 28, 20, 16];
    const descriptions = ['Clear sky', 'Partly cloudy', 'Cloudy', 'Light rain', 'Sunny'];
    
    return {
      location,
      temperature: temperatures[Math.floor(Math.random() * temperatures.length)],
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      humidity: Math.floor(Math.random() * 40) + 30, // 30-70%
      windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
      pressure: Math.floor(Math.random() * 50) + 1000, // 1000-1050 hPa
      visibility: Math.floor(Math.random() * 5) + 5, // 5-10 km
      uvIndex: Math.floor(Math.random() * 10) + 1, // 1-10
      timestamp: new Date().toISOString(),
    };
  }

  private generateMockForecastData(location: string, days: number): ForecastResponse {
    const forecast: DailyForecast[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        high: Math.floor(Math.random() * 15) + 20, // 20-35°C
        low: Math.floor(Math.random() * 10) + 10, // 10-20°C
        description: ['Sunny', 'Partly cloudy', 'Cloudy', 'Rainy', 'Clear'][Math.floor(Math.random() * 5)],
        humidity: Math.floor(Math.random() * 40) + 30, // 30-70%
        windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
        precipitationChance: Math.floor(Math.random() * 100), // 0-100%
      });
    }

    return {
      location,
      forecast,
    };
  }

  private generateMockLocationData(query: string): LocationSearchResponse {
    const mockLocations = [
      { name: 'New York', region: 'New York', country: 'United States', lat: 40.7128, lon: -74.0060 },
      { name: 'London', region: 'England', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
      { name: 'Paris', region: 'Île-de-France', country: 'France', lat: 48.8566, lon: 2.3522 },
      { name: 'Tokyo', region: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
      { name: 'Sydney', region: 'New South Wales', country: 'Australia', lat: -33.8688, lon: 151.2093 },
    ];

    // Filter locations based on query (case-insensitive)
    const filteredLocations = mockLocations.filter(loc =>
      loc.name.toLowerCase().includes(query.toLowerCase()) ||
      loc.country.toLowerCase().includes(query.toLowerCase())
    );

    return {
      locations: filteredLocations.slice(0, 5), // Return max 5 results
    };
  }

  // Health check method
  async isHealthy(): Promise<boolean> {
    // In a real implementation, this would ping the actual weather API
    return Promise.resolve(true);
  }
}
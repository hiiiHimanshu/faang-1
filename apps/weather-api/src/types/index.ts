export interface WeatherResponse {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  timestamp: string;
}

export interface ForecastResponse {
  location: string;
  forecast: DailyForecast[];
}

export interface DailyForecast {
  date: string;
  high: number;
  low: number;
  description: string;
  humidity: number;
  windSpeed: number;
  precipitationChance: number;
}

export interface LocationSearchResponse {
  locations: Location[];
}

export interface Location {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    redis: boolean;
    weatherApi: boolean;
  };
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}
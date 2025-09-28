import swaggerJsdoc from 'swagger-jsdoc';
import { config } from '../config';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Weather API',
      version: config.app.version,
      description: 'RESTful Weather API service that aggregates weather data from multiple sources',
      contact: {
        name: 'Weather API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.app.port}`,
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        WeatherResponse: {
          type: 'object',
          properties: {
            location: { type: 'string', example: 'London' },
            temperature: { type: 'number', example: 22 },
            description: { type: 'string', example: 'Partly cloudy' },
            humidity: { type: 'number', example: 65 },
            windSpeed: { type: 'number', example: 15 },
            pressure: { type: 'number', example: 1013 },
            visibility: { type: 'number', example: 10 },
            uvIndex: { type: 'number', example: 5 },
            timestamp: { type: 'string', format: 'date-time' },
          },
          required: ['location', 'temperature', 'description', 'humidity', 'windSpeed', 'pressure', 'visibility', 'uvIndex', 'timestamp'],
        },
        ForecastResponse: {
          type: 'object',
          properties: {
            location: { type: 'string', example: 'London' },
            forecast: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: { type: 'string', format: 'date', example: '2024-01-15' },
                  high: { type: 'number', example: 25 },
                  low: { type: 'number', example: 15 },
                  description: { type: 'string', example: 'Sunny' },
                  humidity: { type: 'number', example: 60 },
                  windSpeed: { type: 'number', example: 12 },
                  precipitationChance: { type: 'number', example: 20 },
                },
              },
            },
          },
          required: ['location', 'forecast'],
        },
        LocationSearchResponse: {
          type: 'object',
          properties: {
            locations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'London' },
                  region: { type: 'string', example: 'England' },
                  country: { type: 'string', example: 'United Kingdom' },
                  lat: { type: 'number', example: 51.5074 },
                  lon: { type: 'number', example: -0.1278 },
                },
              },
            },
          },
          required: ['locations'],
        },
        HealthCheckResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['healthy', 'unhealthy'] },
            timestamp: { type: 'string', format: 'date-time' },
            version: { type: 'string', example: '1.0.0' },
            uptime: { type: 'number', example: 3600 },
            services: {
              type: 'object',
              properties: {
                redis: { type: 'boolean' },
                weatherApi: { type: 'boolean' },
              },
            },
          },
          required: ['status', 'timestamp', 'version', 'uptime', 'services'],
        },
        ApiError: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Validation Error' },
            message: { type: 'string', example: 'Location is required' },
            statusCode: { type: 'number', example: 400 },
            timestamp: { type: 'string', format: 'date-time' },
          },
          required: ['error', 'message', 'statusCode', 'timestamp'],
        },
      },
    },
    tags: [
      {
        name: 'Weather',
        description: 'Weather data operations',
      },
      {
        name: 'Locations',
        description: 'Location search operations',
      },
      {
        name: 'Health',
        description: 'Health check operations',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API files
};

export const swaggerSpec = swaggerJsdoc(options);
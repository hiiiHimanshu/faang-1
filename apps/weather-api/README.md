# Weather API

RESTful Weather API service that aggregates weather data from multiple sources. Built with Express.js, TypeScript, Redis caching, and comprehensive documentation.

## Features

- **RESTful API Design** - Clean, intuitive API endpoints following REST principles
- **TypeScript** - Full type safety and better developer experience
- **Redis Caching** - Response caching with TTL for improved performance
- **Rate Limiting** - Protect against API abuse with configurable rate limits
- **Request Validation** - Input validation using Joi schema validation
- **Comprehensive Logging** - Structured logging with Winston
- **Health Monitoring** - Health check endpoint for service monitoring
- **API Documentation** - Auto-generated Swagger/OpenAPI documentation
- **Error Handling** - Centralized error handling with meaningful error responses
- **Security** - Helmet.js for security headers, CORS configuration

## API Endpoints

### Weather Endpoints
- `GET /api/v1/weather/current?location={city}` - Get current weather data
- `GET /api/v1/weather/forecast?location={city}&days={n}` - Get weather forecast (1-14 days)

### Location Endpoints  
- `GET /api/v1/locations/search?q={query}` - Search for locations

### System Endpoints
- `GET /api/v1/health` - Health check endpoint
- `GET /` - API information and endpoint listing
- `GET /api-docs` - Interactive API documentation

## Getting Started

### Prerequisites

- Node.js 18+ 
- Redis (optional, API works without Redis but caching will be disabled)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   
   # Redis Configuration (optional)
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   
   # Cache TTL (seconds)
   CACHE_TTL=300
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=60000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

3. **Development**
   ```bash
   npm run dev
   ```
   
4. **Production Build**
   ```bash
   npm run build
   npm start
   ```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode  
npm run test:watch
```

### Linting

```bash
# Check code quality
npm run lint

# Fix linting issues
npm run lint:fix
```

## Usage Examples

### Current Weather
```bash
curl "http://localhost:5000/api/v1/weather/current?location=London"
```

Response:
```json
{
  "location": "London",
  "temperature": 22,
  "description": "Partly cloudy",
  "humidity": 65,
  "windSpeed": 15,
  "pressure": 1013,
  "visibility": 10,
  "uvIndex": 5,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Weather Forecast
```bash
curl "http://localhost:5000/api/v1/weather/forecast?location=London&days=5"
```

Response:
```json
{
  "location": "London",
  "forecast": [
    {
      "date": "2024-01-15",
      "high": 25,
      "low": 15,
      "description": "Sunny",
      "humidity": 60,
      "windSpeed": 12,
      "precipitationChance": 20
    }
  ]
}
```

### Location Search
```bash
curl "http://localhost:5000/api/v1/locations/search?q=London"
```

Response:
```json
{
  "locations": [
    {
      "name": "London",
      "region": "England", 
      "country": "United Kingdom",
      "lat": 51.5074,
      "lon": -0.1278
    }
  ]
}
```

### Health Check
```bash
curl "http://localhost:5000/api/v1/health"
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "uptime": 3600,
  "services": {
    "redis": true,
    "weatherApi": true
  }
}
```

## Architecture

### Project Structure
```
src/
├── config/          # Configuration files
├── middleware/      # Express middleware
├── routes/          # API route handlers  
├── services/        # Business logic services
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── __tests__/       # Test files
```

### Key Components

- **WeatherService** - Core service for fetching weather data (currently uses mock data)
- **CacheService** - Redis-based caching service with TTL support
- **Validation Middleware** - Request parameter validation using Joi
- **Rate Limiting** - Express rate limiting middleware
- **Error Handling** - Centralized error handling and logging
- **Swagger Documentation** - Auto-generated API documentation

## Configuration

All configuration is managed through environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `CACHE_TTL` | Cache TTL in seconds | `300` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `60000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `LOG_LEVEL` | Logging level | `info` |

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Validation Error",
  "message": "Location is required", 
  "statusCode": 400,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

Common status codes:
- `400` - Validation errors
- `404` - Resource not found  
- `429` - Rate limit exceeded
- `500` - Internal server error
- `503` - Service unavailable

## Performance Features

- **Redis Caching** - Responses cached with configurable TTL
- **Compression** - Response compression using gzip
- **Rate Limiting** - Prevents API abuse
- **Request Validation** - Input validation to prevent unnecessary processing
- **Graceful Shutdown** - Proper cleanup on shutdown signals

## Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing configuration  
- **Rate Limiting** - DDoS protection
- **Input Validation** - Prevents injection attacks
- **Error Handling** - Prevents information leakage

## Monitoring & Observability

- **Health Checks** - Service health monitoring
- **Structured Logging** - JSON formatted logs with correlation IDs
- **Metrics** - Request/response times, error rates
- **Swagger Documentation** - Interactive API documentation

## Future Enhancements

- [ ] Integration with real weather APIs (OpenWeatherMap, WeatherAPI.com)
- [ ] Authentication and API keys
- [ ] Metrics and monitoring dashboard  
- [ ] Database persistence for historical data
- [ ] WebSocket support for real-time updates
- [ ] Docker containerization
- [ ] Kubernetes deployment manifests
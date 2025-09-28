import request from 'supertest';
import { WeatherApiServer } from '../server';

describe('Weather API', () => {
  let app: any;
  let server: WeatherApiServer;

  beforeAll(async () => {
    server = new WeatherApiServer();
    app = server.getApp();
  });

  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Weather API Server');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('GET /api/v1/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/v1/health');

      // Accept both 200 and 503 status codes since Redis may not be available in tests
      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('services');
    });
  });

  describe('GET /api/v1/weather/current', () => {
    it('should return current weather for valid location', async () => {
      const response = await request(app)
        .get('/api/v1/weather/current?location=London')
        .expect(200);

      expect(response.body).toHaveProperty('location');
      expect(response.body).toHaveProperty('temperature');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('humidity');
      expect(response.body).toHaveProperty('windSpeed');
      expect(response.body).toHaveProperty('pressure');
      expect(response.body).toHaveProperty('visibility');
      expect(response.body).toHaveProperty('uvIndex');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return 400 for missing location parameter', async () => {
      const response = await request(app)
        .get('/api/v1/weather/current')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
      expect(response.body).toHaveProperty('statusCode', 400);
    });

    it('should return 400 for empty location parameter', async () => {
      const response = await request(app)
        .get('/api/v1/weather/current?location=')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
      expect(response.body).toHaveProperty('statusCode', 400);
    });
  });

  describe('GET /api/v1/weather/forecast', () => {
    it('should return forecast for valid location', async () => {
      const response = await request(app)
        .get('/api/v1/weather/forecast?location=London&days=5')
        .expect(200);

      expect(response.body).toHaveProperty('location');
      expect(response.body).toHaveProperty('forecast');
      expect(Array.isArray(response.body.forecast)).toBe(true);
      expect(response.body.forecast).toHaveLength(5);
    });

    it('should use default days when not provided', async () => {
      const response = await request(app)
        .get('/api/v1/weather/forecast?location=London')
        .expect(200);

      expect(response.body).toHaveProperty('location');
      expect(response.body).toHaveProperty('forecast');
      expect(Array.isArray(response.body.forecast)).toBe(true);
    });

    it('should return 400 for invalid days parameter', async () => {
      const response = await request(app)
        .get('/api/v1/weather/forecast?location=London&days=20')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
      expect(response.body).toHaveProperty('statusCode', 400);
    });
  });

  describe('GET /api/v1/locations/search', () => {
    it('should return locations for valid search query', async () => {
      const response = await request(app)
        .get('/api/v1/locations/search?q=London')
        .expect(200);

      expect(response.body).toHaveProperty('locations');
      expect(Array.isArray(response.body.locations)).toBe(true);
    });

    it('should return 400 for missing query parameter', async () => {
      const response = await request(app)
        .get('/api/v1/locations/search')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
      expect(response.body).toHaveProperty('statusCode', 400);
    });
  });

  describe('GET /nonexistent', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not Found');
      expect(response.body).toHaveProperty('statusCode', 404);
    });
  });
});
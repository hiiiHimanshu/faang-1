import { Router, Request, Response } from 'express';
import { HealthCheckResponse } from '../types';
import { cacheService } from '../services/cache.service';
import { WeatherService } from '../services/weather.service';
import { config } from '../config';
import { logger } from '../utils/logger';

const router = Router();
const weatherService = new WeatherService();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [healthy, unhealthy]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                 uptime:
 *                   type: number
 *                 services:
 *                   type: object
 *                   properties:
 *                     redis:
 *                       type: boolean
 *                     weatherApi:
 *                       type: boolean
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const redisHealthy = cacheService.isHealthy();
    const weatherApiHealthy = await weatherService.isHealthy();
    
    const isHealthy = redisHealthy && weatherApiHealthy;
    
    const healthCheck: HealthCheckResponse = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: config.app.version,
      uptime: process.uptime(),
      services: {
        redis: redisHealthy,
        weatherApi: weatherApiHealthy,
      },
    };

    if (!isHealthy) {
      logger.warn('Health check failed', healthCheck);
      res.status(503).json(healthCheck);
    } else {
      logger.info('Health check passed');
      res.status(200).json(healthCheck);
    }
  } catch (error) {
    logger.error('Health check error:', error);
    const healthCheck: HealthCheckResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: config.app.version,
      uptime: process.uptime(),
      services: {
        redis: false,
        weatherApi: false,
      },
    };
    res.status(503).json(healthCheck);
  }
});

export default router;
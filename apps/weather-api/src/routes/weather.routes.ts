import { Router, Request, Response } from 'express';
import { WeatherService } from '../services/weather.service';
import { validateWeatherQuery } from '../middleware/validation.middleware';
import { logger } from '../utils/logger';

const router = Router();
const weatherService = new WeatherService();

/**
 * @swagger
 * /weather/current:
 *   get:
 *     summary: Get current weather for a location
 *     tags: [Weather]
 *     parameters:
 *       - in: query
 *         name: location
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         description: City name or location
 *         example: "London"
 *     responses:
 *       200:
 *         description: Current weather data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 location:
 *                   type: string
 *                 temperature:
 *                   type: number
 *                 description:
 *                   type: string
 *                 humidity:
 *                   type: number
 *                 windSpeed:
 *                   type: number
 *                 pressure:
 *                   type: number
 *                 visibility:
 *                   type: number
 *                 uvIndex:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Validation error
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Internal server error
 */
router.get('/current', validateWeatherQuery, async (req: Request, res: Response) => {
  try {
    const location = req.query.location as string;
    const weatherData = await weatherService.getCurrentWeather(location);
    res.json(weatherData);
  } catch (error) {
    logger.error('Error getting current weather:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch current weather data',
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
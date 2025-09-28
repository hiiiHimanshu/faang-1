import { Router, Request, Response } from 'express';
import { WeatherService } from '../services/weather.service';
import { validateForecastQuery } from '../middleware/validation.middleware';
import { logger } from '../utils/logger';

const router = Router();
const weatherService = new WeatherService();

/**
 * @swagger
 * /weather/forecast:
 *   get:
 *     summary: Get weather forecast for a location
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
 *       - in: query
 *         name: days
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 14
 *           default: 5
 *         description: Number of forecast days
 *         example: 7
 *     responses:
 *       200:
 *         description: Weather forecast data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 location:
 *                   type: string
 *                 forecast:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       high:
 *                         type: number
 *                       low:
 *                         type: number
 *                       description:
 *                         type: string
 *                       humidity:
 *                         type: number
 *                       windSpeed:
 *                         type: number
 *                       precipitationChance:
 *                         type: number
 *       400:
 *         description: Validation error
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Internal server error
 */
router.get('/forecast', validateForecastQuery, async (req: Request, res: Response) => {
  try {
    const location = req.query.location as string;
    const daysParam = req.query.days as string;
    const days = daysParam ? parseInt(daysParam, 10) : 5;
    const forecastData = await weatherService.getForecast(location, days);
    res.json(forecastData);
  } catch (error) {
    logger.error('Error getting forecast:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch forecast data',
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
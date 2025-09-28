import { Router, Request, Response } from 'express';
import { WeatherService } from '../services/weather.service';
import { validateLocationSearchQuery } from '../middleware/validation.middleware';
import { logger } from '../utils/logger';

const router = Router();
const weatherService = new WeatherService();

/**
 * @swagger
 * /locations/search:
 *   get:
 *     summary: Search for locations
 *     tags: [Locations]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         description: Search query for location
 *         example: "London"
 *     responses:
 *       200:
 *         description: List of matching locations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 locations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       region:
 *                         type: string
 *                       country:
 *                         type: string
 *                       lat:
 *                         type: number
 *                       lon:
 *                         type: number
 *       400:
 *         description: Validation error
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Internal server error
 */
router.get('/search', validateLocationSearchQuery, async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    const locations = await weatherService.searchLocations(q);
    res.json(locations);
  } catch (error) {
    logger.error('Error searching locations:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to search locations',
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
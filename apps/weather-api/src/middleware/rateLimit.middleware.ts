import rateLimit from 'express-rate-limit';
import { config } from '../config';
import { logger } from '../utils/logger';

export const rateLimitMiddleware = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    error: 'Too Many Requests',
    message: 'Rate limit exceeded. Try again later.',
    statusCode: 429,
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
      ip: req.ip,
      url: req.url,
      method: req.method,
    });
    
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Try again later.',
      statusCode: 429,
      timestamp: new Date().toISOString(),
    });
  },
});
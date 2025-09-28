import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types';
import { logger } from '../utils/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  logger.error('Error caught by middleware:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Default error response
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Handle specific error types
  if (error.message.includes('validation')) {
    statusCode = 400;
    message = 'Validation Error';
  } else if (error.message.includes('not found')) {
    statusCode = 404;
    message = 'Not Found';
  } else if (error.message.includes('unauthorized')) {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (error.message.includes('rate limit')) {
    statusCode = 429;
    message = 'Too Many Requests';
  }

  const apiError: ApiError = {
    error: error.name || 'Error',
    message: error.message || message,
    statusCode,
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(apiError);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  const apiError: ApiError = {
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    statusCode: 404,
    timestamp: new Date().toISOString(),
  };

  res.status(404).json(apiError);
};
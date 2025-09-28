import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

const queryParamSchema = Joi.object({
  location: Joi.string().min(1).max(100).required().messages({
    'string.empty': 'Location is required',
    'string.min': 'Location must be at least 1 character long',
    'string.max': 'Location must not exceed 100 characters',
    'any.required': 'Location parameter is required',
  }),
});

const forecastQuerySchema = Joi.object({
  location: Joi.string().min(1).max(100).required().messages({
    'string.empty': 'Location is required',
    'string.min': 'Location must be at least 1 character long',
    'string.max': 'Location must not exceed 100 characters',
    'any.required': 'Location parameter is required',
  }),
  days: Joi.number().integer().min(1).max(14).default(5).messages({
    'number.base': 'Days must be a number',
    'number.integer': 'Days must be an integer',
    'number.min': 'Days must be at least 1',
    'number.max': 'Days cannot exceed 14',
  }),
});

const locationSearchSchema = Joi.object({
  q: Joi.string().min(1).max(100).required().messages({
    'string.empty': 'Search query is required',
    'string.min': 'Search query must be at least 1 character long',
    'string.max': 'Search query must not exceed 100 characters',
    'any.required': 'Query parameter (q) is required',
  }),
});

export const validateWeatherQuery = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = queryParamSchema.validate(req.query);
  
  if (error) {
    res.status(400).json({
      error: 'Validation Error',
      message: error.details[0].message,
      statusCode: 400,
      timestamp: new Date().toISOString(),
    });
    return;
  }
  
  req.query = value;
  next();
};

export const validateForecastQuery = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = forecastQuerySchema.validate(req.query);
  
  if (error) {
    res.status(400).json({
      error: 'Validation Error',
      message: error.details[0].message,
      statusCode: 400,
      timestamp: new Date().toISOString(),
    });
    return;
  }
  
  req.query = value;
  next();
};

export const validateLocationSearchQuery = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = locationSearchSchema.validate(req.query);
  
  if (error) {
    res.status(400).json({
      error: 'Validation Error',
      message: error.details[0].message,
      statusCode: 400,
      timestamp: new Date().toISOString(),
    });
    return;
  }
  
  req.query = value;
  next();
};
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';

import { config } from './config';
import { logger } from './utils/logger';
import { cacheService } from './services/cache.service';
import { swaggerSpec } from './config/swagger';

// Import middleware
import { rateLimitMiddleware } from './middleware/rateLimit.middleware';
import { requestLoggingMiddleware } from './middleware/logging.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Import routes
import routes from './routes';

class WeatherApiServer {
  private app: express.Application;

  constructor() {
    this.app = express();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(cors({
      origin: config.app.nodeEnv === 'production' 
        ? process.env.ALLOWED_ORIGINS?.split(',') || []
        : true, // Allow all origins in development
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }));

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging
    this.app.use(requestLoggingMiddleware);

    // Rate limiting
    this.app.use(rateLimitMiddleware);
  }

  private initializeRoutes(): void {
    // API Documentation
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Weather API Documentation',
    }));

    // API routes
    this.app.use('/api/v1', routes);
    
    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        message: 'Weather API Server',
        version: config.app.version,
        timestamp: new Date().toISOString(),
        documentation: '/api-docs',
        endpoints: {
          health: '/api/v1/health',
          currentWeather: '/api/v1/weather/current?location={city}',
          forecast: '/api/v1/weather/forecast?location={city}&days={n}',
          locationSearch: '/api/v1/locations/search?q={query}',
        },
      });
    });
  }

  private initializeErrorHandling(): void {
    // Handle 404 routes
    this.app.use(notFoundHandler);
    
    // Global error handler
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      logger.info('Starting Weather API server...');
      
      // Skip Redis for now
      logger.info('Starting without Redis cache');
      
      // Start server
      this.app.listen(config.app.port, () => {
        logger.info(`🚀 Weather API server started on port ${config.app.port}`, {
          port: config.app.port,
          nodeEnv: config.app.nodeEnv,
          version: config.app.version,
        });
        logger.info(`📚 API Documentation available at http://localhost:${config.app.port}/api-docs`);
      });

      // Graceful shutdown
      this.setupGracefulShutdown();
      
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully`);
      
      try {
        await cacheService.disconnect();
        logger.info('Redis connection closed');
        
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }

  public getApp(): express.Application {
    return this.app;
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  const server = new WeatherApiServer();
  server.start().catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });
}

export { WeatherApiServer };
export default WeatherApiServer;
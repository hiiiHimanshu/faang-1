import { createClient, RedisClientType } from 'redis';
import { config } from '../config';
import { logger } from '../utils/logger';

class CacheService {
  private client: RedisClientType | null = null;
  private isConnected = false;

  async connect(): Promise<void> {
    // Skip Redis connection for demo/test environments
    if (config.app.nodeEnv === 'development' && !config.redis.host) {
      logger.info('Skipping Redis connection in demo mode');
      return;
    }
    
    try {
      this.client = createClient({
        socket: {
          host: config.redis.host,
          port: config.redis.port,
        },
        password: config.redis.password || undefined,
      });

      this.client.on('error', (err) => {
        if (this.isConnected) {
          logger.error('Redis Client Error:', err);
        }
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis client connected');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        logger.warn('Redis client disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      logger.warn('Failed to connect to Redis, continuing without cache');
      this.isConnected = false;
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client || !this.isConnected) {
      return null;
    }

    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds: number = config.cache.ttl): Promise<void> {
    if (!this.client || !this.isConnected) {
      return;
    }

    try {
      await this.client.setEx(key, ttlSeconds, value);
    } catch (error) {
      logger.error('Redis SET error:', error);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client || !this.isConnected) {
      return;
    }

    try {
      await this.client.del(key);
    } catch (error) {
      logger.error('Redis DEL error:', error);
    }
  }

  isHealthy(): boolean {
    return this.isConnected && this.client !== null;
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

export const cacheService = new CacheService();
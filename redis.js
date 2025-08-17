const redis = require('redis');
const logger = require('../utils/logger');

let redisClient = null;

const connectRedis = async () => {
  try {
    if (process.env.ENABLE_REDIS_CACHE === 'false') {
      logger.info('Redis caching is disabled');
      return;
    }

    redisClient = redis.createClient({
      url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
      password: process.env.REDIS_PASSWORD || undefined,
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          logger.error('Redis server refused connection');
          return new Error('Redis server refused connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          logger.error('Redis retry time exhausted');
          return new Error('Redis retry time exhausted');
        }
        if (options.attempt > 10) {
          logger.error('Redis max retry attempts reached');
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });

    redisClient.on('connect', () => {
      logger.info('📡 Redis Connected');
    });

    redisClient.on('ready', () => {
      logger.info('✅ Redis Ready');
    });

    redisClient.on('error', (err) => {
      logger.error('Redis error:', err);
    });

    redisClient.on('end', () => {
      logger.warn('Redis connection ended');
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis reconnecting...');
    });

    await redisClient.connect();

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        if (redisClient) {
          await redisClient.quit();
          logger.info('Redis connection closed through app termination');
        }
        process.exit(0);
      } catch (err) {
        logger.error('Error during Redis connection closure:', err);
        process.exit(1);
      }
    });

  } catch (error) {
    logger.error('Redis connection failed:', error.message);
    logger.warn('Continuing without Redis connection. Caching features will be disabled.');
    // Don't exit the process, let it continue without Redis
  }
};

const getRedisClient = () => {
  return redisClient;
};

const setCache = async (key, value, expireTime = 3600) => {
  try {
    if (!redisClient) return false;
    await redisClient.setEx(key, expireTime, JSON.stringify(value));
    return true;
  } catch (error) {
    logger.error('Redis set error:', error);
    return false;
  }
};

const getCache = async (key) => {
  try {
    if (!redisClient) return null;
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error('Redis get error:', error);
    return null;
  }
};

const deleteCache = async (key) => {
  try {
    if (!redisClient) return false;
    await redisClient.del(key);
    return true;
  } catch (error) {
    logger.error('Redis delete error:', error);
    return false;
  }
};

const clearCache = async () => {
  try {
    if (!redisClient) return false;
    await redisClient.flushAll();
    return true;
  } catch (error) {
    logger.error('Redis clear error:', error);
    return false;
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  setCache,
  getCache,
  deleteCache,
  clearCache
};

import { createClient } from 'redis';
import logger from '../utils/logger.js';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient = null;
let isRedisAvailable = false;

try {
    redisClient = createClient({
        url: redisUrl,
        socket: {
            reconnectStrategy: (retries) => {
                if (retries > 3) {
                    logger.warn('Redis: Max reconnection attempts reached - running without cache');
                    return false;
                }
                return Math.min(retries * 100, 1000);
            }
        }
    });

    redisClient.on('error', (err) => {
        logger.warn({ err }, 'Redis client error - running without cache');
        isRedisAvailable = false;
    });

    redisClient.on('connect', () => {
        logger.info('Redis client connected');
        isRedisAvailable = true;
    });

    redisClient.on('ready', () => {
        logger.info('Redis client ready');
        isRedisAvailable = true;
    });

    // Intentar conectar con timeout
    await Promise.race([
        redisClient.connect(),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Redis connection timeout')), 3000)
        )
    ]).catch((err) => {
        logger.warn({ err }, 'Redis not available - running without cache. Install Redis for better performance.');
        isRedisAvailable = false;
    });
} catch (err) {
    logger.warn({ err }, 'Redis initialization failed - running without cache');
    isRedisAvailable = false;
}

// Wrapper para operaciones de Redis que fallan silenciosamente si no está disponible
const safeRedisClient = {
    get: async (key) => {
        if (!isRedisAvailable || !redisClient) return null;
        try {
            return await redisClient.get(key);
        } catch (err) {
            logger.warn({ err, key }, 'Redis GET failed');
            return null;
        }
    },
    set: async (key, value, options) => {
        if (!isRedisAvailable || !redisClient) return null;
        try {
            return await redisClient.set(key, value, options);
        } catch (err) {
            logger.warn({ err, key }, 'Redis SET failed');
            return null;
        }
    },
    del: async (key) => {
        if (!isRedisAvailable || !redisClient) return null;
        try {
            return await redisClient.del(key);
        } catch (err) {
            logger.warn({ err, key }, 'Redis DEL failed');
            return null;
        }
    },
    isAvailable: () => isRedisAvailable
};

export default safeRedisClient;

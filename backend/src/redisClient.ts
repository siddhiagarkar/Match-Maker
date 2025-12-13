// src/redisClient.ts

const createClient = require('redis').createClient;

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err: any) => {
  console.error('Redis Client Error', err);
});

async function initRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('✅ Redis connected');
  }
}

module.exports = { redisClient, initRedis };

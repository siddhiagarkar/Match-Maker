// src/utils/cache.ts

const { redisClient } = require('../redisClient');

async function getCache<T>(key: string): Promise<T | null> {
  const raw = await redisClient.get(key);
  if (!raw) return null;
  return JSON.parse(raw) as T;
}

async function setCache<T>(key: string, value: T, ttlSeconds: number) {
  const json = JSON.stringify(value);
  await redisClient.set(key, json, { EX: ttlSeconds }); // EX = expiry
}

module.exports = { getCache, setCache };

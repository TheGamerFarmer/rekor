const Redis = require('ioredis');

let redis;

function getRedis() {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
    });
  }
  return redis;
}

function configureRedisClient(client) {
  redis = client;
}

module.exports = { getRedis, configureRedisClient };

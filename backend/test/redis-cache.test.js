const test = require('node:test');
const assert = require('node:assert/strict');
const { configureRedisClient, getRedis } = require('../controllers/services/redisCache');

test('crée un client ioredis à son adresse par défaut au premier accès', (t) => {
  const previousUrl = process.env.REDIS_URL;
  delete process.env.REDIS_URL;
  configureRedisClient(undefined);

  const client = getRedis();
  t.after(() => {
    client.disconnect();
    configureRedisClient(undefined);
    if (previousUrl === undefined) delete process.env.REDIS_URL;
    else process.env.REDIS_URL = previousUrl;
  });

  assert.strictEqual(client.options.host, 'localhost');
  assert.strictEqual(client.options.port, 6379);
  assert.strictEqual(client.options.maxRetriesPerRequest, 1);
  assert.strictEqual(getRedis(), client);
});

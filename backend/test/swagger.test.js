const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../index');

test('GET /api-docs.json expose la spec OpenAPI avec la route /', async () => {
  const res = await request(app).get('/api-docs.json');
  assert.strictEqual(res.status, 200);
  assert.ok(res.body.openapi);
  assert.ok(res.body.paths['/']);
});

test('GET /api-docs/ sert l\'interface Swagger UI', async () => {
  const res = await request(app).get('/api-docs/');
  assert.strictEqual(res.status, 200);
  assert.match(res.text, /swagger-ui/i);
});

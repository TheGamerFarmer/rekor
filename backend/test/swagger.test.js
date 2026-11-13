const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../index');
const { USER_ROLE } = require('../db/enums');

test('GET /api-docs.json expose la spec OpenAPI avec la route /', async () => {
  const res = await request(app).get('/api-docs.json');
  assert.strictEqual(res.status, 200);
  assert.ok(res.body.openapi);
  assert.ok(res.body.paths['/']);
  assert.deepStrictEqual(res.body.components.schemas.UserDetails.allOf[1].properties.role.enum, [
    ...Object.values(USER_ROLE),
  ]);
});

test('GET /api-docs.json documente les associations et leur usage en authentification', async () => {
  const res = await request(app).get('/api-docs.json');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.paths['/association'].get.operationId, 'listAssociations');
  assert.deepStrictEqual(res.body.components.schemas.Association.required, [
    '_id',
    'name',
    'address',
  ]);
  assert.ok(res.body.components.schemas.RegisterInput.required.includes('associationName'));
  assert.ok(res.body.components.schemas.LoginInput.required.includes('associationName'));
  assert.ok(!res.body.components.schemas.RegisterInput.properties.associationId);
  assert.ok(!res.body.components.schemas.LoginInput.properties.associationId);
  assert.strictEqual(
    res.body.components.schemas.RegisterInput.properties.associationName.example,
    'Gières Volley-Ball',
  );
  assert.ok(res.body.paths['/auth/register'].post.responses['404']);
  assert.ok(res.body.paths['/auth/login'].post.responses['404']);
});

test("GET /api-docs/ sert l'interface swagger UI", async () => {
  const res = await request(app).get('/api-docs/');
  assert.strictEqual(res.status, 200);
  assert.match(res.text, /swagger-ui/i);
});

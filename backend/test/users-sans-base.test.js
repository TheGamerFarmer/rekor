const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../index');

// Ce fichier ne connecte jamais la base : le back doit répondre 503 proprement, sans planter.
test("GET /users renvoie 503 quand la base n'est pas connectée", async () => {
  const res = await request(app).get('/users');

  assert.strictEqual(res.status, 503);
  assert.match(res.body.message, /n'est pas connectée/);
});

test("POST /users renvoie 503 quand la base n'est pas connectée", async () => {
  const res = await request(app).post('/users').send({ email: 'ada@exemple.fr', name: 'Ada' });

  assert.strictEqual(res.status, 503);
});

test('la route de santé répond toujours sans base', async () => {
  const res = await request(app).get('/');

  assert.strictEqual(res.status, 200);
});

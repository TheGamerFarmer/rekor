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

test('POST /users renvoie 404 car cette route utilisateur n’existe pas', async () => {
  const res = await request(app).post('/users').send({});

  assert.strictEqual(res.status, 404);
});

test("GET /users/:id renvoie 503 quand la base n'est pas connectée", async () => {
  const res = await request(app).get('/users/000000000000000000000000');

  assert.strictEqual(res.status, 503);
  assert.match(res.body.message, /n'est pas connectée/);
});

test("POST /auth/register renvoie 503 quand la base n'est pas connectée", async () => {
  const res = await request(app).post('/auth/register').send({
    name: 'Lovelace',
    firstName: 'Ada',
    email: 'ada@exemple.fr',
    password: 'motdepasse',
    pronoun: 'Elle',
  });

  assert.strictEqual(res.status, 503);
});

test("POST /auth/login renvoie 503 quand la base n'est pas connectée", async () => {
  const res = await request(app).post('/auth/login').send({
    email: 'ada@exemple.fr',
    password: 'motdepasse',
  });

  assert.strictEqual(res.status, 503);
});

test('la route de santé répond toujours sans base', async () => {
  const res = await request(app).get('/');

  assert.strictEqual(res.status, 200);
});

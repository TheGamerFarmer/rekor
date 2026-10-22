const test = require('node:test');
const assert = require('node:assert');
const express = require('express');
const request = require('supertest');
const createUsersRouter = require('../controllers/users');
const createAuthRouter = require('../controllers/auth');

// Application minimale : sans base connectée, chaque route répond 503, ce qui suffit
// à compter les requêtes sans avoir besoin d'un mongod.
function buildApp(options, { trustProxy = false } = {}) {
  const app = express();
  if (trustProxy) app.set('trust proxy', 1);
  app.use(express.json());
  app.use('/users', createUsersRouter(options));
  app.use('/auth', createAuthRouter(options));
  return app;
}

test('au-delà de la limite, les requêtes sont refusées avec un 429 JSON', async () => {
  const app = buildApp({ limit: 2 });

  assert.strictEqual((await request(app).get('/users')).status, 503);
  assert.strictEqual((await request(app).get('/users')).status, 503);

  const res = await request(app).get('/users');
  assert.strictEqual(res.status, 429);
  assert.match(res.body.message, /Trop de requêtes/);
  assert.strictEqual(res.headers['ratelimit-limit'], '2');
});

test('la limite d’authentification vaut aussi pour les inscriptions', async () => {
  const app = buildApp({ limit: 1 });
  const body = {
    name: 'Lovelace',
    firstName: 'Ada',
    email: 'ada@exemple.fr',
    password: 'motdepasse',
    pronoun: 'Elle',
  };

  assert.strictEqual((await request(app).post('/auth/register').send(body)).status, 503);
  assert.strictEqual((await request(app).post('/auth/register').send(body)).status, 429);
});

test('derrière un proxy, chaque client a sa propre limite', async () => {
  const app = buildApp({ limit: 1 }, { trustProxy: true });
  const get = (ip) => request(app).get('/users').set('X-Forwarded-For', ip);

  assert.strictEqual((await get('10.0.0.1')).status, 503);
  assert.strictEqual((await get('10.0.0.1')).status, 429);
  // un autre client n'est pas touché par la limite du premier
  assert.strictEqual((await get('10.0.0.2')).status, 503);
});

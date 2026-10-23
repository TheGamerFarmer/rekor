const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../index');
const { signAccessToken } = require('../controllers/services/auth-middleware');

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

test("GET /users/me renvoie 503 quand la base n'est pas connectée", async () => {
  const previousJwtSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'users-without-db-secret-over-32-bytes';
  try {
    const token = signAccessToken({
      _id: { toString: () => '000000000000000000000000' },
      role: 'Visiteur',
    });
    const res = await request(app).get('/users/me').set('Authorization', `Bearer ${token}`);

    assert.strictEqual(res.status, 503);
  } finally {
    if (previousJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousJwtSecret;
  }
});

test('les routes de profil exigent une authentification', async () => {
  const res = await request(app).get('/users/me');
  assert.strictEqual(res.status, 401);

  const update = await request(app).patch('/users/me').send({ name: 'Ada' });
  assert.strictEqual(update.status, 401);

  const remove = await request(app).delete('/users/me');
  assert.strictEqual(remove.status, 401);

  const changePassword = await request(app).put('/users/me/password').send({
    old_password: 'ancien',
    new_password: 'nouveau',
  });
  assert.strictEqual(changePassword.status, 401);
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

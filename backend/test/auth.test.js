const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const express = require('express');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const db = require('../db/db');
const app = require('../index');
const { authenticate, authorize, signAccessToken } = require('../controllers/auth-middleware');

const account = {
  email: 'ada@exemple.fr',
  name: 'Ada',
  firstName: 'Lovelace',
  password: 'mot-de-passe',
  pronoun: 'Elle',
};

describe('/auth', () => {
  let mongod;
  const previousJwtSecret = process.env.JWT_SECRET;

  before(async () => {
    process.env.JWT_SECRET = 'test-secret-with-at-least-32-bytes-long';
    mongod = await MongoMemoryServer.create();
    await db.connect({ uri: mongod.getUri(), dbName: 'auth-test' });
  });

  after(async () => {
    await db.close();
    await mongod.stop();
    if (previousJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = previousJwtSecret;
    }
  });

  beforeEach(async () => {
    await db.getDb().collection('users').deleteMany({});
  });

  it('enregistre un compte et stocke uniquement un mot de passe haché', async () => {
    const res = await request(app).post('/auth/register').send(account);

    assert.strictEqual(res.status, 201);
    assert.match(res.body.id, /^[0-9a-f]{24}$/);
    assert.deepStrictEqual(
      { email: res.body.email, name: res.body.name },
      { email: account.email, name: account.name },
    );

    const stored = await db.getDb().collection('users').findOne({ email: account.email });
    assert.notStrictEqual(stored.password, account.password);
    assert.strictEqual(stored.password.split(':')[0].length, 32);
  });

  it('authentifie avec le bon mot de passe sans exposer le hash', async () => {
    const registration = await request(app).post('/auth/register').send(account);
    assert.strictEqual(registration.status, 201);
    assert.strictEqual(registration.body.role, 'Visiteur');

    const res = await request(app).post('/auth/login').send({
      email: account.email,
      password: account.password,
    });

    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(
      { email: res.body.user.email, name: res.body.user.name, role: res.body.user.role },
      { email: account.email, name: account.name, role: 'Visiteur' },
    );
    assert.match(res.body.token, /^[\w-]+\.[\w-]+\.[\w-]+$/);
    assert.strictEqual('password' in res.body.user, false);

    const me = await request(app).get('/auth/me').set('Authorization', `Bearer ${res.body.token}`);
    assert.strictEqual(me.status, 200);
    assert.deepStrictEqual(me.body, { id: registration.body.id, role: 'Visiteur' });
  });

  it('protège les routes et refuse les tokens invalides', async () => {
    const missing = await request(app).get('/auth/me');
    assert.strictEqual(missing.status, 401);

    const invalid = await request(app).get('/auth/me').set('Authorization', 'Bearer invalid');
    assert.strictEqual(invalid.status, 401);
  });

  it('refuse un mot de passe incorrect avec une réponse générique', async () => {
    await request(app).post('/auth/register').send(account);

    const res = await request(app).post('/auth/login').send({
      email: account.email,
      password: 'incorrect',
    });

    assert.strictEqual(res.status, 401);
    assert.deepStrictEqual(res.body, { message: 'E-mail ou mot de passe incorrect' });
  });

  it('refuse de créer un compte avec un e-mail déjà utilisé', async () => {
    await request(app).post('/auth/register').send(account);

    const res = await request(app).post('/auth/register').send(account);

    assert.strictEqual(res.status, 409);
  });

  it('autorise une route uniquement au rôle demandé', async () => {
    const roleApp = express();
    roleApp.get('/trainers', authenticate, authorize('Entraineur'), (req, res) =>
      res.sendStatus(204),
    );
    const userId = '6ac8c78e50318b28d457048f';

    const visitorToken = signAccessToken({ _id: { toString: () => userId }, role: 'Visiteur' });
    const denied = await request(roleApp)
      .get('/trainers')
      .set('Authorization', `Bearer ${visitorToken}`);
    assert.strictEqual(denied.status, 403);

    const trainerToken = signAccessToken({ _id: { toString: () => userId }, role: 'Entraineur' });
    const allowed = await request(roleApp)
      .get('/trainers')
      .set('Authorization', `Bearer ${trainerToken}`);
    assert.strictEqual(allowed.status, 204);
  });
});

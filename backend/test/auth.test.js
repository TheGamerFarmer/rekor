const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const express = require('express');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const db = require('../db/db');
const app = require('../index');
const createAuthRouter = require('../controllers/auth');
const {
  authenticate,
  authorize,
  signAccessToken,
  verifyAccessToken,
} = require('../controllers/auth-middleware');
const { createHmac } = require('node:crypto');

const account = {
  email: 'ada@exemple.fr',
  name: 'Ada',
  firstName: 'Lovelace',
  password: 'mot-de-passe',
  pronoun: 'Elle',
};

function buildMiddlewareApp() {
  const middlewareApp = express();
  middlewareApp.get('/me', authenticate, (req, res) => res.json(req.auth));
  return middlewareApp;
}

describe('/auth', () => {
  let mongod;
  const previousJwtSecret = process.env.JWT_SECRET;

  before(async () => {
    process.env.JWT_SECRET = 'test-secret-with-at-least-32-bytes-long';
    mongod = await MongoMemoryServer.create();
    await db.connect({ uri: mongod.getUri(), dbName: 'auth-test' });
    await db.getDb().collection('users').createIndex({ email: 1 }, { unique: true });
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
    assert.deepStrictEqual(res.body, {});

    const stored = await db.getDb().collection('users').findOne({ email: account.email });
    assert.notStrictEqual(stored.password, account.password);
    assert.strictEqual(stored.password.split(':')[0].length, 32);
  });

  it('authentifie avec le bon mot de passe sans exposer le hash', async () => {
    const registration = await request(app).post('/auth/register').send(account);
    assert.strictEqual(registration.status, 201);
    const storedUser = await db.getDb().collection('users').findOne({ email: account.email });

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
    assert.deepStrictEqual(me.body, { id: storedUser._id.toString(), role: 'Visiteur' });
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

  it('rejette les tokens mal formés, falsifiés ou avec des claims invalides', async () => {
    const validHeader = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString(
      'base64url',
    );
    const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
    const sign = (header, payload) => {
      const unsigned = `${encode(header)}.${encode(payload)}`;
      const signature = createHmac('sha256', process.env.JWT_SECRET)
        .update(unsigned)
        .digest('base64url');
      return `${unsigned}.${signature}`;
    };
    const validPayload = {
      sub: '6ac8c78e50318b28d457048f',
      role: 'Visiteur',
      exp: Math.floor(Date.now() / 1000) + 60,
    };
    const tokens = [
      'not-a-jwt',
      `${validHeader}.${Buffer.from('not-json').toString('base64url')}.signature`,
      sign({ alg: 'none', typ: 'JWT' }, validPayload),
      `${sign({ alg: 'HS256', typ: 'JWT' }, validPayload).slice(0, -1)}x`,
      sign({ alg: 'HS256', typ: 'JWT' }, { ...validPayload, role: 'Admin' }),
      sign({ alg: 'HS256', typ: 'JWT' }, { ...validPayload, exp: 'later' }),
      sign({ alg: 'HS256', typ: 'JWT' }, { ...validPayload, exp: 1 }),
      sign({ alg: 'HS256', typ: 'JWT' }, { role: 'Visiteur', exp: validPayload.exp }),
    ];
    const middlewareApp = buildMiddlewareApp();

    for (const token of tokens) {
      assert.throws(() => verifyAccessToken(token));
      const res = await request(middlewareApp).get('/me').set('Authorization', `Bearer ${token}`);
      assert.strictEqual(res.status, 401);
    }
  });

  it('transmet les erreurs de configuration JWT du middleware au gestionnaire Express', async () => {
    const validToken = signAccessToken({
      _id: { toString: () => '6ac8c78e50318b28d457048f' },
      role: 'Visiteur',
    });
    process.env.JWT_SECRET = 'short';

    try {
      const res = await request(buildMiddlewareApp())
        .get('/me')
        .set('Authorization', `Bearer ${validToken}`);
      assert.strictEqual(res.status, 500);
      assert.match(res.text, /JWT_SECRET/);
    } finally {
      process.env.JWT_SECRET = 'test-secret-with-at-least-32-bytes-long';
    }
  });

  it('rejette la création de token si JWT_SECRET est absent ou trop court', () => {
    const user = {
      _id: { toString: () => '6ac8c78e50318b28d457048f' },
      role: 'Visiteur',
    };
    delete process.env.JWT_SECRET;
    assert.throws(() => signAccessToken(user), /JWT_SECRET doit contenir/);

    process.env.JWT_SECRET = 'short';
    assert.throws(() => signAccessToken(user), /JWT_SECRET doit contenir/);
    process.env.JWT_SECRET = 'test-secret-with-at-least-32-bytes-long';
  });

  it('renvoie 401 si authorize est appelé sans authentification', async () => {
    const roleApp = express();
    roleApp.get('/trainers', authorize('Entraineur'), (req, res) => res.sendStatus(204));

    const res = await request(roleApp).get('/trainers');
    assert.strictEqual(res.status, 401);
  });

  it('renvoie 409 si une insertion concurrente viole la contrainte d’unicité', async () => {
    const registrationApp = express();
    registrationApp.use(express.json());
    registrationApp.use('/auth', createAuthRouter({ limit: 100 }));
    const collection = db.getDb().collection('users');
    const collectionPrototype = Object.getPrototypeOf(collection);
    const originalInsertOne = collectionPrototype.insertOne;
    collectionPrototype.insertOne = async () => {
      throw Object.assign(new Error('Duplicate email'), { code: 11000 });
    };

    try {
      const res = await request(registrationApp)
        .post('/auth/register')
        .send({ ...account, email: 'concurrent@exemple.fr' });
      assert.strictEqual(res.status, 409);
    } finally {
      collectionPrototype.insertOne = originalInsertOne;
    }
  });

  it('transmet les erreurs d’insertion qui ne sont pas des doublons', async () => {
    const registrationApp = express();
    registrationApp.use(express.json());
    registrationApp.use('/auth', createAuthRouter({ limit: 100 }));
    const collection = db.getDb().collection('users');
    const collectionPrototype = Object.getPrototypeOf(collection);
    const originalInsertOne = collectionPrototype.insertOne;
    collectionPrototype.insertOne = async () => {
      throw Object.assign(new Error('Database write failed'), { code: 12345 });
    };

    try {
      const res = await request(registrationApp)
        .post('/auth/register')
        .send({ ...account, email: 'write-error@exemple.fr' });
      assert.strictEqual(res.status, 500);
      assert.match(res.text, /Database write failed/);
    } finally {
      collectionPrototype.insertOne = originalInsertOne;
    }
  });
});

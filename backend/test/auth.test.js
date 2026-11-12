const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const express = require('express');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { ObjectId } = require('mongodb');
const db = require('../db/db');
const app = require('../index');
const createUsersRouter = require('../controllers/users');
const createAuthRouter = require('../controllers/auth');
const User = require('../db/models/user');
const Association = require('../db/models/association');
const Registration = require('../db/models/registration');
const RefreshToken = require('../db/models/refresh-token');
const {
  authenticate,
  authorize,
  signAccessToken,
  signRefreshToken,
  hashRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} = require('../controllers/services/auth-middleware');
const { createHmac } = require('node:crypto');
const { clearRevokedSessions } = require('./helpers/redis');
const RateLimit = require('express-rate-limit');
const { userContext } = require('../db/plugins/audit');

const account = {
  email: 'ada@exemple.fr',
  name: 'Ada',
  firstName: 'Lovelace',
  password: 'mot-de-passe',
  pronoun: 'Elle',
  associationName: 'Gières Volley-Ball',
};
const association = { name: account.associationName, address: '1 Rue des Sports 38610 Gières' };

function signClaims(payload, secret = process.env.JWT_SECRET) {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const unsigned = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}`;
  const signature = createHmac('sha256', secret).update(unsigned).digest('base64url');
  return `${unsigned}.${signature}`;
}

function signRefreshClaims(payload) {
  const secret = createHmac('sha256', process.env.JWT_SECRET)
    .update('rekor-refresh-token-v1')
    .digest();
  return signClaims(payload, secret);
}

function buildMiddlewareApp() {
  const middlewareApp = express();
  let limiter = RateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 20, // max 20 requests per windowMs
  });
  middlewareApp.use(limiter);
  middlewareApp.get('/me', authenticate, (req, res) => res.json(req.auth));
  return middlewareApp;
}

function buildApiApp() {
  const apiApp = express();
  apiApp.use(express.json());
  apiApp.use((req, res, next) => userContext.run({}, next));
  apiApp.use('/users', createUsersRouter({ limit: 100 }));
  apiApp.use('/auth', createAuthRouter({ limit: 100 }));
  return apiApp;
}

describe('/auth', () => {
  let mongod;
  let apiApp;
  const previousJwtSecret = process.env.JWT_SECRET;

  before(async () => {
    process.env.JWT_SECRET = 'test-secret-with-at-least-32-bytes-long';
    apiApp = buildApiApp();
    mongod = await MongoMemoryServer.create();
    await db.connect({ uri: mongod.getUri(), dbName: 'auth-test' });
    await db.getDb().collection('users').createIndex({ email: 1 }, { unique: true });
    await Association.create(association);
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
    clearRevokedSessions();
    await db.getDb().collection('users').deleteMany({});
    await Registration.deleteMany({});
    await RefreshToken.deleteMany({});
  });

  it('enregistre un compte et stocke uniquement un mot de passe haché', async () => {
    const res = await request(apiApp).post('/auth/register').send(account);

    assert.strictEqual(res.status, 201);
    assert.deepStrictEqual(res.body, {});

    const stored = await db.getDb().collection('users').findOne({ email: account.email });
    assert.notStrictEqual(stored.password, account.password);
    assert.strictEqual(stored.password.split(':')[0].length, 32);
    const registration = await Registration.findOne({
      association: (await Association.findOne())._id,
    });
    assert.strictEqual(registration.created_by.toString(), stored._id.toString());
  });

  it('enregistre un compte avec un anniversaire', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ ...account, birthday: '1990-05-15' });

    assert.strictEqual(res.status, 201);
    const stored = await db.getDb().collection('users').findOne({ email: account.email });
    assert.strictEqual(stored.birthday.toISOString(), '1990-05-15T00:00:00.000Z');
  });

  it('verifyAccessToken lève une erreur pour un token non-string', async () => {
    await assert.rejects(() => verifyAccessToken(null));
    await assert.rejects(() => verifyAccessToken(42));
  });

  it('authentifie avec le bon mot de passe sans exposer le hash', async () => {
    const registration = await request(apiApp).post('/auth/register').send(account);
    assert.strictEqual(registration.status, 201);
    const storedUser = await db.getDb().collection('users').findOne({ email: account.email });

    const res = await request(apiApp).post('/auth/login').send({
      email: account.email,
      password: account.password,
      associationName: account.associationName,
    });

    assert.strictEqual(res.status, 200);
    assert.match(res.body.access_token, /^[\w-]+\.[\w-]+\.[\w-]+$/);
    assert.match(res.body.refresh_token, /^[\w-]+\.[\w-]+\.[\w-]+$/);
    const accessClaims = await verifyAccessToken(res.body.access_token);
    const refreshClaims = verifyRefreshToken(res.body.refresh_token);
    assert.strictEqual(accessClaims.sub, storedUser._id.toString());
    assert.strictEqual(accessClaims.association, account.associationName);
    assert.strictEqual(accessClaims.sid, refreshClaims.sid);
    assert.strictEqual(accessClaims.exp - accessClaims.iat, 15 * 60);
    assert.strictEqual(refreshClaims.sub, storedUser._id.toString());
    assert.strictEqual(refreshClaims.association, account.associationName);
    assert.strictEqual(refreshClaims.exp - refreshClaims.iat, 30 * 24 * 60 * 60);

    const me = await request(apiApp)
      .get('/users/me')
      .set('Authorization', `Bearer ${res.body.access_token}`);
    assert.strictEqual(me.status, 200);
    assert.strictEqual(me.body.id, storedUser._id.toString());
    assert.strictEqual(me.body.role, 'Visiteur');
  });

  it('renouvelle et fait tourner le refresh token', async () => {
    await request(apiApp).post('/auth/register').send(account);
    const login = await request(apiApp).post('/auth/login').send({
      email: account.email,
      password: account.password,
      associationName: account.associationName,
    });

    const refreshed = await request(apiApp).post('/auth/refresh').send({
      refresh_token: login.body.refresh_token,
    });

    assert.strictEqual(refreshed.status, 200);
    assert.match(refreshed.body.access_token, /^[\w-]+\.[\w-]+\.[\w-]+$/);
    assert.match(refreshed.body.refresh_token, /^[\w-]+\.[\w-]+\.[\w-]+$/);
    assert.notStrictEqual(refreshed.body.refresh_token, login.body.refresh_token);
    const replay = await request(apiApp)
      .post('/auth/refresh')
      .send({ refresh_token: login.body.refresh_token });
    assert.strictEqual(replay.status, 401);
  });

  it('refuse les refresh tokens invalides ou dont les claims ne sont pas valides', async () => {
    const invalidTokens = [
      signRefreshClaims({
        sub: '6ac8c78e50318b28d457048f',
        role: 'Visiteur',
        sid: 'session',
        token_use: 'refresh',
        iat: 1,
        exp: Math.floor(Date.now() / 1000) + 60,
      }),
      signRefreshClaims({
        sub: '6ac8c78e50318b28d457048f',
        role: 'Visiteur',
        jti: 'token',
        token_use: 'refresh',
        iat: 1,
        exp: Math.floor(Date.now() / 1000) + 60,
      }),
      signRefreshClaims({
        sub: '6ac8c78e50318b28d457048f',
        role: 'Visiteur',
        sid: 'session',
        jti: 'token',
        token_use: 'refresh',
        exp: Math.floor(Date.now() / 1000) + 60,
      }),
    ];

    for (const token of invalidTokens) {
      assert.throws(() => verifyRefreshToken(token));
    }

    const malformedRefresh = await request(apiApp)
      .post('/auth/refresh')
      .send({ refresh_token: 'invalid' });
    assert.strictEqual(malformedRefresh.status, 401);

    const malformedLogout = await request(apiApp)
      .post('/auth/logout')
      .send({ refresh_token: 'invalid' });
    assert.strictEqual(malformedLogout.status, 401);

    const invalidSubjectToken = signRefreshToken(
      { _id: { toString: () => 'not-an-object-id' }, role: 'Visiteur' },
      association,
    ).token;
    const invalidSubjectRefresh = await request(apiApp)
      .post('/auth/refresh')
      .send({ refresh_token: invalidSubjectToken });
    assert.strictEqual(invalidSubjectRefresh.status, 401);

    const invalidSubjectLogout = await request(apiApp)
      .post('/auth/logout')
      .send({ refresh_token: invalidSubjectToken });
    assert.strictEqual(invalidSubjectLogout.status, 401);
  });

  it('refuse un refresh token sans session enregistrée en base', async () => {
    const token = signRefreshToken(
      {
        _id: { toString: () => '6ac8c78e50318b28d457048f' },
        role: 'Visiteur',
      },
      association,
    ).token;

    const refresh = await request(apiApp).post('/auth/refresh').send({ refresh_token: token });
    assert.strictEqual(refresh.status, 401);

    const logout = await request(apiApp).post('/auth/logout').send({ refresh_token: token });
    assert.strictEqual(logout.status, 401);
  });

  it('propage les erreurs internes de validation sur refresh et logout', async () => {
    const previousJwtSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'short';

    try {
      const refresh = await request(apiApp)
        .post('/auth/refresh')
        .send({ refresh_token: 'invalid' });
      assert.strictEqual(refresh.status, 500);

      const logout = await request(apiApp).post('/auth/logout').send({ refresh_token: 'invalid' });
      assert.strictEqual(logout.status, 500);
    } finally {
      process.env.JWT_SECRET = previousJwtSecret;
    }
  });

  it('supprime une session de refresh orpheline dont le compte a disparu', async () => {
    const userId = new ObjectId('6ac8c78e50318b28d457048f');
    const refresh = signRefreshToken({ _id: userId, role: 'Visiteur' }, association);
    await RefreshToken.create({
      _id: refresh.sessionId,
      userId,
      tokenHash: hashRefreshToken(refresh.token),
      expiresAt: refresh.expiresAt,
    });

    const response = await request(apiApp)
      .post('/auth/refresh')
      .send({ refresh_token: refresh.token });
    assert.strictEqual(response.status, 401);
    assert.strictEqual(await RefreshToken.findById(refresh.sessionId), null);
  });

  it('refuse le renouvellement si la rotation du refresh token a échoué', async () => {
    await request(apiApp).post('/auth/register').send(account);
    const login = await request(apiApp).post('/auth/login').send({
      email: account.email,
      password: account.password,
      associationName: account.associationName,
    });
    const originalUpdateOne = RefreshToken.updateOne;
    RefreshToken.updateOne = async () => ({ matchedCount: 0 });

    try {
      const response = await request(apiApp)
        .post('/auth/refresh')
        .send({ refresh_token: login.body.refresh_token });
      assert.strictEqual(response.status, 401);
    } finally {
      RefreshToken.updateOne = originalUpdateOne;
    }
  });

  it('refuse un refresh token utilisé comme access token', async () => {
    const refresh = signRefreshToken(
      {
        _id: { toString: () => '6ac8c78e50318b28d457048f' },
        role: 'Visiteur',
      },
      association,
    );
    const response = await request(buildMiddlewareApp())
      .get('/me')
      .set('Authorization', `Bearer ${refresh.token}`);

    assert.strictEqual(response.status, 401);
  });

  it('révoque la session lors du logout', async () => {
    await request(apiApp).post('/auth/register').send(account);
    const login = await request(apiApp).post('/auth/login').send({
      email: account.email,
      password: account.password,
      associationName: account.associationName,
    });

    const logout = await request(apiApp)
      .post('/auth/logout')
      .send({ refresh_token: login.body.refresh_token });
    assert.strictEqual(logout.status, 204);

    const protectedRequest = await request(apiApp)
      .get('/users/me')
      .set('Authorization', 'Bearer ' + login.body.access_token);
    assert.strictEqual(protectedRequest.status, 401);

    const refreshed = await request(apiApp)
      .post('/auth/refresh')
      .send({ refresh_token: login.body.refresh_token });
    assert.strictEqual(refreshed.status, 401);
  });

  it('protège les routes et refuse les tokens invalides', async () => {
    const missing = await request(apiApp).get('/users/me');
    assert.strictEqual(missing.status, 401);

    const invalid = await request(app).get('/users/me').set('Authorization', 'Bearer invalid');
    assert.strictEqual(invalid.status, 401);
  });

  it('refuse un mot de passe incorrect avec une réponse générique', async () => {
    await request(apiApp).post('/auth/register').send(account);

    const res = await request(apiApp).post('/auth/login').send({
      email: account.email,
      password: 'incorrect',
      associationName: account.associationName,
    });

    assert.strictEqual(res.status, 401);
    assert.deepStrictEqual(res.body, { message: 'E-mail ou mot de passe incorrect' });
  });

  it('refuse de créer un compte avec un e-mail déjà utilisé', async () => {
    await request(apiApp).post('/auth/register').send(account);

    const res = await request(apiApp).post('/auth/register').send(account);

    assert.strictEqual(res.status, 409);
  });

  it('refuse inscription et connexion pour une association inconnue', async () => {
    const registration = await request(apiApp)
      .post('/auth/register')
      .send({ ...account, email: 'unknown-association@exemple.fr', associationName: 'Inconnue' });
    const login = await request(apiApp)
      .post('/auth/login')
      .send({ email: account.email, password: account.password, associationName: 'Inconnue' });

    assert.strictEqual(registration.status, 404);
    assert.strictEqual(login.status, 404);
  });

  it('refuse la connexion si le compte est absent ou le mot de passe incorrect', async () => {
    const unknownUser = await request(apiApp).post('/auth/login').send({
      email: 'missing@exemple.fr',
      password: account.password,
      associationName: account.associationName,
    });
    await request(apiApp).post('/auth/register').send(account);
    const incorrectPassword = await request(apiApp).post('/auth/login').send({
      email: account.email,
      password: 'incorrect',
      associationName: account.associationName,
    });

    assert.strictEqual(unknownUser.status, 401);
    assert.strictEqual(incorrectPassword.status, 401);
  });

  it('renvoie 409 si la création de l’inscription rencontre un doublon concurrent', async () => {
    const originalCreate = Registration.create;
    Registration.create = async () => {
      throw Object.assign(new Error('Duplicate registration'), { code: 11000 });
    };

    try {
      const response = await request(apiApp)
        .post('/auth/register')
        .send({ ...account, email: 'duplicate-registration@exemple.fr' });
      assert.strictEqual(response.status, 409);
      assert.match(response.body.message, /déjà inscrit/);
    } finally {
      Registration.create = originalCreate;
    }
  });

  it('propage les erreurs inattendues de création de l’inscription', async () => {
    const originalCreate = Registration.create;
    Registration.create = async () => {
      throw Object.assign(new Error('Registration write failed'), { code: 12345 });
    };

    try {
      const response = await request(apiApp)
        .post('/auth/register')
        .send({ ...account, email: 'registration-error@exemple.fr' });
      assert.strictEqual(response.status, 500);
      assert.match(response.text, /Registration write failed/);
    } finally {
      Registration.create = originalCreate;
    }
  });

  it('refuse le login si la session de refresh ne peut pas être persistée', async () => {
    await request(apiApp).post('/auth/register').send(account);
    const originalCreate = RefreshToken.create;
    RefreshToken.create = async () => {
      throw new Error('Refresh session write failed');
    };

    try {
      const response = await request(apiApp).post('/auth/login').send({
        email: account.email,
        password: account.password,
        associationName: account.associationName,
      });
      assert.strictEqual(response.status, 500);
      assert.match(response.text, /Refresh session write failed/);
    } finally {
      RefreshToken.create = originalCreate;
    }
  });

  it('refuse le refresh si l’association du token n’existe plus', async () => {
    await request(apiApp).post('/auth/register').send(account);
    const login = await request(apiApp).post('/auth/login').send({
      email: account.email,
      password: account.password,
      associationName: account.associationName,
    });
    const originalFindOne = Association.findOne;
    Association.findOne = async () => null;

    try {
      const response = await request(apiApp).post('/auth/refresh').send({
        refresh_token: login.body.refresh_token,
      });
      assert.strictEqual(response.status, 401);
    } finally {
      Association.findOne = originalFindOne;
    }
  });

  it('liste l’association disponible via GET /association', async () => {
    const response = await request(app).get('/association');

    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(
      response.body.map(({ name, address }) => ({ name, address })),
      [association],
    );
  });

  it('autorise une route uniquement au rôle demandé', async () => {
    const roleApp = express();
    roleApp.get('/trainers', authenticate, authorize('Entraineur'), (req, res) =>
      res.sendStatus(204),
    );
    const userId = '6ac8c78e50318b28d457048f';

    const visitorToken = signAccessToken(
      { _id: { toString: () => userId }, role: 'Visiteur' },
      association,
    );
    const denied = await request(roleApp)
      .get('/trainers')
      .set('Authorization', `Bearer ${visitorToken}`);
    assert.strictEqual(denied.status, 403);

    const trainerToken = signAccessToken(
      { _id: { toString: () => userId }, role: 'Entraineur' },
      association,
    );
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
      'header..signature',
      `${validHeader}.${Buffer.from('not-json').toString('base64url')}.signature`,
      sign({ alg: 'none', typ: 'JWT' }, validPayload),
      `${sign({ alg: 'HS256', typ: 'JWT' }, validPayload).slice(0, -1)}x`,
      sign({ alg: 'HS256', typ: 'JWT' }, { ...validPayload, role: 'Admin' }),
      sign({ alg: 'HS256', typ: 'JWT' }, { ...validPayload, exp: 'later' }),
      sign({ alg: 'HS256', typ: 'JWT' }, { ...validPayload, exp: 1 }),
      sign({ alg: 'HS256', typ: 'JWT' }, { role: 'Visiteur', exp: validPayload.exp }),
      sign({ alg: 'HS256', typ: 'JWT' }, { ...validPayload, token_use: 'refresh' }),
    ];
    const middlewareApp = buildMiddlewareApp();

    for (const token of tokens) {
      await assert.rejects(() => verifyAccessToken(token));
      const res = await request(middlewareApp).get('/me').set('Authorization', `Bearer ${token}`);
      assert.strictEqual(res.status, 401);
    }

    const missingSessionId = sign(
      { alg: 'HS256', typ: 'JWT' },
      { ...validPayload, sid: undefined },
    );
    await assert.rejects(() => verifyAccessToken(missingSessionId));
  });

  it('transmet les erreurs de configuration JWT du middleware au gestionnaire Express', async () => {
    const validToken = signAccessToken(
      {
        _id: { toString: () => '6ac8c78e50318b28d457048f' },
        role: 'Visiteur',
      },
      association,
    );
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
    assert.throws(() => signAccessToken(user, association), /JWT_SECRET doit contenir/);

    process.env.JWT_SECRET = 'short';
    assert.throws(() => signAccessToken(user, association), /JWT_SECRET doit contenir/);
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
    const originalSave = User.prototype.$save;
    User.prototype.$save = async function () {
      throw Object.assign(new Error('Duplicate email'), { code: 11000 });
    };

    try {
      const res = await request(registrationApp)
        .post('/auth/register')
        .send({ ...account, email: 'concurrent@exemple.fr' });
      assert.strictEqual(res.status, 409);
    } finally {
      User.prototype.$save = originalSave;
    }
  });

  it('transmet les erreurs d’insertion qui ne sont pas des doublons', async () => {
    const registrationApp = express();
    registrationApp.use(express.json());
    registrationApp.use('/auth', createAuthRouter({ limit: 100 }));
    const originalSave = User.prototype.$save;
    User.prototype.$save = async function () {
      throw Object.assign(new Error('Database write failed'), { code: 12345 });
    };

    try {
      const res = await request(registrationApp)
        .post('/auth/register')
        .send({ ...account, email: 'write-error@exemple.fr' });
      assert.strictEqual(res.status, 500);
      assert.match(res.text, /Database write failed/);
    } finally {
      User.prototype.$save = originalSave;
    }
  });
});

const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const express = require('express');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { ObjectId } = require('mongodb');
const db = require('../db/db');
const app = require('../index');
const createUsersRouter = require('../controllers/users');
const User = require('../db/models/user');
const RefreshToken = require('../db/models/refresh-token');
const {
  signAccessToken,
  signRefreshToken,
  hashRefreshToken,
} = require('../controllers/services/auth-middleware');
const { hashPassword, verifyPassword } = require('../controllers/services/password');
const { clearRevokedSessions } = require('./helpers/redis');

const ada = {
  name: 'Lovelace',
  firstName: 'Ada',
  email: 'ada@exemple.fr',
  password: 'hash-secret',
  role: 'Adhérent',
  pronoun: 'Elle',
  phoneNumber: '0612345678',
  birthday: new Date('1815-12-10T00:00:00.000Z'),
  medicalCertificate: false,
  rightOfPublicity: true,
};
const UNKNOWN_ID = '000000000000000000000000';
const association = { name: 'Gières Volley-Ball' };

describe('/users (avec un vrai mongod)', () => {
  let mongod;
  let adaId;
  let alanId;
  let adaToken;
  let adaRefreshToken;
  const previousJwtSecret = process.env.JWT_SECRET;

  before(async () => {
    process.env.JWT_SECRET = 'users-test-secret-with-at-least-32-bytes';
    mongod = await MongoMemoryServer.create();
    await db.connect({ uri: mongod.getUri(), dbName: 'users-test' });
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
    const collection = db.getDb().collection('users');
    await collection.deleteMany({});
    adaId = new ObjectId('000000000000000000000001');
    alanId = new ObjectId('000000000000000000000002');
    await collection.insertOne({
      ...ada,
      password: await hashPassword('ancien-mot-de-passe'),
      _id: adaId,
    });
    await collection.insertOne({
      _id: alanId,
      name: 'Byron',
      firstName: 'Alan',
      email: 'alan@exemple.fr',
      password: await hashPassword('autre-mot-de-passe'),
      role: 'Adhérent',
      pronoun: 'Il',
    });
    adaToken = signAccessToken({ _id: adaId, role: ada.role }, association);
    const refresh = signRefreshToken({ _id: adaId, role: ada.role }, association);
    adaRefreshToken = refresh.token;
    await RefreshToken.create({
      _id: refresh.sessionId,
      userId: adaId,
      tokenHash: hashRefreshToken(refresh.token),
      expiresAt: refresh.expiresAt,
    });
  });

  it('GET /users liste les profils essentiels sans données privées', async () => {
    const res = await request(app).get('/users');

    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.body, [
      {
        id: adaId.toString(),
        name: 'Lovelace',
        firstName: 'Ada',
        email: 'ada@exemple.fr',
      },
      {
        id: alanId.toString(),
        name: 'Byron',
        firstName: 'Alan',
        email: 'alan@exemple.fr',
      },
    ]);
    assert.strictEqual('password' in res.body[0], false);
    assert.strictEqual('role' in res.body[0], false);
  });

  it('GET /users/:id renvoie le profil public complet sans mot de passe', async () => {
    const res = await request(app).get(`/users/${adaId}`);

    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.body, {
      id: adaId.toString(),
      name: 'Lovelace',
      firstName: 'Ada',
      email: 'ada@exemple.fr',
      role: 'Adhérent',
      pronoun: 'Elle',
      phoneNumber: '0612345678',
      birthday: '1815-12-10T00:00:00.000Z',
      medicalCertificate: false,
      rightOfPublicity: true,
    });
  });

  it("GET /users/:id renvoie 404 si l'utilisateur n'existe pas", async () => {
    const res = await request(app).get(`/users/${UNKNOWN_ID}`);

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.message, 'Utilisateur introuvable');
  });

  it("GET /users/:id renvoie 400 si l'identifiant est mal formé", async () => {
    const res = await request(app).get('/users/pas-un-id');

    assert.strictEqual(res.status, 400);
  });

  it('GET /users/roles exige une authentification', async () => {
    const res = await request(app).get('/users/roles');
    assert.strictEqual(res.status, 401);
  });

  it('GET /users/roles refuse un utilisateur non administrateur', async () => {
    const res = await request(app).get('/users/roles').set('Authorization', `Bearer ${adaToken}`);
    assert.strictEqual(res.status, 403);
  });

  it('GET /users/roles liste les rôles pour un administrateur', async () => {
    const adminId = new ObjectId('000000000000000000000003');
    await db
      .getDb()
      .collection('users')
      .insertOne({
        _id: adminId,
        name: 'Babbage',
        firstName: 'Charles',
        email: 'charles@exemple.fr',
        password: await hashPassword('mot-de-passe'),
        role: 'Administrateur',
        pronoun: 'Il',
      });
    const token = signAccessToken({ _id: adminId, role: 'Administrateur' }, association);

    const res = await request(app).get('/users/roles').set('Authorization', `Bearer ${token}`);

    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.body, [
      'Administrateur',
      'Entraineur',
      'Capitaine',
      'Adhérent',
      'Visiteur',
    ]);
  });

  it('PATCH /users/:id attribue un rôle à un autre utilisateur', async () => {
    const adminId = new ObjectId('000000000000000000000003');
    await db
      .getDb()
      .collection('users')
      .insertOne({
        _id: adminId,
        name: 'Babbage',
        firstName: 'Charles',
        email: 'charles@exemple.fr',
        password: await hashPassword('mot-de-passe'),
        role: 'Administrateur',
        pronoun: 'Il',
      });
    const token = signAccessToken({ _id: adminId, role: 'Administrateur' }, association);

    const res = await request(app)
      .patch(`/users/${adaId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ role: 'Capitaine' });

    assert.strictEqual(res.status, 204);
    const updated = await db.getDb().collection('users').findOne({ _id: adaId });
    assert.strictEqual(updated.role, 'Capitaine');
  });

  it('PATCH /users/:id refuse un identifiant invalide', async () => {
    const token = signAccessToken({ _id: adaId, role: 'Administrateur' }, association);
    const res = await request(app)
      .patch('/users/pas-un-id')
      .set('Authorization', `Bearer ${token}`)
      .send({ role: 'Capitaine' });

    assert.strictEqual(res.status, 400);
  });

  it("PATCH /users/:id renvoie 404 si l'utilisateur n'existe pas", async () => {
    const adminId = new ObjectId('000000000000000000000003');
    await db
      .getDb()
      .collection('users')
      .insertOne({
        _id: adminId,
        name: 'Babbage',
        firstName: 'Charles',
        email: 'charles@exemple.fr',
        password: await hashPassword('mot-de-passe'),
        role: 'Administrateur',
        pronoun: 'Il',
      });
    const token = signAccessToken({ _id: adminId, role: 'Administrateur' }, association);

    const res = await request(app)
      .patch(`/users/${UNKNOWN_ID}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ role: 'Capitaine' });

    assert.strictEqual(res.status, 404);
  });

  it('PATCH /users/:id interdit à un administrateur de modifier son propre profil', async () => {
    const adminId = new ObjectId('000000000000000000000003');
    await db
      .getDb()
      .collection('users')
      .insertOne({
        _id: adminId,
        name: 'Babbage',
        firstName: 'Charles',
        email: 'charles@exemple.fr',
        password: await hashPassword('mot-de-passe'),
        role: 'Administrateur',
        pronoun: 'Il',
      });
    const token = signAccessToken({ _id: adminId, role: 'Administrateur' }, association);

    const res = await request(app)
      .patch(`/users/${adminId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ role: 'Capitaine' });

    assert.strictEqual(res.status, 403);
  });

  it('PATCH /users/:id refuse un non-administrateur', async () => {
    const res = await request(app)
      .patch(`/users/${alanId}`)
      .set('Authorization', `Bearer ${adaToken}`)
      .send({ role: 'Capitaine' });
    assert.strictEqual(res.status, 403);
  });

  it('PATCH /users/:id refuse un rôle inconnu', async () => {
    const adminId = new ObjectId('000000000000000000000003');
    await db
      .getDb()
      .collection('users')
      .insertOne({
        _id: adminId,
        name: 'Babbage',
        firstName: 'Charles',
        email: 'charles@exemple.fr',
        password: await hashPassword('mot-de-passe'),
        role: 'Administrateur',
        pronoun: 'Il',
      });
    const token = signAccessToken({ _id: adminId, role: 'Administrateur' }, association);

    const res = await request(app)
      .patch(`/users/${alanId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ role: 'Rôle-inconnu' });

    assert.strictEqual(res.status, 400);
  });

  it('GET /users/me renvoie le profil public du compte authentifié', async () => {
    const res = await request(app).get('/users/me').set('Authorization', `Bearer ${adaToken}`);

    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.body, {
      id: adaId.toString(),
      name: 'Lovelace',
      firstName: 'Ada',
      email: 'ada@exemple.fr',
      role: 'Adhérent',
      pronoun: 'Elle',
      phoneNumber: '0612345678',
      birthday: '1815-12-10T00:00:00.000Z',
      medicalCertificate: false,
      rightOfPublicity: true,
    });
    assert.strictEqual('password' in res.body, false);
  });

  it('GET /users/me renvoie 404 si le compte du token a été supprimé', async () => {
    const token = signAccessToken(
      {
        _id: new ObjectId(UNKNOWN_ID),
        role: 'Visiteur',
      },
      association,
    );
    const res = await request(app).get('/users/me').set('Authorization', `Bearer ${token}`);

    assert.strictEqual(res.status, 404);
  });

  it('les routes /users/me renvoient 400 si le sujet du token est mal formé', async () => {
    const token = signAccessToken(
      {
        _id: { toString: () => 'pas-un-identifiant-mongo' },
        role: 'Visiteur',
      },
      association,
    );

    const get = await request(app).get('/users/me').set('Authorization', `Bearer ${token}`);
    assert.strictEqual(get.status, 400);
    assert.strictEqual(get.body.message, 'Identifiant invalide');

    const patch = await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Ada Lovelace' });
    assert.strictEqual(patch.status, 400);
    assert.strictEqual(patch.body.message, 'Identifiant invalide');

    const remove = await request(app).delete('/users/me').set('Authorization', `Bearer ${token}`);
    assert.strictEqual(remove.status, 400);
    assert.strictEqual(remove.body.message, 'Identifiant invalide');

    const password = await request(app)
      .put('/users/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        old_password: 'ancien-mot-de-passe',
        new_password: 'nouveau-mot-de-passe',
      });
    assert.strictEqual(password.status, 400);
    assert.strictEqual(password.body.message, 'Identifiant invalide');
  });

  it('PATCH /users/me modifie uniquement les champs autorisés', async () => {
    const res = await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${adaToken}`)
      .send({
        name: 'Byron',
        firstName: 'Augusta',
        phoneNumber: '0600000000',
        birthday: '1815-12-11',
        pronoun: 'Iel',
        medicalCertificate: true,
        rightOfPublicity: false,
      });

    assert.strictEqual(res.status, 204);
    const updated = await db.getDb().collection('users').findOne({ _id: adaId });
    assert.strictEqual(updated.name, 'Byron');
    assert.strictEqual(updated.firstName, 'Augusta');
    assert.strictEqual(updated.phoneNumber, '0600000000');
    assert.strictEqual(updated.birthday.toISOString(), '1815-12-11T00:00:00.000Z');
    assert.strictEqual(updated.pronoun, 'Iel');
    assert.strictEqual(updated.medicalCertificate, true);
    assert.strictEqual(updated.rightOfPublicity, false);
    assert.strictEqual(updated.email, ada.email);
    assert.strictEqual(updated.role, ada.role);
    assert.strictEqual(await verifyPassword('ancien-mot-de-passe', updated.password), true);
  });

  it('PATCH /users/me accepte une mise à jour sans champ et ne modifie rien', async () => {
    const response = await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${adaToken}`)
      .send({});

    assert.strictEqual(response.status, 204);
    const unchanged = await db.getDb().collection('users').findOne({ _id: adaId });
    assert.strictEqual(unchanged.name, ada.name);
    assert.strictEqual(unchanged.firstName, ada.firstName);
    assert.strictEqual(unchanged.phoneNumber, ada.phoneNumber);
    assert.strictEqual(unchanged.birthday.toISOString(), ada.birthday.toISOString());
    assert.strictEqual(unchanged.pronoun, ada.pronoun);
  });

  it('PATCH /users/:id permet à un administrateur de modifier le profil ciblé', async () => {
    const adminId = new ObjectId('000000000000000000000003');
    await db
      .getDb()
      .collection('users')
      .insertOne({
        _id: adminId,
        name: 'Babbage',
        firstName: 'Charles',
        email: 'charles@exemple.fr',
        password: await hashPassword('mot-de-passe'),
        role: 'Administrateur',
        pronoun: 'Il',
      });
    const adminToken = signAccessToken({ _id: adminId, role: 'Administrateur' }, association);
    const usersApp = express();
    usersApp.use(express.json());
    usersApp.use('/users', createUsersRouter({ limit: 100 }));

    const res = await request(usersApp)
      .patch(`/users/${alanId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: 'alan.byron@exemple.fr',
        name: 'Byron',
        firstName: 'Augusta',
        birthday: '1815-12-11',
        pronoun: 'Elle',
        medicalCertificate: true,
        rightOfPublicity: false,
        role: 'Entraineur',
      });

    assert.strictEqual(res.status, 204);
    const updatedUser = await db.getDb().collection('users').findOne({ _id: alanId });
    assert.strictEqual(updatedUser.email, 'alan.byron@exemple.fr');
    assert.strictEqual(updatedUser.name, 'Byron');
    assert.strictEqual(updatedUser.firstName, 'Augusta');
    assert.strictEqual(updatedUser.birthday.toISOString(), '1815-12-11T00:00:00.000Z');
    assert.strictEqual(updatedUser.pronoun, 'Elle');
    assert.strictEqual(updatedUser.medicalCertificate, true);
    assert.strictEqual(updatedUser.rightOfPublicity, false);
    assert.strictEqual(updatedUser.role, 'Entraineur');

    const unchangedAdmin = await db.getDb().collection('users').findOne({ _id: adminId });
    assert.strictEqual(unchangedAdmin.email, 'charles@exemple.fr');
    assert.strictEqual(unchangedAdmin.role, 'Administrateur');
  });

  it('PATCH /users/:id renvoie 404 si le compte disparaît avant sa mise à jour', async () => {
    const adminId = new ObjectId('000000000000000000000003');
    await db
      .getDb()
      .collection('users')
      .insertOne({
        _id: adminId,
        name: 'Babbage',
        firstName: 'Charles',
        email: 'charles@exemple.fr',
        password: await hashPassword('mot-de-passe'),
        role: 'Administrateur',
        pronoun: 'Il',
      });
    const adminToken = signAccessToken({ _id: adminId, role: 'Administrateur' }, association);
    const originalUpdateOne = User.updateOne;
    User.updateOne = async () => ({ matchedCount: 0 });

    try {
      const response = await request(app)
        .patch(`/users/${alanId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'Entraineur' });
      assert.strictEqual(response.status, 404);
      assert.strictEqual(response.body.message, 'Utilisateur introuvable');
    } finally {
      User.updateOne = originalUpdateOne;
    }
  });

  it('PATCH /users/me renvoie 404 si le compte n’existe plus', async () => {
    const token = signAccessToken(
      {
        _id: new ObjectId(UNKNOWN_ID),
        role: 'Visiteur',
      },
      association,
    );
    const res = await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Nouveau nom' });

    assert.strictEqual(res.status, 404);
  });

  it('DELETE /users/me supprime le compte authentifié', async () => {
    const res = await request(app).delete('/users/me').set('Authorization', `Bearer ${adaToken}`);

    assert.strictEqual(res.status, 204);
    assert.strictEqual(await db.getDb().collection('users').findOne({ _id: adaId }), null);
    assert.strictEqual(await RefreshToken.findOne({ userId: adaId }), null);
    const refreshAfterDelete = await request(app)
      .post('/auth/refresh')
      .send({ refresh_token: adaRefreshToken });
    assert.strictEqual(refreshAfterDelete.status, 401);
    const subsequentGet = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${adaToken}`);
    assert.strictEqual(subsequentGet.status, 404);
  });

  it('DELETE /users/me renvoie 404 si le compte n’existe plus', async () => {
    const token = signAccessToken(
      {
        _id: new ObjectId(UNKNOWN_ID),
        role: 'Visiteur',
      },
      association,
    );
    const res = await request(app).delete('/users/me').set('Authorization', `Bearer ${token}`);

    assert.strictEqual(res.status, 404);
  });

  it('DELETE /users/me interdit la suppression du dernier administrateur', async () => {
    await db
      .getDb()
      .collection('users')
      .updateOne({ _id: adaId }, { $set: { role: 'Administrateur' } });
    const adminToken = signAccessToken({ _id: adaId, role: 'Administrateur' }, association);

    const res = await request(app).delete('/users/me').set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.message, 'Interdiction de supprimer le dernier administrateur');
    assert.ok(await db.getDb().collection('users').findOne({ _id: adaId }));
  });

  it('DELETE /users/me permet la suppression d’un administrateur quand un autre existe', async () => {
    await db
      .getDb()
      .collection('users')
      .updateOne({ _id: adaId }, { $set: { role: 'Administrateur' } });
    await db
      .getDb()
      .collection('users')
      .updateOne({ _id: alanId }, { $set: { role: 'Administrateur' } });
    const adminToken = signAccessToken({ _id: adaId, role: 'Administrateur' }, association);

    const res = await request(app).delete('/users/me').set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(res.status, 204);
    assert.strictEqual(await db.getDb().collection('users').findOne({ _id: adaId }), null);
  });

  it('PUT /users/me/password vérifie le mot de passe actuel avant de le remplacer', async () => {
    const wrongPassword = await request(app)
      .put('/users/me/password')
      .set('Authorization', `Bearer ${adaToken}`)
      .send({ old_password: 'incorrect', new_password: 'nouveau-mot-de-passe' });
    assert.strictEqual(wrongPassword.status, 401);

    const changed = await request(app)
      .put('/users/me/password')
      .set('Authorization', `Bearer ${adaToken}`)
      .send({ old_password: 'ancien-mot-de-passe', new_password: 'nouveau-mot-de-passe' });
    assert.strictEqual(changed.status, 204);

    const stored = await db.getDb().collection('users').findOne({ _id: adaId });
    assert.strictEqual(await verifyPassword('ancien-mot-de-passe', stored.password), false);
    assert.strictEqual(await verifyPassword('nouveau-mot-de-passe', stored.password), true);
    assert.strictEqual(await RefreshToken.findOne({ userId: adaId }), null);
    const refreshAfterPasswordChange = await request(app)
      .post('/auth/refresh')
      .send({ refresh_token: adaRefreshToken });
    assert.strictEqual(refreshAfterPasswordChange.status, 401);
  });

  it('PUT /users/me/password renvoie 404 si le compte n’existe plus', async () => {
    const token = signAccessToken(
      {
        _id: new ObjectId(UNKNOWN_ID),
        role: 'Visiteur',
      },
      association,
    );
    const res = await request(app)
      .put('/users/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ old_password: 'ancien', new_password: 'nouveau' });

    assert.strictEqual(res.status, 404);
  });

  it('PUT /users/me/password renvoie 409 si le mot de passe a changé entre-temps', async () => {
    const User = require('../db/models/user');
    const original = User.updateOne.bind(User);
    User.updateOne = async () => ({ matchedCount: 0 });

    try {
      const res = await request(app)
        .put('/users/me/password')
        .set('Authorization', `Bearer ${adaToken}`)
        .send({ old_password: 'ancien-mot-de-passe', new_password: 'nouveau-mot-de-passe' });
      assert.strictEqual(res.status, 409);
    } finally {
      User.updateOne = original;
    }
  });

  it('verifyPassword retourne false pour un hash non-string', async () => {
    assert.strictEqual(await verifyPassword('password', null), false);
    assert.strictEqual(await verifyPassword('password', 42), false);
  });

  it('verifyPassword retourne false pour un hash mal forme', async () => {
    assert.strictEqual(await verifyPassword('password', 'pas-un-hash-valide'), false);
    assert.strictEqual(await verifyPassword('password', 'aaaa:bbbb'), false);
  });

  it('GET /users renvoie 500 et loggue pour une erreur interne sans status', async () => {
    const User = require('../db/models/user');
    const original = User.find.bind(User);
    User.find = () => {
      throw new Error('internal error without status');
    };

    try {
      const res = await request(app).get('/users');
      assert.strictEqual(res.status, 500);
    } finally {
      User.find = original;
    }
  });

  it("le gestionnaire d'erreur ignore les reponses deja envoyees", () => {
    const { handleError } = require('../index');
    const mockRes = {
      headersSent: true,
      status() {
        throw new Error('status ne doit pas etre appele');
      },
      json() {
        throw new Error('json ne doit pas etre appele');
      },
    };
    handleError(new Error('already sent'), {}, mockRes, () => {});
  });

  it("le gestionnaire d'erreur respecte le status explicite et transmet les erreurs", () => {
    const { handleError } = require('../index');
    let responseStatus;
    let responseBody;
    const mockRes = {
      headersSent: false,
      status(status) {
        responseStatus = status;
        return this;
      },
      json(body) {
        responseBody = body;
      },
    };

    handleError(
      Object.assign(new Error('invalid request'), { status: 422, errors: ['invalid field'] }),
      {},
      mockRes,
      () => {},
    );

    assert.strictEqual(responseStatus, 422);
    assert.deepStrictEqual(responseBody, {
      message: 'invalid request',
      errors: ['invalid field'],
    });
  });
});

const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { ObjectId } = require('mongodb');
const db = require('../db/db');
const app = require('../index');
const { signAccessToken } = require('../controllers/services/auth-middleware');
const { hashPassword, verifyPassword } = require('../controllers/services/password');

const ada = {
  name: 'Lovelace',
  firstName: 'Ada',
  email: 'ada@exemple.fr',
  password: 'hash-secret',
  role: 'Adhérent',
  pronoun: 'Elle',
  phoneNumber: '0612345678',
  birthday: new Date('1815-12-10T00:00:00.000Z'),
};
const UNKNOWN_ID = '000000000000000000000000';

describe('/users (avec un vrai mongod)', () => {
  let mongod;
  let adaId;
  let alanId;
  let adaToken;
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
    adaToken = signAccessToken({ _id: adaId, role: ada.role });
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
    });
    assert.strictEqual('password' in res.body, false);
  });

  it('GET /users/me renvoie 404 si le compte du token a été supprimé', async () => {
    const token = signAccessToken({
      _id: new ObjectId(UNKNOWN_ID),
      role: 'Visiteur',
    });
    const res = await request(app).get('/users/me').set('Authorization', `Bearer ${token}`);

    assert.strictEqual(res.status, 404);
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
      });

    assert.strictEqual(res.status, 204);
    const updated = await db.getDb().collection('users').findOne({ _id: adaId });
    assert.strictEqual(updated.name, 'Byron');
    assert.strictEqual(updated.firstName, 'Augusta');
    assert.strictEqual(updated.phoneNumber, '0600000000');
    assert.strictEqual(updated.birthday.toISOString(), '1815-12-11T00:00:00.000Z');
    assert.strictEqual(updated.pronoun, 'Iel');
    assert.strictEqual(updated.email, ada.email);
    assert.strictEqual(updated.role, ada.role);
    assert.strictEqual(await verifyPassword('ancien-mot-de-passe', updated.password), true);
  });

  it('PATCH /users/me renvoie 404 si le compte n’existe plus', async () => {
    const token = signAccessToken({
      _id: new ObjectId(UNKNOWN_ID),
      role: 'Visiteur',
    });
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
    const subsequentGet = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${adaToken}`);
    assert.strictEqual(subsequentGet.status, 404);
  });

  it('DELETE /users/me renvoie 404 si le compte n’existe plus', async () => {
    const token = signAccessToken({
      _id: new ObjectId(UNKNOWN_ID),
      role: 'Visiteur',
    });
    const res = await request(app).delete('/users/me').set('Authorization', `Bearer ${token}`);

    assert.strictEqual(res.status, 404);
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
  });

  it('PUT /users/me/password renvoie 404 si le compte n’existe plus', async () => {
    const token = signAccessToken({
      _id: new ObjectId(UNKNOWN_ID),
      role: 'Visiteur',
    });
    const res = await request(app)
      .put('/users/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ old_password: 'ancien', new_password: 'nouveau' });

    assert.strictEqual(res.status, 404);
  });
});

const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { ObjectId } = require('mongodb');
const db = require('../db/db');
const app = require('../index');

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

  before(async () => {
    mongod = await MongoMemoryServer.create();
    await db.connect({ uri: mongod.getUri(), dbName: 'users-test' });
  });

  after(async () => {
    await db.close();
    await mongod.stop();
  });

  beforeEach(async () => {
    const collection = db.getDb().collection('users');
    await collection.deleteMany({});
    adaId = new ObjectId('000000000000000000000001');
    alanId = new ObjectId('000000000000000000000002');
    await collection.insertOne({ ...ada, _id: adaId });
    await collection.insertOne({
      _id: alanId,
      name: 'Byron',
      firstName: 'Alan',
      email: 'alan@exemple.fr',
      password: 'another-secret',
      role: 'Adhérent',
      pronoun: 'Il',
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
});

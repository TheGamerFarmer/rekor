const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const db = require('../db');
const { ensureSchema } = require('../schema');
const app = require('../index');

const ada = { email: 'ada@exemple.fr', name: 'Ada' };
const UNKNOWN_ID = '000000000000000000000000';

describe('/users (avec un vrai mongod)', () => {
  let mongod;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    await db.connect({ uri: mongod.getUri(), dbName: 'test' });
    await ensureSchema(db.getDb());
  });

  after(async () => {
    await db.close();
    await mongod.stop();
  });

  beforeEach(async () => {
    await db.getDb().collection('users').deleteMany({});
  });

  it('POST /users enregistre un utilisateur', async () => {
    const res = await request(app).post('/users').send(ada);

    assert.strictEqual(res.status, 201);
    assert.match(res.body.id, /^[0-9a-f]{24}$/);
    assert.strictEqual(res.body.email, ada.email);
    assert.strictEqual(res.body.name, ada.name);

    // il est bien dans la base
    const stored = await db.getDb().collection('users').findOne({ email: ada.email });
    assert.strictEqual(stored._id.toString(), res.body.id);
  });

  it("GET /users/:id récupère l'utilisateur enregistré", async () => {
    const created = await request(app).post('/users').send(ada);

    const res = await request(app).get(`/users/${created.body.id}`);

    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.body, created.body);
  });

  it('GET /users liste les utilisateurs', async () => {
    await request(app).post('/users').send(ada);
    await request(app).post('/users').send({ email: 'alan@exemple.fr', name: 'Alan' });

    const res = await request(app).get('/users');

    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(
      res.body.map((u) => u.name),
      ['Ada', 'Alan'],
    );
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

  it("POST /users renvoie 400 s'il manque un champ", async () => {
    const res = await request(app).post('/users').send({ email: ada.email });

    assert.strictEqual(res.status, 400);
  });

  it("POST /users renvoie 400 si l'e-mail est invalide", async () => {
    const res = await request(app).post('/users').send({ email: 'pas-un-email', name: 'Ada' });

    assert.strictEqual(res.status, 400);
  });

  it('la base refuse elle-même un document sans nom', async () => {
    await assert.rejects(
      db.getDb().collection('users').insertOne({ email: 'sans-nom@exemple.fr' }),
      /Document failed validation/,
    );
  });

  it("POST /users renvoie 409 si l'e-mail existe déjà", async () => {
    await request(app).post('/users').send(ada);

    const res = await request(app)
      .post('/users')
      .send({ ...ada, name: 'Autre Ada' });

    assert.strictEqual(res.status, 409);
    assert.strictEqual(await db.getDb().collection('users').countDocuments(), 1);
  });
});

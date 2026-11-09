const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const { setup, teardown } = require('./helpers');

const valid = {
  name: 'Lovelace',
  firstName: 'Ada',
  email: 'ada@exemple.fr',
  password: 'motdepasse',
  role: 'Adhérent',
  pronoun: 'Elle',
};

describe('collection user', () => {
  let mongod, col;

  before(async () => {
    const res = await setup();
    mongod = res.mongod;
    col = res.database.collection('user');
  });
  after(() => teardown(mongod));
  beforeEach(() => col.deleteMany({}));

  it('accepte un document valide', async () => {
    await assert.doesNotReject(col.insertOne({ ...valid }));
  });

  for (const field of ['name', 'firstName', 'email', 'password', 'role', 'pronoun']) {
    it(`refuse sans ${field}`, async () => {
      const doc = { ...valid };
      delete doc[field];
      await assert.rejects(col.insertOne(doc), /Document failed validation/);
    });
  }

  it('refuse un rôle invalide', async () => {
    await assert.rejects(
      col.insertOne({ ...valid, role: 'SuperAdmin' }),
      /Document failed validation/,
    );
  });

  it('refuse un pronom invalide', async () => {
    await assert.rejects(
      col.insertOne({ ...valid, pronoun: 'inconnu' }),
      /Document failed validation/,
    );
  });

  it('refuse un doublon (même combo identité)', async () => {
    await col.insertOne({ ...valid });
    await assert.rejects(col.insertOne({ ...valid }), /duplicate key/);
  });
});

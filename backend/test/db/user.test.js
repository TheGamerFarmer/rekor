const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const { ObjectId } = require('mongodb');
const { setup, teardown } = require('./helpers');
const User = require('../../db/models/user');
const { userContext } = require('../../db/plugins/audit');
const { USER_ROLE, USER_PRONOUN } = require('../../db/enums');

const valid = {
  name: 'Lovelace',
  firstName: 'Ada',
  email: 'ada@exemple.fr',
  password: 'motdepasse',
  role: USER_ROLE.ADHERENT,
  pronoun: USER_PRONOUN.ELLE,
};

describe('collection user', () => {
  let mongod;

  before(async () => {
    const res = await setup();
    mongod = res.mongod;
  });
  after(() => teardown(mongod));
  beforeEach(() => User.deleteMany({}));

  it('accepte un document valide', async () => {
    await assert.doesNotReject(User.create({ ...valid }));
  });

  it('accepte chaque rôle et pronom défini par les enums', async () => {
    for (const [index, role] of Object.values(USER_ROLE).entries()) {
      await assert.doesNotReject(
        User.create({ ...valid, email: `role-${index}@exemple.fr`, role }),
      );
    }

    await User.deleteMany({});
    for (const [index, pronoun] of Object.values(USER_PRONOUN).entries()) {
      await assert.doesNotReject(
        User.create({ ...valid, email: `pronoun-${index}@exemple.fr`, pronoun }),
      );
    }
  });

  for (const field of ['name', 'firstName', 'email', 'password', 'role', 'pronoun']) {
    it(`refuse sans ${field}`, async () => {
      const doc = { ...valid };
      delete doc[field];
      await assert.rejects(User.create(doc), /ValidationError/);
    });
  }

  it('refuse un rôle invalide', async () => {
    await assert.rejects(User.create({ ...valid, role: 'SuperAdmin' }), /ValidationError/);
  });

  it('refuse un pronom invalide', async () => {
    await assert.rejects(User.create({ ...valid, pronoun: 'inconnu' }), /ValidationError/);
  });

  it('refuse un doublon (même combo identité)', async () => {
    await User.create({ ...valid });
    await assert.rejects(User.create({ ...valid }), /duplicate key/);
  });

  it('le hook de mise à jour crée $set si absent dans la requête', async () => {
    await User.create({ ...valid, email: 'nset@exemple.fr', phoneNumber: '0600000000' });
    await User.updateOne({ email: 'nset@exemple.fr' }, { $unset: { phoneNumber: '' } });
    const updated = await User.findOne({ email: 'nset@exemple.fr' });
    assert.ok(updated.updated_at instanceof Date);
    assert.strictEqual(updated.phoneNumber, undefined);
  });

  it('renseigne created_by et updated_by depuis le contexte de requête', async () => {
    const userId = new ObjectId();

    await new Promise((resolve, reject) => {
      userContext.run({ userId: userId.toString() }, async () => {
        try {
          const user = await User.create({ ...valid, email: 'audit@exemple.fr' });
          assert.strictEqual(user.created_by.toString(), userId.toString());
          assert.strictEqual(user.updated_by.toString(), userId.toString());
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  });
});

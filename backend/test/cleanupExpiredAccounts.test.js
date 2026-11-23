const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { ObjectId } = require('mongodb');
const db = require('../db/db');
const User = require('../db/models/user');
const Registration = require('../db/models/registration');
const { cleanupExpiredAccounts } = require('../jobs/cleanupExpiredAccounts');

function dateMonthsAgo(months) {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d;
}

const baseUser = {
  name: 'Test',
  firstName: 'User',
  email: 'test@exemple.fr',
  password: 'hash',
  pronoun: 'Il',
};

describe('cleanupExpiredAccounts', () => {
  let mongod;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    await db.connect({ uri: mongod.getUri(), dbName: 'cleanup-test' });
  });

  after(async () => {
    await db.close();
    await mongod.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Registration.deleteMany({});
  });

  // --- Visiteurs ---

  it('supprime un Visiteur créé il y a plus de 2 mois', async () => {
    const id = new ObjectId();
    await User.collection.insertOne({
      ...baseUser,
      _id: id,
      email: 'visiteur-vieux@exemple.fr',
      role: 'Visiteur',
      created_at: dateMonthsAgo(3),
    });

    await cleanupExpiredAccounts();

    assert.strictEqual(await User.findById(id), null);
  });

  it('conserve un Visiteur créé il y a moins de 2 mois', async () => {
    const id = new ObjectId();
    await User.collection.insertOne({
      ...baseUser,
      _id: id,
      email: 'visiteur-recent@exemple.fr',
      role: 'Visiteur',
      created_at: dateMonthsAgo(1),
    });

    await cleanupExpiredAccounts();

    assert.notStrictEqual(await User.findById(id), null);
  });

  it('conserve un Visiteur créé exactement il y a 2 mois moins un jour', async () => {
    const d = dateMonthsAgo(2);
    d.setDate(d.getDate() + 1);
    const id = new ObjectId();
    await User.collection.insertOne({
      ...baseUser,
      _id: id,
      email: 'visiteur-limite@exemple.fr',
      role: 'Visiteur',
      created_at: d,
    });

    await cleanupExpiredAccounts();

    assert.notStrictEqual(await User.findById(id), null);
  });

  // --- Autres rôles ---

  it('supprime un Adhérent créé il y a plus de 14 mois sans inscription récente', async () => {
    const id = new ObjectId();
    await User.collection.insertOne({
      ...baseUser,
      _id: id,
      email: 'adherent-expire@exemple.fr',
      role: 'Adhérent',
      created_at: dateMonthsAgo(15),
    });

    await cleanupExpiredAccounts();

    assert.strictEqual(await User.findById(id), null);
  });

  it("conserve un Adhérent créé il y a plus de 14 mois s'il a une inscription récente", async () => {
    const id = new ObjectId();
    await User.collection.insertOne({
      ...baseUser,
      _id: id,
      email: 'adherent-actif@exemple.fr',
      role: 'Adhérent',
      created_at: dateMonthsAgo(15),
    });
    const assocId = new ObjectId();
    await Registration.collection.insertOne({
      association: assocId,
      created_by: id,
      created_at: dateMonthsAgo(1),
    });

    await cleanupExpiredAccounts();

    assert.notStrictEqual(await User.findById(id), null);
  });

  it('conserve un Adhérent créé il y a moins de 14 mois sans inscription', async () => {
    const id = new ObjectId();
    await User.collection.insertOne({
      ...baseUser,
      _id: id,
      email: 'adherent-recent@exemple.fr',
      role: 'Adhérent',
      created_at: dateMonthsAgo(10),
    });

    await cleanupExpiredAccounts();

    assert.notStrictEqual(await User.findById(id), null);
  });

  it("supprime un Entraîneur expiré sans inscription récente et conserve l'actif", async () => {
    const expiredId = new ObjectId();
    const activeId = new ObjectId();
    const assocId = new ObjectId();

    await User.collection.insertMany([
      {
        ...baseUser,
        _id: expiredId,
        email: 'entraineur-expire@exemple.fr',
        role: 'Entraineur',
        created_at: dateMonthsAgo(15),
      },
      {
        ...baseUser,
        _id: activeId,
        email: 'entraineur-actif@exemple.fr',
        role: 'Entraineur',
        created_at: dateMonthsAgo(15),
      },
    ]);
    await Registration.collection.insertOne({
      association: assocId,
      created_by: activeId,
      created_at: dateMonthsAgo(1),
    });

    await cleanupExpiredAccounts();

    assert.strictEqual(await User.findById(expiredId), null);
    assert.notStrictEqual(await User.findById(activeId), null);
  });

  it('ne supprime pas les Visiteurs récents lors du nettoyage des autres rôles', async () => {
    const visiteurId = new ObjectId();
    await User.collection.insertOne({
      ...baseUser,
      _id: visiteurId,
      email: 'visiteur-safe@exemple.fr',
      role: 'Visiteur',
      created_at: dateMonthsAgo(1),
    });

    await cleanupExpiredAccounts();

    assert.notStrictEqual(await User.findById(visiteurId), null);
  });

  it("ne tient pas compte d'une inscription trop ancienne (>14 mois)", async () => {
    const id = new ObjectId();
    const assocId = new ObjectId();
    await User.collection.insertOne({
      ...baseUser,
      _id: id,
      email: 'adherent-vieille-inscription@exemple.fr',
      role: 'Adhérent',
      created_at: dateMonthsAgo(20),
    });
    await Registration.collection.insertOne({
      association: assocId,
      created_by: id,
      created_at: dateMonthsAgo(15),
    });

    await cleanupExpiredAccounts();

    assert.strictEqual(await User.findById(id), null);
  });
});

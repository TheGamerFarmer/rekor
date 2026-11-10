const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { MongoMemoryServer } = require('mongodb-memory-server');
const db = require('../db/db');
const { ensureSchema } = require('../db/schema');

const EXPECTED_COLLECTIONS = [
  'users',
  'set',
  'match',
  'event',
  'team',
  'group',
  'message',
  'carpool',
  'association',
  'document',
  'bank_operation',
  'publication',
  'media',
  'participant',
  'group_member',
  'carpooler',
  'carpool_payment',
  'registration',
  'bank_operation_document',
  'statistic',
  'operation',
  'user_stat',
  'team_stat',
  'position',
  'category',
  'statistic_category',
  'player_position',
  'referee',
];

describe('ensureSchema', () => {
  let mongod;
  let database;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    await db.connect({ uri: mongod.getUri(), dbName: 'test' });
    database = db.getDb();
    await ensureSchema();
  });

  after(async () => {
    await db.close();
    await mongod.stop();
  });

  it('crée toutes les collections attendues', async () => {
    const existing = await database.listCollections({}, { nameOnly: true }).toArray();
    const names = existing.map((c) => c.name);
    for (const col of EXPECTED_COLLECTIONS) {
      assert.ok(names.includes(col), `Collection manquante : ${col}`);
    }
  });

  it('est idempotente (peut tourner deux fois sans erreur)', async () => {
    await assert.doesNotReject(ensureSchema());
  });

  it('propage les erreurs inattendues de createCollection', async () => {
    const mongoose = require('mongoose');
    const firstModelName = Object.keys(mongoose.models)[0];
    const Model = mongoose.models[firstModelName];
    const original = Model.createCollection.bind(Model);
    Model.createCollection = async () => {
      throw Object.assign(new Error('disk full'), { codeName: 'DiskFull' });
    };

    try {
      await assert.rejects(ensureSchema(), /disk full/);
    } finally {
      Model.createCollection = original;
    }
  });
});

const test = require('node:test');
const assert = require('node:assert');
const { MongoMemoryServer } = require('mongodb-memory-server');
const db = require('../db');

test('getDb() échoue tant que connect() n\'a pas été appelé', () => {
  assert.throws(() => db.getDb(), /n'est pas connectée/);
});

test('connect() sans URI est refusé clairement', async () => {
  await assert.rejects(db.connect({ uri: undefined }), /MONGODB_URI est requis/);
});

test('connect() abandonne après les essais si la base est injoignable', async () => {
  await assert.rejects(db.connect({ uri: 'mongodb://127.0.0.1:1', retries: 2, delayMs: 10 }));
});

test('écrit et relit un document dans un vrai mongod', async (t) => {
  const mongod = await MongoMemoryServer.create();
  t.after(async () => {
    await db.close();
    await mongod.stop();
  });

  await db.connect({ uri: mongod.getUri(), dbName: 'test' });

  const notes = db.getDb().collection('notes');
  await notes.insertOne({ text: 'bonjour' });
  const found = await notes.findOne({ text: 'bonjour' });

  assert.strictEqual(found.text, 'bonjour');
});

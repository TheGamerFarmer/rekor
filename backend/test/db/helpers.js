const { MongoMemoryServer } = require('mongodb-memory-server');
const db = require('../../db/db');
const { ensureSchema } = require('../../db/schema');

async function setup() {
  const mongod = await MongoMemoryServer.create();
  await db.connect({ uri: mongod.getUri(), dbName: 'test' });
  const database = db.getDb();
  await ensureSchema(database);
  return { mongod, database };
}

async function teardown(mongod) {
  await db.close();
  await mongod.stop();
}

module.exports = { setup, teardown };

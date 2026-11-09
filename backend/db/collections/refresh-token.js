async function createCollection(db) {
  await db.createCollection('refresh_tokens', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['_id', 'userId', 'tokenHash', 'expiresAt'],
        properties: {
          _id: { bsonType: 'string' },
          userId: { bsonType: 'objectId' },
          tokenHash: { bsonType: 'string' },
          expiresAt: { bsonType: 'date' },
        },
      },
    },
  });

  await db.collection('refresh_tokens').createIndex({ tokenHash: 1 }, { unique: true });
  await db.collection('refresh_tokens').createIndex({ userId: 1 });
  await db.collection('refresh_tokens').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}

module.exports = { createCollection };

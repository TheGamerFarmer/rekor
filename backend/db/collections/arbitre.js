async function createCollection(db) {
  await db.createCollection('referee', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['user', 'match'],
        properties: {
          user: { bsonType: 'objectId' },
          match: { bsonType: 'objectId' },
        },
      },
    },
  });

  await db.collection('referee').createIndex({ user: 1, match: 1 }, { unique: true });
}

module.exports = { createCollection };

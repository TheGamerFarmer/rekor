async function createCollection(db) {
  await db.createCollection('set', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['number', 'match'],
        properties: {
          number: { bsonType: 'int' },
          match: { bsonType: 'objectID' },
        },
      },
    },
  });

  await db.collection('set').createIndex({ number: 1, match: 1 }, { unique: true });
}

module.exports = { createCollection };

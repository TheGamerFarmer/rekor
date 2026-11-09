async function createCollection(db) {
  await db.createCollection('match', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['event', 'opponent'],
        properties: {
          event: { bsonType: 'objectId' },
          opponent: { bsonType: 'string' },
        },
      },
    },
  });

  await db.collection('match').createIndex({ event: 1, opponent: 1 }, { unique: true });
}

module.exports = { createCollection };

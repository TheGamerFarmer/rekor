async function createCollection(db) {
  await db.createCollection('participant', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['user', 'event'],
        properties: {
          user: { bsonType: 'objectId' },
          event: { bsonType: 'objectId' },
        },
      },
    },
  });

  await db.collection('participant').createIndex({ user: 1, event: 1 }, { unique: true });
}

module.exports = { createCollection };

async function createCollection(db) {
  await db.createCollection('team', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'leader'],
        properties: {
          name: { bsonType: 'string' },
          leader: { bsonType: 'objectId' },
        },
      },
    },
  });

  await db.collection('team').createIndex({ name: 1, leader: 1 }, { unique: true });
}

module.exports = { createCollection };

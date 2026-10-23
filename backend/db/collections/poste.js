async function createCollection(db) {
  await db.createCollection('position', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['name'],
        properties: {
          name: { bsonType: 'string' },
        },
      },
    },
  });

  await db.collection('position').createIndex({ name: 1 }, { unique: true });
}

module.exports = { createCollection };

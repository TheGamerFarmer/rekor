async function createCollection(db) {
  await db.createCollection('operation', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'formula'],
        properties: {
          name: { bsonType: 'string' },
          formula: { bsonType: 'string' },
        },
      },
    },
  });

  await db.collection('operation').createIndex({ name: 1 }, { unique: true });
}

module.exports = { createCollection };

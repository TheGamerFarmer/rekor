async function createCollection(db) {
  await db.createCollection('category', {
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

  await db.collection('category').createIndex({ name: 1 }, { unique: true });
}

module.exports = { createCollection };

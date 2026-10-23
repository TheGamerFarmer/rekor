async function createCollection(db) {
  await db.createCollection('association', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'address'],
        properties: {
          name: { bsonType: 'string' },
          address: { bsonType: 'string' },
        },
      },
    },
  });

  await db.collection('association').createIndex({ name: 1, address: 1 }, { unique: true });
}

module.exports = { createCollection };

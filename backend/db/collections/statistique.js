async function createCollection(db) {
  await db.createCollection('statistic', {
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
}

module.exports = { createCollection };

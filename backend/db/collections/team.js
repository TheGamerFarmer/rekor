async function createCollection(db) {
  await db.createCollection('team', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'leader'],
        properties: {
          name: { bsonType: 'string' },
          leader: { bsonType: 'objectID' },
        },
      },
    },
  });
}

module.exports = { createCollection };

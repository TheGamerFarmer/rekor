async function createCollection(db) {
  await db.createCollection('group', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'created_at', 'owner'],
        properties: {
          name: { bsonType: 'string' },
          created_at: { bsonType: 'date' },
          owner: { bsonType: 'objectId' },
        },
      },
    },
  });

  await db.collection('group').createIndex({ name: 1, created_at: 1, owner: 1 }, { unique: true });
}

module.exports = { createCollection };

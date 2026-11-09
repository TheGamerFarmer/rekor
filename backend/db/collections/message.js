async function createCollection(db) {
  await db.createCollection('message', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['group', 'user', 'date', 'body'],
        properties: {
          group: { bsonType: 'objectId' },
          user: { bsonType: 'objectId' },
          date: { bsonType: 'date' },
          body: { bsonType: 'string' },
        },
      },
    },
  });

  await db
    .collection('message')
    .createIndex({ group: 1, user: 1, date: 1, body: 1 }, { unique: true });
}

module.exports = { createCollection };

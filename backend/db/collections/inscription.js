async function createCollection(db) {
  await db.createCollection('registration', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['association', 'user', 'date'],
        properties: {
          association: { bsonType: 'objectId' },
          user: { bsonType: 'objectId' },
          date: { bsonType: 'date' },
        },
      },
    },
  });

  await db
    .collection('registration')
    .createIndex({ association: 1, user: 1, date: 1 }, { unique: true });
}

module.exports = { createCollection };

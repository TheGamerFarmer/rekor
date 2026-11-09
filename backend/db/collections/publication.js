async function createCollection(db) {
  await db.createCollection('publication', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['title', 'body', 'date', 'association'],
        properties: {
          title: { bsonType: 'string' },
          body: { bsonType: 'string' },
          date: { bsonType: 'date' },
          association: { bsonType: 'objectId' },
        },
      },
    },
  });

  await db
    .collection('publication')
    .createIndex({ title: 1, body: 1, date: 1, association: 1 }, { unique: true });
}

module.exports = { createCollection };

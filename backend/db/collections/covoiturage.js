async function createCollection(db) {
  await db.createCollection('carpool', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['maxSeats', 'electric', 'group'],
        properties: {
          maxSeats: { bsonType: 'int' },
          electric: { bsonType: 'bool' },
          group: { bsonType: 'objectId' },
        },
      },
    },
  });
}

module.exports = { createCollection };

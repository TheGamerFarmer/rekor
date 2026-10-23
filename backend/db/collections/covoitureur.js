async function createCollection(db) {
  await db.createCollection('carpooler', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['user', 'carpool', 'takenSeats'],
        properties: {
          user: { bsonType: 'objectId' },
          carpool: { bsonType: 'objectId' },
          takenSeats: { bsonType: 'int' },
        },
      },
    },
  });

  await db.collection('carpooler').createIndex({ user: 1, carpool: 1 }, { unique: true });
}

module.exports = { createCollection };

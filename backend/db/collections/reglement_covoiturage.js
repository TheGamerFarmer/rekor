async function createCollection(db) {
  await db.createCollection('carpool_payment', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['user', 'carpool', 'date', 'amount'],
        properties: {
          user: { bsonType: 'objectId' },
          carpool: { bsonType: 'objectId' },
          date: { bsonType: 'date' },
          amount: { bsonType: 'double' },
        },
      },
    },
  });
}

module.exports = { createCollection };

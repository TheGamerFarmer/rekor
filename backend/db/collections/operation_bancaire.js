async function createCollection(db) {
  await db.createCollection('bank_operation', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['amount', 'comment', 'date'],
        properties: {
          amount: { bsonType: 'double' },
          comment: { bsonType: 'string' },
          date: { bsonType: 'date' },
        },
      },
    },
  });
}

module.exports = { createCollection };

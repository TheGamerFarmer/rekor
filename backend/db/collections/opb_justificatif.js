async function createCollection(db) {
  await db.createCollection('bank_operation_document', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['document', 'bankOperation'],
        properties: {
          document: { bsonType: 'objectId' },
          bankOperation: { bsonType: 'objectId' },
        },
      },
    },
  });

  await db
    .collection('bank_operation_document')
    .createIndex({ document: 1, bankOperation: 1 }, { unique: true });
}

module.exports = { createCollection };

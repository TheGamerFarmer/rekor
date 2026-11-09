async function createCollection(db) {
  await db.createCollection('document', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['fileName', 'type', 'uploadDate', 'association', 'user'],
        properties: {
          fileName: { bsonType: 'string' },
          type: { enum: ['Facture', 'Certificat_médical', 'Autre'] },
          uploadDate: { bsonType: 'date' },
          association: { bsonType: 'objectId' },
          user: { bsonType: 'objectId' },
        },
      },
    },
  });

  await db.collection('document').createIndex({ fileName: 1 }, { unique: true });
}

module.exports = { createCollection };

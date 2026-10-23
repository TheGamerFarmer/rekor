async function createCollection(db) {
  await db.createCollection('media', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'type', 'publication'],
        properties: {
          name: { bsonType: 'string' },
          type: { enum: ['Vidéo', 'Image'] },
          publication: { bsonType: 'objectId' },
        },
      },
    },
  });
}

module.exports = { createCollection };

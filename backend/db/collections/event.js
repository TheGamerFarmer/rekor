async function createCollection(db) {
  await db.createCollection('event', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['date', 'place', 'type', 'name', 'description', 'group'],
        properties: {
          date: { bsonType: 'date' },
          place: { bsonType: 'string' },
          type: { enum: ['Entrainement', 'Match-amical', 'Match-compétitif', 'Réunion', 'Autre'] },
          name: { bsonType: 'string' },
          description: { bsonType: 'string' },
          group: { bsonType: 'objectId' },
        },
      },
    },
  });
}

module.exports = { createCollection };

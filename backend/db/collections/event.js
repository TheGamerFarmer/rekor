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

  await db
    .collection('event')
    .createIndex(
      { date: 1, place: 1, type: 1, name: 1, description: 1, group: 1 },
      { unique: true },
    );
}

module.exports = { createCollection };

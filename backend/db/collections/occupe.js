async function createCollection(db) {
  await db.createCollection('player_position', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['player', 'set', 'position', 'nbOut', 'nbIn'],
        properties: {
          player: { bsonType: 'objectId' },
          set: { bsonType: 'objectId' },
          position: { bsonType: 'objectId' },
          nbOut: { bsonType: 'int' },
          nbIn: { bsonType: 'int' },
        },
      },
    },
  });

  await db
    .collection('player_position')
    .createIndex({ player: 1, set: 1, position: 1 }, { unique: true });
}

module.exports = { createCollection };

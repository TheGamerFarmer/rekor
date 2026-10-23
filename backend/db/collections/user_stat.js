async function createCollection(db) {
  await db.createCollection('user_stat', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['statistic', 'player', 'set', 'value'],
        properties: {
          statistic: { bsonType: 'objectId' },
          player: { bsonType: 'objectId' },
          set: { bsonType: 'objectId' },
          value: { bsonType: 'int' },
        },
      },
    },
  });

  await db
    .collection('user_stat')
    .createIndex({ statistic: 1, player: 1, set: 1 }, { unique: true });
}

module.exports = { createCollection };

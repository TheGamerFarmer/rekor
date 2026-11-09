async function createCollection(db) {
  await db.createCollection('team_stat', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['statistic', 'team', 'set', 'value'],
        properties: {
          statistic: { bsonType: 'objectId' },
          team: { bsonType: 'objectId' },
          set: { bsonType: 'objectId' },
          value: { bsonType: 'int' },
        },
      },
    },
  });

  await db.collection('team_stat').createIndex({ statistic: 1, team: 1, set: 1 }, { unique: true });
}

module.exports = { createCollection };

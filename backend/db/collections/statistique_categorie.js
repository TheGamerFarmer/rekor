async function createCollection(db) {
  await db.createCollection('statistic_category', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['statistic', 'category'],
        properties: {
          statistic: { bsonType: 'objectId' },
          category: { bsonType: 'objectId' },
        },
      },
    },
  });

  await db
    .collection('statistic_category')
    .createIndex({ statistic: 1, category: 1 }, { unique: true });
}

module.exports = { createCollection };

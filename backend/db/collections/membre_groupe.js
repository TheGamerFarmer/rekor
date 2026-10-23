async function createCollection(db) {
  await db.createCollection('group_member', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['group', 'user'],
        properties: {
          group: { bsonType: 'objectId' },
          user: { bsonType: 'objectId' },
        },
      },
    },
  });

  await db.collection('group_member').createIndex({ group: 1, user: 1 }, { unique: true });
}

module.exports = { createCollection };

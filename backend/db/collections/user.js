async function createCollection(db) {
  await db.createCollection('user', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'firstName', 'email', 'password', 'role', 'pronoun'],
        properties: {
          name: { bsonType: 'string' },
          firstName: { bsonType: 'string' },
          email: { bsonType: 'string' },
          password: { bsonType: 'string' },
          phoneNumber: { bsonType: 'string' },
          role: { enum: ['Entraineur', 'Capitaine', 'Adhérent', 'Visiteur'] },
          birthday: { bsonType: 'date' },
          pronoun: { enum: ['Il', 'Elle', 'Iel', 'Autre'] },
        },
      },
    },
  });

  await db
    .collection('user')
    .createIndex(
      { name: 1, firstName: 1, email: 1, phoneNumber: 1, birthday: 1 },
      { unique: true },
    );
}

module.exports = { createCollection };

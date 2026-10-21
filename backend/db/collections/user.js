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
}

module.exports = { createCollection };

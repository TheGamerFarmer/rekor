/**
 * Crée ce qui manque dans la base : collections, règles de validation, index.
 * Peut tourner à chaque démarrage sans rien casser.
 */
async function ensureSchema(db) {
  const existing = await db.listCollections({ name: 'users' }, { nameOnly: true }).toArray();
  if (existing.length === 0) {
    await db.createCollection('users', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['email', 'name'],
          properties: {
            email: { bsonType: 'string' },
            name: { bsonType: 'string' },
          },
        },
      },
    });
  }
  // Remplace un UNIQUE SQL : deux utilisateurs ne peuvent pas avoir le même e-mail
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
}

module.exports = { ensureSchema };

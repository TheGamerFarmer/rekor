const fs = require('fs');
const path = require('path');

/**
 * Crée ce qui manque dans la base : collections, règles de validation, index.
 * Peut tourner à chaque démarrage sans rien casser.
 */
async function ensureSchema(db) {
  const collectionsDir = path.join(__dirname, 'collections');
  const files = fs.readdirSync(collectionsDir).filter((f) => f.endsWith('.js'));

  for (const file of files) {
    const { createCollection } = require(path.join(collectionsDir, file));

    try {
      await createCollection(db);
    } catch (err) {
      if (err.codeName !== 'NamespaceExists') throw err;
    }
  }
}

module.exports = { ensureSchema };

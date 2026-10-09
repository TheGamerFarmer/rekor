const { MongoClient } = require('mongodb');

let client;
let database;

/**
 * Se connecte à MongoDB. Par défaut, lit la configuration dans l'environnement :
 * MONGODB_URI, MONGODB_DB, MONGODB_USER, MONGODB_PASSWORD (identifiants séparés de l'URI,
 * pour ne pas avoir à encoder les caractères spéciaux d'un mot de passe).
 * Réessaie quelques fois : au premier démarrage, la base peut mettre un moment à accepter les connexions.
 */
async function connect({
  uri = process.env.MONGODB_URI,
  dbName = process.env.MONGODB_DB,
  user = process.env.MONGODB_USER,
  password = process.env.MONGODB_PASSWORD,
  retries = 10,
  delayMs = 2000,
} = {}) {
  if (!uri) throw new Error('MONGODB_URI est requis pour se connecter à MongoDB');

  const options = { serverSelectionTimeoutMS: 3000 };
  if (user) {
    options.auth = { username: user, password };
    options.authSource = 'admin';
  }

  for (let attempt = 1; ; attempt++) {
    const candidate = new MongoClient(uri, options);
    try {
      await candidate.connect();
      const candidateDb = candidate.db(dbName);
      await candidateDb.command({ ping: 1 });
      client = candidate;
      database = candidateDb;
      return database;
    } catch (error) {
      await candidate.close().catch(() => {});
      if (attempt >= retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

/** La base connectée. À utiliser dans les routes : getDb().collection('...') */
function getDb() {
  if (!database) {
    const error = new Error("La base de données n'est pas connectée");
    error.status = 503;
    throw error;
  }
  return database;
}

async function close() {
  if (client) await client.close();
  client = undefined;
  database = undefined;
}

module.exports = { connect, getDb, close };

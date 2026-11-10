const mongoose = require('mongoose');
const { auditPlugin } = require('./plugins/audit');

mongoose.set('bufferCommands', false);
mongoose.plugin(auditPlugin);

/**
 * Connects to MongoDB via Mongoose. Retries several times because on first startup
 * the database container may not yet be ready to accept connections.
 *
 * @param {object}  [options]
 * @param {string}  [options.uri]      Connection URI — defaults to `MONGODB_URI` env var.
 * @param {string}  [options.dbName]   Database name — defaults to `MONGODB_DB` env var.
 * @param {string}  [options.user]     Auth username — defaults to `MONGODB_USER` env var.
 * @param {string}  [options.password] Auth password — defaults to `MONGODB_PASSWORD` env var.
 * @param {number}  [options.retries=10]  Maximum number of connection attempts.
 * @param {number}  [options.delayMs=2000] Delay between attempts in milliseconds.
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

  const options = {
    dbName,
    autoIndex: false,
    bufferCommands: false,
    serverSelectionTimeoutMS: 3000,
  };
  if (user) {
    options.auth = { username: user, password };
    options.authSource = 'admin';
  }

  for (let attempt = 1; ; attempt++) {
    try {
      await mongoose.connect(uri, options);
      return;
    } catch (error) {
      await mongoose.disconnect().catch(() => {});
      if (attempt >= retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

/**
 * Returns the connected native MongoDB `Db` instance.
 * Throws a 503 error when the database is not connected.
 *
 * @returns {import('mongodb').Db}
 */
function getDb() {
  if (mongoose.connection.readyState !== 1) {
    const error = new Error("La base de données n'est pas connectée");
    error.status = 503;
    throw error;
  }
  return mongoose.connection.db;
}

/** Closes the Mongoose connection gracefully. */
async function close() {
  await mongoose.disconnect();
}

module.exports = { connect, getDb, close };

const { getDb } = require('../db/db');

const wrapAsync = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

const usersCollection = () => getDb().collection('users');

module.exports = { wrapAsync, usersCollection };

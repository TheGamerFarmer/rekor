const { getDb } = require('../db/db');

const wrapAsync = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

const usersCollection = () => getDb().collection('users');

const toPublicUser = (user) => {
  const { _id, name, firstName, email, phoneNumber, role, birthday, pronoun } = user;

  return Object.fromEntries(
    Object.entries({
      id: _id.toString(),
      name,
      firstName,
      email,
      phoneNumber,
      role,
      birthday,
      pronoun,
    }).filter(([, value]) => value !== undefined),
  );
};

const toEssentialPublicUser = (user) => {
  const { _id, name, firstName, email } = user;

  return Object.fromEntries(
    Object.entries({
      id: _id.toString(),
      name,
      firstName,
      email,
    }).filter(([, value]) => value !== undefined),
  );
};

module.exports = { wrapAsync, usersCollection, toPublicUser, toEssentialPublicUser };

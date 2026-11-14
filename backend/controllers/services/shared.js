/**
 * Wraps an async Express route handler so that any rejected promise is forwarded to `next(err)`
 * instead of leaving the request hanging. Converts `MongooseError` (thrown when
 * `bufferCommands` is false and the DB is unreachable) to a 503 response.
 *
 * @param {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<void>} handler
 */
const wrapAsync = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch((err) => {
    if (err.name === 'MongooseError' && !err.status) {
      err.status = 503;
      err.message = "La base de données n'est pas connectée";
    }
    next(err);
  });

/**
 * Serialises a Mongoose user document to a public-facing object.
 * Omits `password` and other internal fields; includes optional fields only when present.
 *
 * @param {import('../../db/models/user')} user
 */
const toPublicUser = (user) => {
  const { _id, name, firstName, email, phoneNumber, role, birthday, pronoun } = user;
  const doc = {
    id: _id.toString(),
    name,
    firstName,
    email,
    role,
    pronoun,
  };

  if (phoneNumber !== undefined && phoneNumber !== null) doc.phoneNumber = phoneNumber;
  if (birthday !== undefined && birthday !== null) doc.birthday = birthday;

  return Object.fromEntries(Object.entries(doc));
};

/**
 * Serialises a Mongoose user document to a minimal object suitable for list responses.
 * Only includes `id`, `email`, `firstName`, and `name`.
 *
 * @param {import('../../db/models/user')} user
 */
const toEssentialPublicUser = (user) => {
  const { _id, email, firstName, name } = user;

  return Object.fromEntries(
    Object.entries({
      id: _id.toString(),
      email,
      firstName,
      name,
    }).filter(([, value]) => value !== undefined),
  );
};

/**
 * Serialises a Mongoose event document to a public-facing object.
 *
 * @param {import('../../db/models/event')} event
 */
const toPublicEvent = (event) => ({
  id: event._id.toString(),
  date: event.date,
  place: event.place,
  type: event.type,
  name: event.name,
  description: event.description,
  group: event.group.toString(),
});

/**
 * Serialises a Mongoose group document to a public-facing object.
 *
 * @param {import('../../db/models/group')} group
 */
const toPublicGroup = (group) => ({
  id: group._id.toString(),
  name: group.name,
  owner: group.owner.toString(),
});

/**
 * Serialises a Mongoose user document to a public-facing object for group member responses.
 * Equivalent to {@link toPublicUser} but semantically scoped to the group membership context.
 *
 * @param {import('../../db/models/user')} user
 */
const toPublicGroupMember = toPublicUser;

module.exports = {
  wrapAsync,
  toPublicUser,
  toEssentialPublicUser,
  toPublicEvent,
  toPublicGroup,
  toPublicGroupMember,
};

require('../db/db');
const express = require('express');
const { rateLimit } = require('express-rate-limit');
const {
  isValidObjectId,
  Types: { ObjectId },
} = require('mongoose');
const User = require('../db/models/user');
const Group = require('../db/models/group');
const GroupMembre = require('../db/models/group_member');
const { wrapAsync, toPublicGroup, toPublicGroupMember } = require('./services/shared');
const { authenticate, authorize } = require('./services/auth-middleware');
const { USER_ROLE } = require('../db/enums');

/**
 * Creates and returns an Express router that handles group-related endpoints.
 * All routes are rate-limited.
 *
 * Routes:
 * - `GET    /:id`                — Get a group by its MongoDB ObjectId (requires Adhérent or above)
 * - `PUT    /:id`                — Create a new group from the request body (requires Entraineur or above)
 * - `PATCH  /:id`                — Partially update a group (requires Entraineur or above)
 * - `DELETE /:id`                — Delete a group (requires Entraineur or above)
 * - `GET    /:id/members`        — List the members of a group (requires Adhérent or above)
 * - `PUT    /:id/members/:userId`— Add a user to a group (requires Entraineur or above)
 * - `DELETE /:id/members/:userId`— Remove a user from a group (requires Entraineur or above)
 *
 * @param {{ limit?: number, windowMs?: number }} [options]
 * @param {number} [options.limit=100]    Max requests per window per IP.
 * @param {number} [options.windowMs=60000] Rate-limit window in milliseconds.
 * @returns {import('express').Router}
 */
function createGroupsRouter({ limit = 100, windowMs = 60_000 } = {}) {
  const router = express.Router();

  router.use(
    rateLimit({
      windowMs,
      limit,
      standardHeaders: true,
      legacyHeaders: false,
      message: { message: 'Trop de requêtes, réessaie plus tard' },
    }),
  );

  // Returns the full details of a single group identified by its MongoDB ObjectId.
  // Response: { id, name, owner }.
  router.get(
    '/:id',
    authenticate,
    authorize(USER_ROLE.ADHERENT),
    wrapAsync(async (req, res) => {
      if (!isValidObjectId(req.params.id))
        return res.status(400).json({ message: 'Identifiant invalide' });

      const doc = await Group.findById(req.params.id);
      if (!doc) return res.status(404).json({ message: 'Groupe introuvable' });

      res.json(toPublicGroup(doc));
    }),
  );

  // Creates a new group from the request body. Both name and owner (user ObjectId) are required.
  // The :id path parameter is validated but not used in the creation.
  // Returns 201 on success, 409 if an identical group already exists.
  router.put(
    '/:id',
    authenticate,
    authorize(USER_ROLE.ENTRAINEUR),
    wrapAsync(async (req, res) => {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Identifiant invalide' });
      }

      let { name, owner } = req.body;

      let errorMessage;

      if (!name) errorMessage = 'Nom invalide';

      if (!owner && !errorMessage) errorMessage = 'Propriétaire invalide';

      if (errorMessage) return res.status(400).json({ message: errorMessage });

      owner = new ObjectId(owner);

      const userResult = await User.findById(owner);

      if (!userResult) return res.status(404).json({ message: 'Utilisateur introuvable' });

      try {
        await Group.create({ name, owner });
      } catch (error) {
        if (error.code === 11000) {
          return res.status(409).json({ message: 'Ce groupe existe déjà' });
        }
        throw error;
      }

      res.status(201).end();
    }),
  );

  // Partially updates an existing group. Only provided fields are applied.
  // Returns 204 on success, 404 if the group or owner user is not found.
  router.patch(
    '/:id',
    authenticate,
    authorize(USER_ROLE.ENTRAINEUR),
    wrapAsync(async (req, res) => {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Identifiant invalide' });
      }

      const { name, owner } = req.body;

      const changes = {};
      if (name) changes.name = name;
      if (owner) changes.owner = new ObjectId(owner);

      if (changes.owner) {
        const userResult = await User.findById(changes.owner);
        if (!userResult) return res.status(404).json({ message: 'Utilisateur introuvable' });
      }

      const result = await Group.updateOne({ _id: req.params.id }, { $set: changes });
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Groupe introuvable' });
      }

      res.status(204).end();
    }),
  );

  // Deletes the group with the given MongoDB ObjectId.
  // Returns 204 on success, 400 for a malformed id, 404 if not found.
  router.delete(
    '/:id',
    authenticate,
    authorize(USER_ROLE.ENTRAINEUR),
    wrapAsync(async (req, res) => {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Identifiant invalide' });
      }

      const result = await Group.deleteOne({ _id: req.params.id });
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Groupe introuvable' });
      }

      res.status(204).end();
    }),
  );

  // Returns the list of members (users) of a group identified by its MongoDB ObjectId.
  // Response: array of user objects via toPublicGroupMember.
  router.get(
    '/:id/members',
    authenticate,
    authorize(USER_ROLE.ADHERENT),
    wrapAsync(async (req, res) => {
      if (!isValidObjectId(req.params.id))
        return res.status(400).json({ message: 'Identifiant invalide' });

      const doc = await Group.findById(req.params.id);
      if (!doc) return res.status(404).json({ message: 'Groupe introuvable' });

      const memberships = await GroupMembre.find({ group: doc._id });

      const usersId = memberships.map((member) => member.user);

      const users = await User.find({ _id: { $in: usersId } });

      res.json(users.map(toPublicGroupMember));
    }),
  );

  // Adds the user identified by :userId to the group identified by :id.
  // Returns 201 on success, 409 if the user is already a member of the group.
  router.put(
    '/:id/members/:userId',
    authenticate,
    authorize(USER_ROLE.ENTRAINEUR),
    wrapAsync(async (req, res) => {
      if (!isValidObjectId(req.params.id))
        return res.status(400).json({ message: 'Identifiant invalide' });
      if (!isValidObjectId(req.params.userId))
        return res.status(400).json({ message: "Identifiant d'utilisateur invalide" });

      const groupResult = await Group.findById(req.params.id);
      const userResult = await User.findById(req.params.userId);

      if (!groupResult) return res.status(404).json({ message: 'Groupe introuvable' });

      if (!userResult) return res.status(404).json({ message: 'Utilisateur introuvable' });

      try {
        await GroupMembre.create({ group: req.params.id, user: req.params.userId });
      } catch (error) {
        if (error.code === 11000) {
          return res.status(409).json({ message: 'Cet utilisateur est déjà dans ce groupe' });
        }
        throw error;
      }

      res.status(201).end();
    }),
  );

  // Removes the user identified by :userId from the group identified by :id.
  // Returns 204 on success, 404 if the group, user, or membership is not found.
  router.delete(
    '/:id/members/:userId',
    authenticate,
    authorize(USER_ROLE.ENTRAINEUR),
    wrapAsync(async (req, res) => {
      if (!isValidObjectId(req.params.id))
        return res.status(400).json({ message: 'Identifiant invalide' });
      if (!isValidObjectId(req.params.userId))
        return res.status(400).json({ message: "Identifiant d'utilisateur invalide" });

      const groupResult = await Group.findById(req.params.id);
      const userResult = await User.findById(req.params.userId);

      if (!groupResult) return res.status(404).json({ message: 'Groupe introuvable' });

      if (!userResult) return res.status(404).json({ message: 'Utilisateur introuvable' });

      const result = await GroupMembre.deleteOne({ group: req.params.id, user: req.params.userId });
      if (result.deletedCount === 0) {
        return res
          .status(404)
          .json({ message: "L'utilisateur est introuvable dans le groupe introuvable" });
      }

      res.status(204).end();
    }),
  );

  return router;
}

module.exports = createGroupsRouter;

require('../db/db');
const express = require('express');
const { rateLimit } = require('express-rate-limit');
const {
  isValidObjectId,
  Types: { ObjectId },
} = require('mongoose');
const Event = require('../db/models/event');
const Group = require('../db/models/group');
const GroupMembre = require('../db/models/group_member');
const { wrapAsync, toPublicEvent } = require('./services/shared');
const { authenticate, authorize } = require('./services/auth-middleware');
const { EVENT_TYPE, USER_ROLE } = require('../db/enums');

/**
 * Creates and returns an Express router that handles event-related endpoints.
 * All routes are rate-limited.
 *
 * Routes:
 * - `GET  /`     — List all events (requires Adhérent role or above)
 * - `GET  /:id`  — Get a single event by its MongoDB ObjectId (requires Adhérent role or above)
 * - `PUT  /:id`  — Create a new event from the request body (requires Entraineur role or above)
 * - `PATCH /:id` — Partially update an existing event (requires Entraineur role or above)
 * - `DELETE /:id`— Delete an event by its MongoDB ObjectId (requires Entraineur role or above)
 *
 * @param {{ limit?: number, windowMs?: number }} [options]
 * @param {number} [options.limit=100]   Max requests per window per IP.
 * @param {number} [options.windowMs=60000] Rate-limit window in milliseconds.
 * @returns {import('express').Router}
 */
function createEventsRouter({ limit = 100, windowMs = 60_000 } = {}) {
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

  // Returns events whose group the authenticated user belongs to, sorted by insertion order.
  // Uses a $lookup aggregation so the membership filter runs entirely in MongoDB.
  // Response: array of { id, name }.
  router.get(
    '/',
    authenticate,
    authorize(USER_ROLE.ADHERENT),
    wrapAsync(async (req, res) => {
      const userId = new ObjectId(req.auth.sub);

      const docs = await Event.aggregate([
        {
          $lookup: {
            from: 'group_member',
            let: { gid: '$group' },

            pipeline: [
              {
                $match: {
                  $expr: { $and: [{ $eq: ['$group', '$$gid'] }, { $eq: ['$user', userId] }] },
                },
              },
              { $limit: 1 },
            ],
            as: 'membership',
          },
        },

        { $match: { 'membership.0': { $exists: true } } },

        { $sort: { _id: 1 } },
      ]);

      res.json(docs.map(toPublicEvent));
    }),
  );

  // Returns the full details of a single event identified by its MongoDB ObjectId.
  // Checks that the authenticated user is a member of the event's group.
  // Returns 400 for a malformed id, 404 if not found, 401 if not a group member.
  // Response: { id, name }.
  router.get(
    '/:id',
    authenticate,
    authorize(USER_ROLE.ADHERENT),
    wrapAsync(async (req, res) => {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Identifiant invalide' });
      }

      const doc = await Event.findById(req.params.id);
      if (!doc) return res.status(404).json({ message: 'Utilisateur introuvable' });

      // Check membership using doc.group (the event's group), not req.params.id.
      const membership = await GroupMembre.findOne({
        group: doc.group,
        user: new ObjectId(req.auth.sub),
      });
      if (!membership)
        return res.status(401).json({ message: "L'utilisateur ne fait pas partie du groupe" });

      res.json(toPublicEvent(doc));
    }),
  );

  // Creates a new event from the request body. All fields (date, place, type, name,
  // description, group) are required. The :id path parameter is validated but not used
  // in the creation. Returns 201 on success, 409 if an identical event already exists.
  router.put(
    '/:id',
    authenticate,
    authorize(USER_ROLE.ENTRAINEUR),
    wrapAsync(async (req, res) => {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Identifiant invalide' });
      }

      let { date, place, type, name, description, group } = req.body;

      let errorMessage;

      if (!date) errorMessage = 'Date invalide';

      if (!place && !errorMessage) errorMessage = 'Emplacement invalide';

      const types = Object.values(EVENT_TYPE);
      if ((!type || !types.includes(type)) && !errorMessage)
        errorMessage = `Type invalide, types possibles: ${types}`;

      if (!name && !errorMessage) errorMessage = 'Nom invalide';

      if (!description && !errorMessage) errorMessage = 'Description invalide';

      if (!group && !errorMessage) errorMessage = 'group invalide';

      if (errorMessage) return res.status(400).json({ message: errorMessage });

      group = new ObjectId(group);

      const groupResult = await Group.findById(group);

      if (!groupResult) return res.status(404).json({ message: 'Groupe introuvable' });

      try {
        await Event.create({ date, place, type, name, description, group });
      } catch (error) {
        if (error.code === 11000) {
          return res.status(409).json({ message: 'Cet évenement existe déjà' });
        }
        throw error;
      }

      res.status(201).end();
    }),
  );

  // Partially updates an existing event. Only provided fields are applied.
  // Note: `group` must be supplied even for partial updates (see handler implementation).
  // Returns 204 on success, 404 if the event or group is not found.
  router.patch(
    '/:id',
    authenticate,
    authorize(USER_ROLE.ENTRAINEUR),
    wrapAsync(async (req, res) => {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Identifiant invalide' });
      }

      const { date, place, type, name, description, group } = req.body;

      const changes = {};
      if (date) changes.date = new Date(`${date}T00:00:00.000Z`);
      if (place) changes.place = place;
      if (type && Object.values(EVENT_TYPE).includes(type)) changes.type = type;
      if (name) changes.name = name;
      if (description) changes.description = description;
      if (group) changes.group = new ObjectId(group);

      const groupResult = await Group.findById(changes.group);

      if (!groupResult) return res.status(404).json({ message: 'Groupe introuvable' });

      const result = await Event.updateOne({ _id: req.params.id }, { $set: changes });
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Évènement introuvable' });
      }

      res.status(204).end();
    }),
  );

  // Deletes the event with the given MongoDB ObjectId.
  // Returns 204 on success, 400 for a malformed id, 404 if not found.
  router.delete(
    '/:id',
    authenticate,
    authorize(USER_ROLE.ENTRAINEUR),
    wrapAsync(async (req, res) => {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Identifiant invalide' });
      }

      const result = await Event.deleteOne({ _id: req.params.id });
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Évenement introuvable' });
      }

      res.status(204).end();
    }),
  );

  return router;
}

module.exports = createEventsRouter;

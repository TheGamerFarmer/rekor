require('../db/db');
const express = require('express');
const { rateLimit } = require('express-rate-limit');
const { isValidObjectId } = require('mongoose');
const { wrapAsync, toPublicEvent, toPublicParticipant } = require('./services/shared');
const { authenticate, authorize } = require('./services/auth-middleware');
const { EVENT_TYPE, USER_ROLE } = require('../db/enums');
const eventService = require('./services/eventService');

/**
 * Creates and returns an Express router that handles event-related endpoints.
 * All routes are rate-limited. The controller validates inputs and delegates
 * business logic to eventService. Ownership and permission checks are enforced by the service.
 *
 * Routes:
 * - `GET  /`                — List all events (requires authentication)
 * - `GET  /:id`             — Get a single event by its ObjectId (requires authentication)
 * - `POST /`                — Create a new event with auto-created group (requires Entraineur or above)
 * - `PATCH /:id`            — Partially update an event (requires Entraineur or above)
 * - `DELETE /:id`           — Delete an event and its group (requires Entraineur or above, must be group owner)
 * - `POST /:id/register`   — Register participation (requires authentication, Visiteurs excluded from match compétitif)
 * - `PUT  /:id/register`   — Update participation (requires authentication)
 * - `GET  /:id/participants`— List participants of an event (requires authentication)
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

  // Returns all events.
  // Response: array of { id, date, place, type, name, description, group }.
  router.get(
    '/',
    authenticate,
    wrapAsync(async (req, res) => {
      const events = await eventService.getAllEvents();
      res.json(events.map(toPublicEvent));
    }),
  );

  // Returns the full details of a single event identified by its MongoDB ObjectId.
  // Returns 400 for a malformed id, 404 if not found.
  // Response: { id, date, place, type, name, description, group }.
  router.get(
    '/:id',
    authenticate,
    wrapAsync(async (req, res) => {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Identifiant invalide' });
      }

      const result = await eventService.getEventById(req.params.id);
      if (!result) return res.status(404).json({ message: 'Utilisateur introuvable' });

      res.json(toPublicEvent(result));
    }),
  );

  // Creates a new event from the request body. Fields date, place, type, name and
  // description are required. A group is automatically created with the event name
  // and the authenticated user as owner and first member.
  // Returns 201 on success, 409 if an identical event already exists.
  router.post(
    '/',
    authenticate,
    authorize(USER_ROLE.ENTRAINEUR),
    wrapAsync(async (req, res) => {
      const { date, place, type, name, description } = req.body;

      let errorMessage;

      if (!date) errorMessage = 'Date invalide';

      if (!place && !errorMessage) errorMessage = 'Emplacement invalide';

      const types = Object.values(EVENT_TYPE);
      if ((!type || !types.includes(type)) && !errorMessage)
        errorMessage = `Type invalide, types possibles: ${types}`;

      if (!name && !errorMessage) errorMessage = 'Nom invalide';

      if (!description && !errorMessage) errorMessage = 'Description invalide';

      if (errorMessage) return res.status(400).json({ message: errorMessage });

      const userId = req.auth.sub;

      const result = await eventService.createEvent(
        { date, place, type, name, description },
        userId,
      );

      if (result.error === 'DUPLICATE')
        return res.status(409).json({ message: 'Cet évenement existe déjà' });

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

      if (!group || !isValidObjectId(group)) {
        return res.status(400).json({ message: 'Groupe invalide' });
      }

      const result = await eventService.updateEvent(req.params.id, {
        date,
        place,
        type,
        name,
        description,
        group,
      });

      if (result.error === 'GROUP_NOT_FOUND')
        return res.status(404).json({ message: 'Groupe introuvable' });
      if (result.error === 'EVENT_NOT_FOUND')
        return res.status(404).json({ message: 'Évènement introuvable' });

      res.status(204).end();
    }),
  );

  // Deletes the event and its associated group. Only the group owner can delete.
  // Returns 204 on success, 400 for a malformed id, 403 if not owner, 404 if not found.
  router.delete(
    '/:id',
    authenticate,
    authorize(USER_ROLE.ENTRAINEUR),
    wrapAsync(async (req, res) => {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Identifiant invalide' });
      }

      const result = await eventService.deleteEvent(req.params.id, req.auth.sub);

      if (result.error === 'USER_NOT_OWNER')
        return res.status(403).json({ message: "Vous n'êtes pas propriétaire de ce groupe" });
      if (result.error === 'GROUP_NOT_FOUND')
        return res.status(404).json({ message: 'Groupe introuvable' });
      if (result.error === 'EVENT_NOT_FOUND')
        return res.status(404).json({ message: 'Évenement introuvable' });

      res.status(204).end();
    }),
  );

  // Registers participation for an event. The body must contain participate ('true' or 'false').
  // When participate is 'true', the authenticated user is also added to the event's group
  // if not already a member. Visiteurs cannot register for Match-compétitif events.
  // Returns 201 on success, 400 for invalid input, 403 if not allowed,
  // 404 if the event is not found, 409 if the user has already registered.
  router.post(
    '/:id/register',
    authenticate,
    wrapAsync(async (req, res) => {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Identifiant invalide' });
      }

      let { participate } = req.body;

      if (participate !== 'true' && participate !== 'false')
        return res.status(400).json({ message: 'Participation state invalide' });

      participate = participate === 'true';

      const result = await eventService.registerParticipation(
        req.params.id,
        participate,
        req.auth.sub,
      );

      if (result.error === 'PERMISSION_NOT_ALLOWED')
        return res
          .status(403)
          .json({ message: "Vous n'avez pas la permission de participer à cet évènement" });
      if (result.error === 'EVENT_NOT_FOUND')
        return res.status(404).json({ message: 'Évènement introuvable' });
      if (result.error === 'DUPLICATE')
        return res
          .status(409)
          .json({ message: "L'utilisateur à déjà déclaré sa participation à cet évent" });

      res.status(201).end();
    }),
  );

  // Updates an existing participation for an event. The body must contain participate
  // ('true' or 'false'). Only the participation of the authenticated user is updated.
  // Returns 204 on success, 400 for invalid input, 404 if the event or participation is not found.
  router.put(
    '/:id/register',
    authenticate,
    wrapAsync(async (req, res) => {
      if (!isValidObjectId(req.params.id))
        return res.status(400).json({ message: 'Identifiant invalide' });

      let { participate } = req.body;

      if (participate !== 'true' && participate !== 'false')
        return res.status(400).json({ message: 'Participation state invalide' });

      participate = participate === 'true';

      const result = await eventService.updateParticipation(
        req.params.id,
        participate,
        req.auth.sub,
      );

      if (result.error === 'EVENT_NOT_FOUND')
        return res.status(404).json({ message: 'Évènement introuvable' });
      if (result.error === 'NON_PARTICIPATE')
        return res
          .status(404)
          .json({ message: 'Aucune participation trouvée pour cet utilisateur' });

      res.status(204).end();
    }),
  );

  // Returns the list of participants for a given event.
  // Returns 400 for a malformed id, 404 if the event is not found.
  // Response: array of { id, event, participe, user }.
  router.get(
    '/:id/participants',
    authenticate,
    wrapAsync(async (req, res) => {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Identifiant invalide' });
      }

      const result = await eventService.getEventParticipants(req.params.id);

      if (result.error === 'EVENT_NOT_FOUND')
        return res.status(404).json({ message: 'Évènement introuvable' });

      res.json(result.data.map(toPublicParticipant));
    }),
  );

  return router;
}

module.exports = createEventsRouter;

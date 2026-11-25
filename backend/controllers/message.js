require('../db/db');
const express = require('express');
const { rateLimit } = require('express-rate-limit');
const { isValidObjectId } = require('mongoose');
const { wrapAsync, toPublicMessage } = require('./services/shared');
const { authenticate } = require('./services/auth-middleware');
const messageService = require('./services/messageService');
const groupService = require('./services/groupService');

/**
 * Creates and returns an Express router that handles message-related endpoints
 * nested under `/group/:groupId/messages`.
 * All routes are rate-limited. The controller validates inputs and delegates
 * business logic to messageService. Group membership is enforced by the
 * verifyGroup middleware.
 *
 * Routes:
 * - `GET    /`      — List all messages in the group (requires authentication + membership)
 * - `GET    /:id`   — Get a message by its MongoDB ObjectId (requires authentication + membership)
 * - `POST   /`      — Create a new message (requires authentication + membership)
 * - `PATCH  /:id`   — Update a message (requires authentication + membership, must be author)
 * - `DELETE /:id`   — Delete a message (requires authentication + membership, must be author or admin)
 *
 * @param {{ limit?: number, windowMs?: number }} [options]
 * @param {number} [options.limit=100]    Max requests per window per IP.
 * @param {number} [options.windowMs=60000] Rate-limit window in milliseconds.
 * @returns {import('express').Router}
 */
function createMessagesRouter({ limit = 100, windowMs = 60_000 } = {}) {
  const router = express.Router({ mergeParams: true });

  router.use(
    rateLimit({
      windowMs,
      limit,
      standardHeaders: true,
      legacyHeaders: false,
      message: { message: 'Trop de requêtes, réessaie plus tard' },
    }),
  );

  // Middleware that validates the groupId param, checks the group exists,
  // and verifies the authenticated user is a member of the group.
  const verifyGroup = wrapAsync(async (req, res, next) => {
    if (!isValidObjectId(req.params.groupId))
      return res.status(400).json({ message: 'Groupe invalide' });

    const group = await groupService.getGroupById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Groupe introuvable' });

    const members = await groupService.getGroupMembers(group._id);
    if (!members.data.some((member) => member._id.toString() === req.auth.sub))
      return res.status(403).json({ message: "Vous n'appartenez pas à ce groupe" });

    req.group = group;

    return next();
  });

  // Returns all messages in the group.
  // Response: array of { id, body, author, date }.
  router.get(
    '/',
    authenticate,
    verifyGroup,
    wrapAsync(async (req, res) => {
      const messages = await messageService.getAllMessagesOfGroup(req.group._id);
      res.json(messages.map(toPublicMessage));
    }),
  );

  // Returns a single message identified by its MongoDB ObjectId.
  // Returns 400 for a malformed id, 404 if not found.
  // Response: { id, body, author, date }.
  router.get(
    '/:id',
    authenticate,
    verifyGroup,
    wrapAsync(async (req, res) => {
      if (!isValidObjectId(req.params.id))
        return res.status(400).json({ message: 'Identifiant invalide' });

      const message = await messageService.getMessageById(req.group._id, req.params.id);
      if (!message) return res.status(404).json({ message: 'Message introuvable' });

      res.json(toPublicMessage(message));
    }),
  );

  // Creates a new message in the group from the request body.
  // The body field is required.
  // Returns 201 on success, 409 if an identical message already exists.
  router.post(
    '/',
    authenticate,
    verifyGroup,
    wrapAsync(async (req, res) => {
      const { body } = req.body;

      if (!body) return res.status(400).json({ message: 'Body invalide' });

      const result = await messageService.createMessage(req.group._id, body);

      if (result.error === 'DUPLICATE')
        return res.status(409).json({ message: 'Ce message existe déjà' });

      res.status(201).end();
    }),
  );

  // Updates the body of an existing message. Only the author can update it.
  // Returns 204 on success, 403 if not author, 404 if the message is not found.
  router.patch(
    '/:id',
    authenticate,
    verifyGroup,
    wrapAsync(async (req, res) => {
      if (!isValidObjectId(req.params.id))
        return res.status(400).json({ message: 'Identifiant invalide' });

      const { body } = req.body;

      if (!body) return res.status(400).json({ message: 'Body invalide' });

      const result = await messageService.updateMessage(
        req.group._id,
        req.params.id,
        req.auth.sub,
        body,
      );

      if (result.error === 'USER_NOT_OWNER')
        return res.status(403).json({ message: "Vous n'êtes pas l'auteur de ce message" });
      if (result.error === 'MESSAGE_NOT_FOUND')
        return res.status(404).json({ message: 'Message introuvable' });

      res.status(204).end();
    }),
  );

  // Deletes a message. Only the author or an administrator can delete it.
  // Returns 204 on success, 403 if not author/admin, 404 if not found.
  router.delete(
    '/:id',
    authenticate,
    verifyGroup,
    wrapAsync(async (req, res) => {
      if (!isValidObjectId(req.params.id))
        return res.status(400).json({ message: 'Identifiant invalide' });

      const result = await messageService.deleteMessage(req.group._id, req.params.id, req.auth.sub);

      if (result.error === 'USER_NOT_OWNER')
        return res.status(403).json({ message: "Vous n'êtes pas l'auteur de ce message" });
      if (result.error === 'MESSAGE_NOT_FOUND')
        return res.status(404).json({ message: 'Message introuvable' });

      res.status(204).end();
    }),
  );

  return router;
}

module.exports = createMessagesRouter;

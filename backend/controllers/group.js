require('../db/db');
const express = require('express');
const { rateLimit } = require('express-rate-limit');
const { isValidObjectId } = require('mongoose');
const { wrapAsync, toPublicGroup, toPublicGroupMember } = require('./services/shared');
const { authenticate, authorize } = require('./services/auth-middleware');
const { USER_ROLE } = require('../db/enums');
const groupService = require('./services/groupService');

/**
 * Creates and returns an Express router that handles group-related endpoints.
 * All routes are rate-limited. The controller validates inputs and delegates
 * business logic to groupService. Ownership checks are enforced by the service.
 *
 * Routes:
 * - `GET    /`                   — List all groups (requires authentication)
 * - `GET    /:id`                — Get a group by its MongoDB ObjectId (requires authentication)
 * - `POST   /`                   — Create a new group with optional members (requires Adhérent or above)
 * - `PATCH  /:id`                — Partially update a group (requires Adhérent or above, must be owner)
 * - `DELETE /:id`                — Delete a group (requires Adhérent or above, must be owner)
 * - `GET    /:id/members`        — List the members of a group (requires authentication)
 * - `POST   /:id/members/:userId`— Add a user to a group (requires Adhérent or above, must be owner)
 * - `DELETE /:id/members/:userId`— Remove a user from a group (requires authentication, owner or self)
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

  // Returns all groups.
  // Response: array of { id, name, owner }.
  router.get(
    '/',
    authenticate,
    wrapAsync(async (req, res) => {
      const groups = await groupService.getAllGroups();
      res.json(groups.map(toPublicGroup));
    }),
  );

  // Returns the full details of a single group identified by its MongoDB ObjectId.
  // Returns 400 for a malformed id, 404 if not found.
  // Response: { id, name, owner }.
  router.get(
    '/:id',
    authenticate,
    wrapAsync(async (req, res) => {
      if (!isValidObjectId(req.params.id))
        return res.status(400).json({ message: 'Identifiant invalide' });

      const result = await groupService.getGroupById(req.params.id);
      if (!result) return res.status(404).json({ message: 'Groupe introuvable' });

      res.json(toPublicGroup(result));
    }),
  );

  // Creates a new group from the request body. Both name and owner (user ObjectId) are required.
  // An optional members array of user ObjectIds can be provided to add users to the group.
  // Returns 201 on success, 409 if an identical group already exists.
  router.post(
    '/',
    authenticate,
    authorize(USER_ROLE.ADHERENT),
    wrapAsync(async (req, res) => {
      const { name, owner, members } = req.body;

      let errorMessage;

      if (!name) errorMessage = 'Nom invalide';

      if (typeof owner !== 'string' || !isValidObjectId(owner))
        if (!errorMessage) errorMessage = 'Propriétaire invalide';

      if (errorMessage) return res.status(400).json({ message: errorMessage });

      if (members && members.length > 0) {
        for (const userId of members) {
          if (!isValidObjectId(userId)) {
            return res.status(400).json({ message: `Identifiant de membre invalide : ${userId}` });
          }
        }
      }

      const result = await groupService.createGroup({ name, owner, members });

      if (result.error === 'USER_NOT_FOUND')
        return res.status(404).json({ message: 'Utilisateur introuvable' });
      if (result.error === 'MEMBER_NOT_FOUND')
        return res.status(404).json({ message: 'Un ou plusieurs membres introuvables' });
      if (result.error === 'DUPLICATE')
        return res.status(409).json({ message: 'Ce groupe existe déjà' });

      res.status(201).end();
    }),
  );

  // Partially updates an existing group. Only provided fields are applied.
  // Only the group owner can update it.
  // Returns 204 on success, 403 if not owner, 404 if the group or owner user is not found.
  router.patch(
    '/:id',
    authenticate,
    authorize(USER_ROLE.ADHERENT),
    wrapAsync(async (req, res) => {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Identifiant invalide' });
      }

      const { name, owner } = req.body;

      let errorMessage;

      if (owner && (typeof owner !== 'string' || !isValidObjectId(owner)))
        errorMessage = 'Propriétaire invalide';

      if (errorMessage) return res.status(400).json({ message: errorMessage });

      const result = await groupService.updateGroup(req.params.id, req.auth.sub, { name, owner });

      if (result.error === 'USER_NOT_OWNER')
        return res.status(403).json({ message: "Vous n'êtes pas propriétaire de ce groupe" });
      if (result.error === 'USER_NOT_FOUND')
        return res.status(404).json({ message: 'Utilisateur introuvable' });
      if (result.error === 'GROUP_NOT_FOUND')
        return res.status(404).json({ message: 'Groupe introuvable' });

      res.status(204).end();
    }),
  );

  // Deletes the group with the given MongoDB ObjectId. Only the owner can delete it.
  // Returns 204 on success, 400 for a malformed id, 403 if not owner, 404 if not found.
  router.delete(
    '/:id',
    authenticate,
    authorize(USER_ROLE.ADHERENT),
    wrapAsync(async (req, res) => {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Identifiant invalide' });
      }

      const result = await groupService.deleteGroup(req.params.id, req.auth.sub);

      if (result.error === 'USER_NOT_OWNER')
        return res.status(403).json({ message: "Vous n'êtes pas propriétaire de ce groupe" });
      if (result.error === 'GROUP_NOT_FOUND')
        return res.status(404).json({ message: 'Groupe introuvable' });

      res.status(204).end();
    }),
  );

  // Returns the list of members (users) of a group identified by its MongoDB ObjectId.
  // Response: array of user objects via toPublicGroupMember.
  router.get(
    '/:id/members',
    authenticate,
    wrapAsync(async (req, res) => {
      if (!isValidObjectId(req.params.id))
        return res.status(400).json({ message: 'Identifiant invalide' });

      const result = await groupService.getGroupMembers(req.params.id);

      if (result.error === 'GROUP_NOT_FOUND')
        return res.status(404).json({ message: 'Groupe introuvable' });

      res.json(result.data.map(toPublicGroupMember));
    }),
  );

  // Adds a user to the group. Only the group owner can add members.
  // Returns 201 on success, 403 if not owner, 404 if group/user not found,
  // 409 if the user is already a member of the group.
  router.post(
    '/:id/members/:userId',
    authenticate,
    authorize(USER_ROLE.ADHERENT),
    wrapAsync(async (req, res) => {
      if (!isValidObjectId(req.params.id))
        return res.status(400).json({ message: 'Identifiant invalide' });
      if (!isValidObjectId(req.params.userId))
        return res.status(400).json({ message: "Identifiant d'utilisateur invalide" });

      const result = await groupService.addMemberToGroup(
        req.params.id,
        req.params.userId,
        req.auth.sub,
      );

      if (result.error === 'USER_NOT_OWNER')
        return res.status(403).json({ message: "Vous n'êtes pas propriétaire de ce groupe" });
      if (result.error === 'GROUP_NOT_FOUND')
        return res.status(404).json({ message: 'Groupe introuvable' });
      if (result.error === 'USER_NOT_FOUND')
        return res.status(404).json({ message: 'Utilisateur introuvable' });
      if (result.error === 'DUPLICATE')
        return res.status(409).json({ message: 'Cet utilisateur est déjà dans ce groupe' });

      res.status(201).end();
    }),
  );

  // Removes a user from the group. The group owner can remove anyone; a member can remove themselves.
  // If the removed user was the owner, ownership is reassigned to the highest-ranked remaining member.
  // Returns 204 on success, 403 if not owner and not self, 404 if group/user/membership not found.
  router.delete(
    '/:id/members/:userId',
    authenticate,
    wrapAsync(async (req, res) => {
      if (!isValidObjectId(req.params.id))
        return res.status(400).json({ message: 'Identifiant invalide' });
      if (!isValidObjectId(req.params.userId))
        return res.status(400).json({ message: "Identifiant d'utilisateur invalide" });

      const result = await groupService.removeMemberFromGroup(
        req.params.id,
        req.params.userId,
        req.auth.sub,
      );

      if (result.error === 'USER_NOT_OWNER')
        return res.status(403).json({ message: "Vous n'êtes pas propriétaire de ce groupe" });
      if (result.error === 'GROUP_NOT_FOUND')
        return res.status(404).json({ message: 'Groupe introuvable' });
      if (result.error === 'USER_NOT_FOUND')
        return res.status(404).json({ message: 'Utilisateur introuvable' });
      if (result.error === 'MEMBERSHIP_NOT_FOUND')
        return res
          .status(404)
          .json({ message: "L'utilisateur est introuvable dans le groupe introuvable" });

      res.status(204).end();
    }),
  );

  return router;
}

module.exports = createGroupsRouter;

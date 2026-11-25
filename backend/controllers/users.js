require('../db/db');
const express = require('express');
const { rateLimit } = require('express-rate-limit');
const User = require('../db/models/user');
const RefreshToken = require('../db/models/refresh-token');
const Participant = require('../db/models/participant');
const GroupMember = require('../db/models/group_member');
const Group = require('../db/models/group');
const { wrapAsync, toPublicUser, toEssentialPublicUser, isValidId } = require('./services/shared');
const { authenticate, authorize } = require('./services/auth-middleware');
const { hashPassword, verifyPassword } = require('./services/password');
const { USER_ROLE } = require('../db/enums');
const groupService = require('./services/groupService');

function buildProfileChanges(body, includeRole = false) {
  const {
    email,
    name,
    firstName,
    phoneNumber,
    birthday,
    pronoun,
    medicalCertificate,
    rightOfPublicity,
    role,
  } = body;

  const changes = {};
  if (email !== undefined && email !== null) changes.email = email;
  if (firstName !== undefined && firstName !== null) changes.firstName = firstName;
  if (name !== undefined && name !== null) changes.name = name;
  if (phoneNumber !== undefined && phoneNumber !== null) changes.phoneNumber = phoneNumber;
  if (pronoun !== undefined && pronoun !== null) changes.pronoun = pronoun;
  if (medicalCertificate !== undefined && medicalCertificate !== null) {
    changes.medicalCertificate = medicalCertificate;
  }
  if (rightOfPublicity !== undefined && rightOfPublicity !== null) {
    changes.rightOfPublicity = rightOfPublicity;
  }
  if (birthday !== undefined && birthday !== null) {
    changes.birthday = new Date(`${birthday}T00:00:00.000Z`);
  }
  if (includeRole && role !== undefined && role !== null) changes.role = role;

  return changes;
}

function createUsersRouter({ limit = 100, windowMs = 60_000 } = {}) {
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

  router.get(
    '/',
    wrapAsync(async (req, res) => {
      const users = await User.find({}).sort({ _id: 1 });
      res.json(users.map(toEssentialPublicUser));
    }),
  );

  router.get(
    '/me',
    authenticate,
    wrapAsync(async (req, res) => {
      if (!isValidId(req.auth.sub)) {
        return res.status(400).json({ message: 'Identifiant invalide' });
      }

      const user = await User.findById(req.auth.sub);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur introuvable' });
      }
      res.json(toPublicUser(user));
    }),
  );

  router.patch(
    '/me',
    authenticate,
    wrapAsync(async (req, res) => {
      if (!isValidId(req.auth.sub)) {
        return res.status(400).json({ message: 'Identifiant invalide' });
      }

      const changes = buildProfileChanges(req.body);
      const result = await User.updateOne({ _id: { $eq: req.auth.sub } }, { $set: changes });
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Utilisateur introuvable' });
      }

      res.status(204).end();
    }),
  );

  router.delete(
    '/me',
    authenticate,
    wrapAsync(async (req, res) => {
      if (!isValidId(req.auth.sub)) {
        return res.status(400).json({ message: 'Identifiant invalide' });
      }

      const user = await User.findById(req.auth.sub);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur introuvable' });
      }

      if (
        user.role === USER_ROLE.ADMINISTRATEUR &&
        (await User.countDocuments({ role: USER_ROLE.ADMINISTRATEUR })) <= 1
      ) {
        return res
          .status(403)
          .json({ message: 'Interdiction de supprimer le dernier administrateur' });
      }

      await User.deleteOne({ _id: user._id });
      await RefreshToken.deleteMany({ userId: user._id });

      await GroupMember.deleteMany({ user: user });
      const groups = await Group.find({ owner: user });

      for (const group of groups) {
        await groupService.changeOwnerFromGroup(group._id);
      }

      await Participant.deleteMany({ user: user._id });

      res.status(204).end();
    }),
  );

  router.put(
    '/me/password',
    authenticate,
    wrapAsync(async (req, res) => {
      if (!isValidId(req.auth.sub)) {
        return res.status(400).json({ message: 'Identifiant invalide' });
      }

      const { old_password, new_password } = req.body;
      const currentUser = await User.findById(req.auth.sub);
      if (!currentUser) {
        return res.status(404).json({ message: 'Utilisateur introuvable' });
      }

      if (!(await verifyPassword(old_password, currentUser.password))) {
        return res.status(401).json({ message: 'Ancien mot de passe incorrect' });
      }

      const result = await User.updateOne(
        { _id: currentUser._id, password: currentUser.password },
        { $set: { password: await hashPassword(new_password) } },
      );
      if (result.matchedCount === 0) {
        return res.status(409).json({ message: 'Le mot de passe a changé, réessaie' });
      }

      await RefreshToken.deleteMany({ userId: currentUser._id });
      res.status(204).end();
    }),
  );

  router.get('/roles', authenticate, authorize(USER_ROLE.ADMINISTRATEUR), (req, res) => {
    return res.json(Object.values(USER_ROLE));
  });

  router.get(
    '/:id',
    wrapAsync(async (req, res) => {
      if (!isValidId(req.params.id)) {
        return res.status(400).json({ message: 'Identifiant invalide' });
      }

      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
      res.json(toPublicUser(user));
    }),
  );

  router.patch(
    '/:id',
    authenticate,
    authorize(USER_ROLE.ADMINISTRATEUR),
    wrapAsync(async (req, res) => {
      if (!isValidId(req.params.id)) {
        return res.status(400).json({ message: 'Identifiant invalide' });
      }

      if (!(await User.exists({ _id: { $eq: req.params.id } }))) {
        return res.status(404).json({ message: 'Utilisateur introuvable' });
      }

      if (req.params.id === req.auth.sub) {
        return res
          .status(403)
          .json({ message: 'Interdiction de changer son propre profil par cette méthode' });
      }

      const { role } = req.body;

      if (!Object.values(USER_ROLE).includes(role)) {
        return res.status(400).json({ message: 'Rôle inconnu' });
      }

      const changes = buildProfileChanges(req.body, true);
      const result = await User.updateOne({ _id: { $eq: req.params.id } }, { $set: changes });
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Utilisateur introuvable' });
      }

      return res.status(204).end();
    }),
  );

  router.post(
    '/:id/validate',
    authenticate,
    authorize(USER_ROLE.ADMINISTRATEUR),
    wrapAsync(async (req, res) => {
      if (!isValidId(req.params.id)) {
        return res.status(400).json({ message: 'Identifiant invalide' });
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur introuvable' });
      }

      if (user.role !== USER_ROLE.VISITEUR) {
        return res.status(400).json({ message: 'Utilisateur déjà validé' });
      }

      const change = { role: USER_ROLE.ADHERENT };
      await User.updateOne({ _id: user._id }, { $set: change });

      return res.status(204).end();
    }),
  );

  return router;
}

module.exports = createUsersRouter;

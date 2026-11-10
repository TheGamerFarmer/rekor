require('../db/db');
const express = require('express');
const { rateLimit } = require('express-rate-limit');
const {
  isValidObjectId,
  Types: { ObjectId },
} = require('mongoose');
const User = require('../db/models/user');
const { wrapAsync, toPublicUser, toEssentialPublicUser } = require('./services/shared');
const { authenticate } = require('./services/auth-middleware');
const { hashPassword, verifyPassword } = require('./services/password');

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
    '/me',
    authenticate,
    wrapAsync(async (req, res) => {
      const user = await User.findById(new ObjectId(req.auth.sub));
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
      const { name, firstName, phoneNumber, birthday, pronoun } = req.body;

      const changes = {};
      if (firstName !== undefined && firstName !== null) changes.firstName = firstName;
      if (name !== undefined && name !== null) changes.name = name;
      if (phoneNumber !== undefined && phoneNumber !== null) changes.phoneNumber = phoneNumber;
      if (pronoun !== undefined && pronoun !== null) changes.pronoun = pronoun;
      if (birthday !== undefined && birthday !== null) {
        changes.birthday = new Date(`${birthday}T00:00:00.000Z`);
      }

      const result = await User.updateOne({ _id: new ObjectId(req.auth.sub) }, { $set: changes });
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
      const result = await User.deleteOne({ _id: new ObjectId(req.auth.sub) });
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Utilisateur introuvable' });
      }
      await refreshTokensCollection().deleteMany({ userId: new ObjectId(req.auth.sub) });
      res.status(204).end();
    }),
  );

  router.put(
    '/me/password',
    authenticate,
    wrapAsync(async (req, res) => {
      const { old_password, new_password } = req.body;
      const currentUser = await User.findById(new ObjectId(req.auth.sub));
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

      await refreshTokensCollection().deleteMany({ userId: currentUser._id });
      res.status(204).end();
    }),
  );

  router.get(
    '/',
    wrapAsync(async (req, res) => {
      const docs = await User.find({}).sort({ _id: 1 });
      res.json(docs.map(toEssentialPublicUser));
    }),
  );

  router.get(
    '/:id',
    wrapAsync(async (req, res) => {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Identifiant invalide' });
      }

      const doc = await User.findById(req.params.id);
      if (!doc) return res.status(404).json({ message: 'Utilisateur introuvable' });
      res.json(toPublicUser(doc));
    }),
  );

  return router;
}

module.exports = createUsersRouter;

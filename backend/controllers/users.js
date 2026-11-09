const express = require('express');
const { rateLimit } = require('express-rate-limit');
const { ObjectId } = require('mongodb');
const {
  wrapAsync,
  usersCollection,
  toPublicUser,
  toEssentialPublicUser,
} = require('./services/shared');
const { authenticate } = require('./services/auth-middleware');
const { hashPassword, verifyPassword } = require('./services/password');

function createUsersRouter({ limit = 100, windowMs = 60_000 } = {}) {
  const router = express.Router();

  // Au plus `limit` requêtes par fenêtre et par adresse IP : sans cela, n'importe qui peut
  // saturer la base en répétant les appels.
  router.use(
    rateLimit({
      windowMs,
      limit,
      standardHeaders: true,
      legacyHeaders: false,
      message: { message: 'Trop de requêtes, réessaie plus tard' },
    }),
  );

  // Récupère un utilisateur authentifié
  router.get(
    '/me',
    authenticate,
    wrapAsync(async (req, res) => {
      const user = await usersCollection().findOne({ _id: new ObjectId(req.auth.sub) });
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur introuvable' });
      }
      res.json(toPublicUser(user));
    }),
  );

  // Mets à jour les informations de l'utilisateur authentifié
  // Ni l'email, ni le mot de passe, ni le role
  router.patch(
    '/me',
    authenticate,
    wrapAsync(async (req, res) => {
      const { name, firstName, phoneNumber, birthday, pronoun } = req.body;

      const changes = Object.fromEntries(Object.entries({}));
      if (firstName !== undefined && firstName !== null) {
        changes.firstName = firstName;
      }
      if (name !== undefined && name !== null) {
        changes.name = name;
      }
      if (phoneNumber !== undefined && phoneNumber !== null) {
        changes.phoneNumber = phoneNumber;
      }
      if (pronoun !== undefined && pronoun !== null) {
        changes.pronoun = pronoun;
      }
      if (birthday !== undefined && birthday !== null) {
        changes.birthday = new Date(`${birthday}T00:00:00.000Z`);
      }

      const result = await usersCollection().updateOne(
        { _id: new ObjectId(req.auth.sub) },
        { $set: changes },
      );
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
      const result = await usersCollection().deleteOne({ _id: new ObjectId(req.auth.sub) });
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Utilisateur introuvable' });
      }
      res.status(204).end();
    }),
  );

  // Mets à jour le mot de passe de l'utilisateur authentifié
  router.put(
    '/me/password',
    authenticate,
    wrapAsync(async (req, res) => {
      const { old_password, new_password } = req.body;
      const collection = usersCollection();
      const currentUser = await collection.findOne({ _id: new ObjectId(req.auth.sub) });
      if (!currentUser) {
        return res.status(404).json({ message: 'Utilisateur introuvable' });
      }

      if (!(await verifyPassword(old_password, currentUser.password))) {
        return res.status(401).json({ message: 'Ancien mot de passe incorrect' });
      }

      const result = await collection.updateOne(
        { _id: currentUser._id, password: currentUser.password },
        { $set: { password: await hashPassword(new_password) } },
      );
      if (result.matchedCount === 0) {
        return res.status(409).json({ message: 'Le mot de passe a changé, réessaie' });
      }

      res.status(204).end();
    }),
  );

  // Lister
  router.get(
    '/',
    wrapAsync(async (req, res) => {
      const docs = await usersCollection().find({}).sort({ _id: 1 }).toArray();
      res.json(docs.map(toEssentialPublicUser));
    }),
  );

  // Récupérer
  router.get(
    '/:id',
    wrapAsync(async (req, res) => {
      if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Identifiant invalide' });
      }

      const doc = await usersCollection().findOne({ _id: new ObjectId(req.params.id) });
      if (!doc) return res.status(404).json({ message: 'Utilisateur introuvable' });
      res.json(toPublicUser(doc));
    }),
  );

  return router;
}

module.exports = createUsersRouter;

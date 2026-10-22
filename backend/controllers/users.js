const express = require('express');
const { rateLimit } = require('express-rate-limit');
const { ObjectId } = require('mongodb');
const { wrapAsync, usersCollection, toPublicUser, toEssentialPublicUser } = require('./shared');

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
      const doc = await usersCollection().findOne({ _id: new ObjectId(req.params.id) });
      if (!doc) return res.status(404).json({ message: 'Utilisateur introuvable' });
      res.json(toPublicUser(doc));
    }),
  );

  return router;
}

module.exports = createUsersRouter;

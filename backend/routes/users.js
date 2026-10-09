const express = require('express');
const { rateLimit } = require('express-rate-limit');
const { ObjectId } = require('mongodb');
const { getDb } = require('../db');

// Express 4 n'attrape pas les erreurs d'une route async : on les transmet à next()
const wrap = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

const users = () => getDb().collection('users');
const toUser = (doc) => ({ id: doc._id.toString(), email: doc.email, name: doc.name });

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

  // Enregistrer
  router.post(
    '/',
    wrap(async (req, res) => {
      const { email, name } = req.body;
      try {
        const { insertedId } = await users().insertOne({ email, name });
        res.status(201).json({ id: insertedId.toString(), email, name });
      } catch (error) {
        if (error.code === 11000) {
          return res.status(409).json({ message: 'Un utilisateur avec cet e-mail existe déjà' });
        }
        throw error;
      }
    }),
  );

  // Lister
  router.get(
    '/',
    wrap(async (req, res) => {
      const docs = await users().find({}).sort({ _id: 1 }).limit(100).toArray();
      res.json(docs.map(toUser));
    }),
  );

  // Récupérer
  router.get(
    '/:id',
    wrap(async (req, res) => {
      const doc = await users().findOne({ _id: new ObjectId(req.params.id) });
      if (!doc) return res.status(404).json({ message: 'Utilisateur introuvable' });
      res.json(toUser(doc));
    }),
  );

  return router;
}

module.exports = createUsersRouter;

const express = require('express');
const { ObjectId } = require('mongodb');
const { getDb } = require('../db');

const router = express.Router();

// Express 4 n'attrape pas les erreurs d'une route async : on les transmet à next()
const wrap = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

const users = () => getDb().collection('users');
const toUser = (doc) => ({ id: doc._id.toString(), email: doc.email, name: doc.name });

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

module.exports = router;

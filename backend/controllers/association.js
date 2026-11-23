const express = require('express');
const { rateLimit } = require('express-rate-limit');
const Association = require('../db/models/association');
const { wrapAsync } = require('./services/shared');

function createAssociationRouter({ limit = 10, windowMs = 60_000 } = {}) {
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
      const associations = await Association.find({});
      return res.status(200).json(associations);
    }),
  );

  return router;
}

module.exports = createAssociationRouter;

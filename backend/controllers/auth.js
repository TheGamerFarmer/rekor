const express = require('express');
const { rateLimit } = require('express-rate-limit');
const { wrapAsync, usersCollection } = require('./services/shared');
const { signAccessToken } = require('./services/auth-middleware');
const { hashPassword, verifyPassword } = require('./services/password');

function createAuthRouter({ limit = 10, windowMs = 60_000 } = {}) {
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

  router.post(
    '/register',
    wrapAsync(async (req, res) => {
      const { name, firstName, email, password, phoneNumber, birthday, pronoun } = req.body;

      if (await usersCollection().findOne({ email: { $eq: email } }, { projection: { _id: 1 } })) {
        return res.status(409).json({ message: 'Un utilisateur avec cet e-mail existe déjà' });
      }

      try {
        await usersCollection().insertOne({
          name,
          firstName,
          email,
          password: await hashPassword(password),
          phoneNumber,
          role: 'Visiteur',
          ...(birthday ? { birthday: new Date(`${birthday}T00:00:00.000Z`) } : {}),
          pronoun,
        });
        res.status(201).end();
      } catch (error) {
        if (error.code === 11000) {
          return res.status(409).json({ message: 'Un utilisateur avec cet e-mail existe déjà' });
        }
        throw error;
      }
    }),
  );

  router.post(
    '/login',
    wrapAsync(async (req, res) => {
      const { email, password } = req.body;
      const user = await usersCollection().findOne({ email: { $eq: email } });

      if (!user || !(await verifyPassword(password, user.password))) {
        return res.status(401).json({ message: 'E-mail ou mot de passe incorrect' });
      }

      res.json({
        access_token: signAccessToken(user),
      });
    }),
  );

  return router;
}

module.exports = createAuthRouter;

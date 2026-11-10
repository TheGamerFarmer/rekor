require('../db/db');
const express = require('express');
const { rateLimit } = require('express-rate-limit');
const {
  Types: { ObjectId },
} = require('mongoose');
const User = require('../db/models/user');
const RefreshToken = require('../db/models/refresh-token');
const { wrapAsync } = require('./services/shared');
const {
  InvalidTokenError,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashRefreshToken,
  revokeSession,
} = require('./services/auth-middleware');
const { hashPassword, verifyPassword } = require('./services/password');

async function createRefreshSession(user) {
  const refresh = signRefreshToken(user);
  await RefreshToken.create({
    _id: refresh.sessionId,
    userId: user._id,
    tokenHash: hashRefreshToken(refresh.token),
    expiresAt: refresh.expiresAt,
  });
  return refresh;
}

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

      if (await User.exists({ email: { $eq: email } })) {
        return res.status(409).json({ message: 'Un utilisateur avec cet e-mail existe déjà' });
      }

      try {
        await User.create({
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
      const user = await User.findOne({ email: { $eq: email } });

      if (!user || !(await verifyPassword(password, user.password))) {
        return res.status(401).json({ message: 'E-mail ou mot de passe incorrect' });
      }

      const session = await createRefreshSession(user);
      res.json({
        access_token: signAccessToken(user, session.sessionId),
        refresh_token: session.token,
      });
    }),
  );

  router.post(
    '/refresh',
    wrapAsync(async (req, res) => {
      let claims;
      try {
        claims = verifyRefreshToken(req.body.refresh_token);
      } catch (error) {
        if (error instanceof InvalidTokenError) {
          return res.status(401).json({ message: 'Refresh token invalide ou expiré' });
        }
        throw error;
      }

      if (!ObjectId.isValid(claims.sub)) {
        return res.status(401).json({ message: 'Refresh token invalide ou expiré' });
      }

      const oldTokenHash = hashRefreshToken(req.body.refresh_token);
      const session = await RefreshToken.findOne({
        _id: { $eq: claims.sid },
        userId: { $eq: new ObjectId(claims.sub) },
        tokenHash: { $eq: oldTokenHash },
        expiresAt: { $gt: new Date() },
      });
      if (!session) {
        return res.status(401).json({ message: 'Refresh token invalide ou expiré' });
      }

      const user = await User.findById(session.userId);
      if (!user) {
        await RefreshToken.deleteOne({ _id: session._id });
        return res.status(401).json({ message: 'Refresh token invalide ou expiré' });
      }

      const refresh = signRefreshToken(user, session._id);
      const updated = await RefreshToken.updateOne(
        { _id: session._id, tokenHash: oldTokenHash, expiresAt: { $gt: new Date() } },
        {
          $set: {
            tokenHash: hashRefreshToken(refresh.token),
            expiresAt: refresh.expiresAt,
          },
        },
      );
      if (updated.matchedCount === 0) {
        return res.status(401).json({ message: 'Refresh token invalide ou expiré' });
      }

      res.json({
        access_token: signAccessToken(user, session._id),
        refresh_token: refresh.token,
      });
    }),
  );

  router.post(
    '/logout',
    wrapAsync(async (req, res) => {
      let claims;
      try {
        claims = verifyRefreshToken(req.body.refresh_token);
      } catch (error) {
        if (error instanceof InvalidTokenError) {
          return res.status(401).json({ message: 'Refresh token invalide ou expiré' });
        }
        throw error;
      }

      if (!ObjectId.isValid(claims.sub)) {
        return res.status(401).json({ message: 'Refresh token invalide ou expiré' });
      }

      const userId = new ObjectId(claims.sub);
      const session = await RefreshToken.findOne({
        _id: { $eq: claims.sid },
        userId: { $eq: userId },
        tokenHash: { $eq: hashRefreshToken(req.body.refresh_token) },
        expiresAt: { $gt: new Date() },
      });
      if (!session) {
        return res.status(401).json({ message: 'Refresh token invalide ou expiré' });
      }

      await revokeSession(claims.sid);
      await RefreshToken.deleteOne({
        _id: { $eq: claims.sid },
        userId: { $eq: userId },
      });
      res.status(204).end();
    }),
  );

  return router;
}

module.exports = createAuthRouter;

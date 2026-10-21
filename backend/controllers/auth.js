const { randomBytes, scrypt, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');
const express = require('express');
const { rateLimit } = require('express-rate-limit');
const { wrapAsync, usersCollection } = require('./shared');
const { signAccessToken, authenticate } = require('./auth-middleware');

const scryptAsync = promisify(scrypt);
const SALT_BYTES = 16;
const KEY_BYTES = 64;

async function hashPassword(password) {
  const salt = randomBytes(SALT_BYTES);
  const hash = await scryptAsync(password, salt, KEY_BYTES);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

async function verifyPassword(password, storedHash) {
  if (typeof storedHash !== 'string') return false;
  const [saltHex, hashHex] = storedHash.split(':');
  if (!/^[0-9a-f]{32}$/.test(saltHex) || !/^[0-9a-f]{128}$/.test(hashHex)) return false;
  const salt = Buffer.from(saltHex, 'hex');
  const expectedHash = Buffer.from(hashHex, 'hex');

  const actualHash = await scryptAsync(password, salt, KEY_BYTES);
  return timingSafeEqual(expectedHash, actualHash);
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
      const collection = usersCollection();

      if (await collection.findOne({ email }, { projection: { _id: 1 } })) {
        return res.status(409).json({ message: 'Un utilisateur avec cet e-mail existe déjà' });
      }

      try {
        const { insertedId } = await collection.insertOne({
          name,
          firstName,
          email,
          password: await hashPassword(password),
          phoneNumber,
          role: 'Visiteur',
          ...(birthday ? { birthday: new Date(`${birthday}T00:00:00.000Z`) } : {}),
          pronoun,
        });
        res.status(201).json({ id: insertedId.toString(), email, name, role: 'Visiteur' });
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
      const user = await usersCollection().findOne({ email });

      if (!user || !(await verifyPassword(password, user.password))) {
        return res.status(401).json({ message: 'E-mail ou mot de passe incorrect' });
      }

      res.json({
        token: signAccessToken(user),
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    }),
  );

  router.get('/me', authenticate, (req, res) => {
    res.json({ id: req.auth.sub, role: req.auth.role });
  });

  return router;
}

module.exports = createAuthRouter;

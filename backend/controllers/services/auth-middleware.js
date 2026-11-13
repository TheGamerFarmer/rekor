const { createHash, createHmac, randomUUID, timingSafeEqual } = require('node:crypto');
const { getRedis } = require('./redisCache');
const { userContext } = require('../../db/plugins/audit');
const { USER_ROLES } = require('../../db/enums');

/** Validity duration of access tokens, in seconds. */
const ACCESS_TOKEN_LIFETIME_SECONDS = 15 * 60;
/** Validity duration of refresh tokens, in seconds. */
const REFRESH_TOKEN_LIFETIME_SECONDS = 30 * 24 * 60 * 60;

class InvalidTokenError extends Error {}
class RevokedSessionError extends Error {}

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    const error = new Error('JWT_SECRET doit contenir au moins 32 octets');
    error.status = 500;
    throw error;
  }
  return secret;
}

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

/**
 * Signs and returns a JWT access token for the given user.
 *
 * @param {{ _id: { toString(): string }, role: string }} user
 * @param association
 * @param sessionId
 * @returns {string} Signed JWT
 */
function signAccessToken(user, association, sessionId = randomUUID()) {
  const now = Math.floor(Date.now() / 1000);
  return signToken(
    {
      sub: user._id.toString(),
      role: user.role,
      association: association.name,
      sid: sessionId,
      iat: now,
      exp: now + ACCESS_TOKEN_LIFETIME_SECONDS,
    },
    getSecret(),
  );
}

/**
 * Signs and returns a JWT refresh token for the given user.
 *
 * @param {{ _id: { toString(): string }, role: string }} user
 * @param association
 * @param sessionId
 * @returns {string} Signed JWT
 */
function signRefreshToken(user, association, sessionId = randomUUID()) {
  const now = Math.floor(Date.now() / 1000);
  return {
    token: signToken(
      {
        sub: user._id.toString(),
        role: user.role,
        association: association.name,
        sid: sessionId,
        jti: randomUUID(),
        token_use: 'refresh',
        iat: now,
        exp: now + REFRESH_TOKEN_LIFETIME_SECONDS,
      },
      getRefreshSecret(),
    ),
    sessionId,
    expiresAt: new Date((now + REFRESH_TOKEN_LIFETIME_SECONDS) * 1000),
  };
}

function signToken(payload, secret) {
  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const encodedPayload = encode(payload);
  const unsignedToken = `${header}.${encodedPayload}`;
  const signature = createHmac('sha256', secret).update(unsignedToken).digest('base64url');

  return `${unsignedToken}.${signature}`;
}

/**
 * Verifies a JWT access token and returns its decoded payload.
 * Throws `InvalidTokenError` if the token is not a string, is malformed,
 * has an invalid signature, uses an unsupported algorithm, or has expired.
 *
 * @param {unknown} token
 * @param secret
 * @returns {{ sub: string, role: string, iat: number, exp: number }}
 */
function verifyToken(token, secret) {
  if (typeof token !== 'string') throw new InvalidTokenError();
  const parts = token.split('.');
  if (parts.length !== 3 || parts.some((part) => !part)) throw new InvalidTokenError();

  let header;
  let payload;
  try {
    header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch {
    throw new InvalidTokenError();
  }

  if (header.alg !== 'HS256' || header.typ !== 'JWT') throw new InvalidTokenError();

  const expected = createHmac('sha256', secret).update(`${parts[0]}.${parts[1]}`).digest();
  const actual = Buffer.from(parts[2], 'base64url');
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    throw new InvalidTokenError();
  }

  const now = Math.floor(Date.now() / 1000);
  if (
    typeof payload.sub !== 'string' ||
    !USER_ROLES.includes(payload.role) ||
    !Number.isInteger(payload.exp) ||
    payload.exp <= now
  ) {
    throw new InvalidTokenError();
  }

  return payload;
}

async function verifyAccessToken(token) {
  const payload = verifyToken(token, getSecret());
  if (payload.token_use === 'refresh' || typeof payload.sid !== 'string') {
    throw new InvalidTokenError();
  }
  if (await getRedis().exists(`revoked:sid:${payload.sid}`)) {
    throw new RevokedSessionError();
  }
  return payload;
}

function verifyRefreshToken(token) {
  const payload = verifyToken(token, getRefreshSecret());
  if (
    payload.token_use !== 'refresh' ||
    typeof payload.sid !== 'string' ||
    typeof payload.jti !== 'string' ||
    typeof payload.iat !== 'number'
  ) {
    throw new InvalidTokenError();
  }
  return payload;
}

function getRefreshSecret() {
  return createHmac('sha256', getSecret()).update('rekor-refresh-token-v1').digest();
}

function hashRefreshToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Express middleware. Extracts and validates the Bearer token from the `Authorization` header.
 * Sets `req.auth` to the token payload and stores the user ID in the async request context.
 * Responds with 401 if the header is missing, malformed, or the token is invalid.
 */
async function authenticate(req, res, next) {
  const [scheme, token, extra] = (req.get('authorization') || '').split(' ');
  if (scheme !== 'Bearer' || !token || extra) {
    return res.status(401).json({ message: 'Authentification requise' });
  }

  try {
    req.auth = await verifyAccessToken(token);
    const store = userContext.getStore();
    if (store) store.userId = req.auth.sub;
    return next();
  } catch (error) {
    if (error instanceof InvalidTokenError) {
      return res.status(401).json({ message: 'Token invalide ou expiré' });
    } else if (error instanceof RevokedSessionError) {
      return res.status(401).json({ message: 'Session révoquée' });
    }
    return next(error);
  }
}

/**
 * Returns an Express middleware that checks whether the authenticated user holds one of
 * the allowed roles. Must be placed after {@link authenticate}.
 * Responds with 401 if not authenticated, 403 if the role is not in `allowedRoles`.
 *
 * @param {...string} allowedRoles
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({ message: 'Authentification requise' });
    }
    if (
      !allowedRoles.some(
        (role) =>
          USER_ROLES.includes(role) &&
          USER_ROLES.indexOf(req.auth.role) <= USER_ROLES.indexOf(role),
      )
    ) {
      return res.status(403).json({ message: 'Accès interdit' });
    }
    return next();
  };
}

async function revokeSession(sessionId) {
  await getRedis().set(`revoked:sid:${sessionId}`, '1', 'EX', ACCESS_TOKEN_LIFETIME_SECONDS);
}

module.exports = {
  InvalidTokenError,
  RevokedSessionError,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashRefreshToken,
  authenticate,
  authorize,
  revokeSession,
};

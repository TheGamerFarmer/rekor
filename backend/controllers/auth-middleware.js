const { createHmac, timingSafeEqual } = require('node:crypto');

const ROLES = ['Entraineur', 'Capitaine', 'Adhérent', 'Visiteur'];
// Validity time of the access token in second
const TOKEN_LIFETIME_SECONDS = 15 * 60;

class InvalidTokenError extends Error {}

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

function signAccessToken(user) {
  const now = Math.floor(Date.now() / 1000);
  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const payload = encode({
    sub: user._id.toString(),
    role: user.role,
    iat: now,
    exp: now + TOKEN_LIFETIME_SECONDS,
  });
  const unsignedToken = `${header}.${payload}`;
  const signature = createHmac('sha256', getSecret()).update(unsignedToken).digest('base64url');

  return `${unsignedToken}.${signature}`;
}

function verifyAccessToken(token) {
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

  const expected = createHmac('sha256', getSecret()).update(`${parts[0]}.${parts[1]}`).digest();
  const actual = Buffer.from(parts[2], 'base64url');
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    throw new InvalidTokenError();
  }

  const now = Math.floor(Date.now() / 1000);
  if (
    typeof payload.sub !== 'string' ||
    !ROLES.includes(payload.role) ||
    !Number.isInteger(payload.exp) ||
    payload.exp <= now
  ) {
    throw new InvalidTokenError();
  }

  return payload;
}

function authenticate(req, res, next) {
  const [scheme, token, extra] = (req.get('authorization') || '').split(' ');
  if (scheme !== 'Bearer' || !token || extra) {
    return res.status(401).json({ message: 'Authentification requise' });
  }

  try {
    req.auth = verifyAccessToken(token);
    return next();
  } catch (error) {
    if (error instanceof InvalidTokenError) {
      return res.status(401).json({ message: 'Token invalide ou expiré' });
    }
    return next(error);
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({ message: 'Authentification requise' });
    }
    if (!allowedRoles.some((role) => ROLES.includes(role) && req.auth.role === role)) {
      return res.status(403).json({ message: 'Accès interdit' });
    }
    return next();
  };
}

module.exports = { signAccessToken, authenticate, authorize };

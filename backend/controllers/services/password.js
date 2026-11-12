const { randomBytes, scrypt, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');

const scryptAsync = promisify(scrypt);
const SALT_BYTES = 16;
const KEY_BYTES = 64;

/**
 * Hashes a plaintext password using scrypt with a random salt.
 *
 * @param {string} password
 * @returns {Promise<string>} `"<saltHex>:<hashHex>"` string suitable for storage.
 */
async function hashPassword(password) {
  const salt = randomBytes(SALT_BYTES);
  const hash = await scryptAsync(password, salt, KEY_BYTES);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

/**
 * Verifies a plaintext password against a stored hash produced by {@link hashPassword}.
 * Returns `false` for any input that cannot be a valid stored hash (wrong type, wrong format)
 * without throwing.
 *
 * @param {string} password
 * @param {unknown} storedHash
 * @returns {Promise<boolean>}
 */
async function verifyPassword(password, storedHash) {
  if (typeof storedHash !== 'string') return false;
  const [saltHex, hashHex] = storedHash.split(':');
  if (!/^[0-9a-f]{32}$/.test(saltHex) || !/^[0-9a-f]{128}$/.test(hashHex)) return false;
  const salt = Buffer.from(saltHex, 'hex');
  const expectedHash = Buffer.from(hashHex, 'hex');

  const actualHash = await scryptAsync(password, salt, KEY_BYTES);
  return timingSafeEqual(expectedHash, actualHash);
}

module.exports = { hashPassword, verifyPassword };

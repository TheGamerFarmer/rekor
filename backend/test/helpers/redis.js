const { configureRedisClient } = require('../../controllers/services/auth-middleware');

const revokedSessions = new Set();

configureRedisClient({
  exists: async (key) => Number(revokedSessions.has(key)),
  set: async (key) => {
    revokedSessions.add(key);
    return 'OK';
  },
});

function clearRevokedSessions() {
  revokedSessions.clear();
}

module.exports = { clearRevokedSessions };

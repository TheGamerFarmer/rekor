// PORT must be set before index.js is loaded so `const port = process.env.PORT || 3000`
// captures 0 (OS-assigned free port) instead of 3000.
process.env.PORT = '0';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { MongoMemoryServer } = require('mongodb-memory-server');

/** Remove all SIGTERM/SIGINT listeners and return them for later restoration. */
function saveSignals() {
  const sigterm = process.rawListeners('SIGTERM').slice();
  const sigint = process.rawListeners('SIGINT').slice();
  process.removeAllListeners('SIGTERM');
  process.removeAllListeners('SIGINT');
  return { sigterm, sigint };
}

function restoreSignals({ sigterm, sigint }) {
  process.removeAllListeners('SIGTERM');
  process.removeAllListeners('SIGINT');
  sigterm.forEach((l) => process.on('SIGTERM', l));
  sigint.forEach((l) => process.on('SIGINT', l));
}

describe('index.js (in-process)', () => {
  describe('TRUST_PROXY', () => {
    it('configure trust proxy si TRUST_PROXY est défini', () => {
      const indexPath = require.resolve('../index');
      const original = require.cache[indexPath];
      delete require.cache[indexPath];

      const prev = process.env.TRUST_PROXY;
      process.env.TRUST_PROXY = '2';

      try {
        const freshApp = require('../index');
        assert.strictEqual(freshApp.get('trust proxy'), 2);
      } finally {
        delete require.cache[indexPath];
        if (prev === undefined) delete process.env.TRUST_PROXY;
        else process.env.TRUST_PROXY = prev;
        require.cache[indexPath] = original;
      }
    });
  });

  describe('cron callback', () => {
    it('exécute cleanupExpiredAccounts sans erreur', async () => {
      const cron = require('node-cron');
      const cleanup = require('../jobs/cleanupExpiredAccounts');

      let capturedCallback;
      const originalSchedule = cron.schedule;
      cron.schedule = (_expr, cb) => {
        capturedCallback = cb;
        return { stop: () => {} };
      };
      const originalCleanup = cleanup.cleanupExpiredAccounts;
      cleanup.cleanupExpiredAccounts = async () => {};

      const { start } = require('../index');
      const saved = saveSignals();
      const originalExit = process.exit;
      let resolveExit;
      process.exit = (code) => resolveExit(code);
      const exitPromise = new Promise((resolve) => {
        resolveExit = resolve;
      });
      const prevUri = process.env.MONGODB_URI;
      delete process.env.MONGODB_URI;

      try {
        await start();
        await capturedCallback();
      } finally {
        cron.schedule = originalSchedule;
        cleanup.cleanupExpiredAccounts = originalCleanup;
        process.emit('SIGTERM');
        await exitPromise;
        process.exit = originalExit;
        restoreSignals(saved);
        if (prevUri === undefined) delete process.env.MONGODB_URI;
        else process.env.MONGODB_URI = prevUri;
      }
    });

    it('intercepte et loggue les erreurs de cleanupExpiredAccounts', async () => {
      const cron = require('node-cron');
      const cleanupModule = require('../jobs/cleanupExpiredAccounts');

      let capturedCallback;
      const originalSchedule = cron.schedule;
      cron.schedule = (_expr, cb) => {
        capturedCallback = cb;
        return { stop: () => {} };
      };
      const originalCleanup = cleanupModule.cleanupExpiredAccounts;
      cleanupModule.cleanupExpiredAccounts = async () => {
        throw new Error('DB failure');
      };

      const { start } = require('../index');
      const saved = saveSignals();
      const originalExit = process.exit;
      let resolveExit;
      process.exit = (code) => resolveExit(code);
      const exitPromise = new Promise((resolve) => {
        resolveExit = resolve;
      });
      const prevUri = process.env.MONGODB_URI;
      delete process.env.MONGODB_URI;

      const logs = [];
      const originalError = console.error;
      console.error = (...args) => logs.push(args.map(String).join(' '));

      try {
        await start();
        await capturedCallback();
        assert.ok(logs.some((l) => l.includes('DB failure') && l.includes('[Cron]')));
      } finally {
        cron.schedule = originalSchedule;
        cleanupModule.cleanupExpiredAccounts = originalCleanup;
        console.error = originalError;
        process.emit('SIGTERM');
        await exitPromise;
        process.exit = originalExit;
        restoreSignals(saved);
        if (prevUri === undefined) delete process.env.MONGODB_URI;
        else process.env.MONGODB_URI = prevUri;
      }
    });
  });

  describe('start()', () => {
    it('démarre le serveur et arrête sur SIGTERM sans base de données', async () => {
      const { start } = require('../index');

      const originalExit = process.exit;
      let resolveExit;
      const exitPromise = new Promise((resolve) => {
        resolveExit = resolve;
      });
      process.exit = (code) => resolveExit(code);
      const saved = saveSignals();

      const prevUri = process.env.MONGODB_URI;
      delete process.env.MONGODB_URI;

      try {
        await start();
        await new Promise((resolve) => setTimeout(resolve, 20)); // let listen callback fire
        process.emit('SIGTERM');
        const code = await exitPromise;
        assert.strictEqual(code, 0);
      } finally {
        process.exit = originalExit;
        restoreSignals(saved);
        if (prevUri === undefined) delete process.env.MONGODB_URI;
        else process.env.MONGODB_URI = prevUri;
      }
    });

    it('se connecte à MongoDB et initialise le schéma si MONGODB_URI est défini', async () => {
      const { start } = require('../index');

      const mongod = await MongoMemoryServer.create();
      const originalExit = process.exit;
      let resolveExit;
      const exitPromise = new Promise((resolve) => {
        resolveExit = resolve;
      });
      process.exit = (code) => resolveExit(code);
      const saved = saveSignals();

      const prevUri = process.env.MONGODB_URI;
      const prevDb = process.env.MONGODB_DB;
      process.env.MONGODB_URI = mongod.getUri();
      process.env.MONGODB_DB = 'inprocess-start-test';

      try {
        await start();
        await new Promise((resolve) => setTimeout(resolve, 20)); // let listen callback fire
        process.emit('SIGTERM');
        const code = await exitPromise;
        assert.strictEqual(code, 0);
      } finally {
        process.exit = originalExit;
        restoreSignals(saved);
        if (prevUri === undefined) delete process.env.MONGODB_URI;
        else process.env.MONGODB_URI = prevUri;
        if (prevDb === undefined) delete process.env.MONGODB_DB;
        else process.env.MONGODB_DB = prevDb;
        await mongod.stop().catch(() => {});
      }
    });
  });
});

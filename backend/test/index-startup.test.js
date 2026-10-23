const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');
const { MongoMemoryServer } = require('mongodb-memory-server');

async function startServer(environment) {
  const child = spawn(process.execPath, [path.join(__dirname, '..', 'index.js')], {
    env: { ...process.env, PORT: '0', TRUST_PROXY: '1', MONGODB_URI: '', ...environment },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stdout = '';
  let stderr = '';
  child.stdout.setEncoding('utf8').on('data', (chunk) => {
    stdout += chunk;
  });
  child.stderr.setEncoding('utf8').on('data', (chunk) => {
    stderr += chunk;
  });

  const closed = new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', (code, signal) => resolve({ code, signal }));
  });

  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Le serveur n’a pas démarré')), 10_000);
      child.stdout.on('data', () => {
        if (
          stdout.includes('Server running on port 0') &&
          (!environment.MONGODB_URI || stdout.includes('Connecté à MongoDB'))
        ) {
          clearTimeout(timeout);
          resolve();
        }
      });
      child.once('close', (code) => {
        clearTimeout(timeout);
        reject(new Error(`Le serveur s’est arrêté (${code}) : ${stderr}`));
      });
    });

    child.kill('SIGTERM');
    const result = await closed;
    return { result, stdout, stderr };
  } finally {
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
  }
}

test('le serveur démarre sans base et s’arrête proprement sur SIGTERM', async () => {
  const { result } = await startServer({});
  assert.deepStrictEqual(result, { code: 0, signal: null });
});

test('le démarrage se connecte à MongoDB et initialise le schéma', async () => {
  const mongod = await MongoMemoryServer.create();

  try {
    const { result, stdout } = await startServer({
      MONGODB_URI: mongod.getUri(),
      MONGODB_DB: 'startup-test',
    });
    assert.deepStrictEqual(result, { code: 0, signal: null });
    assert.match(stdout, /Connecté à MongoDB/);
  } finally {
    await mongod.stop();
  }
});

test('une erreur de connexion MongoDB arrête le démarrage avec un message', async () => {
  const child = spawn(
    process.execPath,
    [
      '--require',
      path.join(__dirname, 'helpers', 'fail-db-connect.js'),
      path.join(__dirname, '..', 'index.js'),
    ],
    {
      env: {
        ...process.env,
        PORT: '0',
        MONGODB_URI: 'mongodb://unused',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  let stderr = '';
  child.stderr.setEncoding('utf8').on('data', (chunk) => {
    stderr += chunk;
  });

  const result = await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', (code, signal) => resolve({ code, signal }));
  });

  assert.deepStrictEqual(result, { code: 1, signal: null });
  assert.match(stderr, /Démarrage impossible : Forced database connection failure/);
});

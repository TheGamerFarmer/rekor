import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { defineConfig } from '@playwright/test';
import type { Backend } from './e2e/fixtures';

const FRONT_URL = 'http://localhost:4200';
const BACK_URL = 'http://localhost:3000';

// Comment le back est lancé pour les tests, par ordre de priorité :
//   1. BACKEND_IMAGE définie (CI) : cette image Docker, construite depuis le code de la PR ;
//   2. sinon, si ../backend existe (monorepo) : le code source, avec `node index.js` ;
//   3. sinon : la dernière image publiée sur GHCR.
const BACKEND_IMAGE = process.env['BACKEND_IMAGE'];
const backendDir = resolve(process.cwd(), '../backend');
const useLocalSource = !BACKEND_IMAGE && existsSync(join(backendDir, 'index.js'));

if (useLocalSource && !existsSync(join(backendDir, 'node_modules'))) {
  throw new Error(
    'backend/node_modules est introuvable : lance `npm install` dans backend/ (ou définis BACKEND_IMAGE pour utiliser une image Docker).',
  );
}

const docker = 'docker run --rm --name rekor-e2e-backend -p 3000:3000';
const backendCommand = BACKEND_IMAGE
  ? `${docker} --pull missing ${BACKEND_IMAGE}` // image construite localement : on ne la télécharge jamais
  : useLocalSource
    ? 'node index.js'
    : `${docker} --pull always ghcr.io/thegamerfarmer/rekor/backend:latest`; // "always" évite un vieux :latest en cache

export default defineConfig<{ backend: Backend }>({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: FRONT_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  // Les mêmes tests tournent deux fois : back simulé, puis vrai back.
  projects: [
    { name: 'mock', use: { backend: 'mock' } },
    { name: 'real', use: { backend: 'real' } },
  ],
  webServer: [
    {
      // Le front appelle /api/*, redirigé vers le back (voir proxy.conf.json)
      command: 'npm start -- --proxy-config proxy.conf.json',
      url: FRONT_URL,
      reuseExistingServer: !process.env['CI'],
      timeout: 120_000,
    },
    {
      command: backendCommand,
      cwd: useLocalSource ? backendDir : undefined,
      env: useLocalSource ? { PORT: '3000' } : undefined,
      url: BACK_URL,
      reuseExistingServer: !process.env['CI'],
      timeout: 180_000,
      // SIGTERM pour que le client docker (ou node) arrête proprement le back
      gracefulShutdown: { signal: 'SIGTERM', timeout: 10_000 },
    },
  ],
});

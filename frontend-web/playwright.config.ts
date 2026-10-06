import { defineConfig } from '@playwright/test';
import type { Backend } from './e2e/fixtures';

const FRONT_URL = 'http://localhost:4200';
const BACK_URL = 'http://localhost:3000';
// Image du back téléchargée depuis GHCR (surchargeable : BACKEND_IMAGE=ghcr.io/.../backend:<sha>)
const BACKEND_IMAGE =
  process.env['BACKEND_IMAGE'] ?? 'ghcr.io/thegamerfarmer/rekor/backend:latest';

// noinspection JSUnusedGlobalSymbols
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
      // --pull always : récupère toujours la dernière image publiée (sinon un :latest ancien resterait en cache)
      command: `docker run --rm --pull always --name rekor-e2e-backend -p 3000:3000 ${BACKEND_IMAGE}`,
      url: BACK_URL,
      reuseExistingServer: !process.env['CI'],
      timeout: 180_000,
      // SIGTERM pour que le client docker arrête proprement le conteneur
      gracefulShutdown: { signal: 'SIGTERM', timeout: 10_000 },
    },
  ],
});

import { test as base, expect, type APIRequestContext, type Page } from '@playwright/test';

export type Backend = 'mock' | 'real';

type Arrange = (steps: {
  /** Préparation en mode "mock" : on simule les réponses du back. */
  mock?: (page: Page) => Promise<unknown>;
  /** Préparation en mode "real" : on met le vrai back dans l'état voulu (ex. créer des données). */
  real?: (request: APIRequestContext) => Promise<unknown>;
}) => Promise<void>;

export const test = base.extend<{ backend: Backend; arrange: Arrange; mockGuard: void }>({
  // Défini par le "project" Playwright (voir playwright.config.ts)
  backend: ['mock', { option: true }],

  // En mode mock, tout appel /api/* non simulé échoue bruyamment (501) au lieu de passer inaperçu.
  // Enregistré en premier : les routes ajoutées ensuite par un test sont prioritaires.
  mockGuard: [
    async ({ backend, page }, use) => {
      if (backend === 'mock') {
        await page.route('**/api/**', (route) =>
          route.fulfill({
            status: 501,
            json: {
              message: `Mock manquant : ${route.request().method()} ${route.request().url()}`,
            },
          }),
        );
      }
      await use();
    },
    { auto: true },
  ],

  arrange: async ({ backend, page, request }, use) => {
    await use(async ({ mock, real }) => {
      if (backend === 'mock') await mock?.(page);
      else await real?.(request);
    });
  },
});

export { expect };

import { test, expect } from './fixtures';

// Même scénario dans les DEUX modes : l'application appelle le back avec le client généré
// (HealthService) et affiche le statut reçu.
test("l'application affiche le statut du back", async ({ page, arrange }) => {
  await arrange({
    mock: (p) => p.route('**/api/', (route) => route.fulfill({ json: { status: 'ok' } })),
  });

  await page.goto('/');

  await expect(page.getByTestId('backend-status')).toHaveText('Backend : ok');
});

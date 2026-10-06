import { test, expect } from './fixtures';

// Exemple de test valable dans les DEUX modes : même scénario, même assertion.
// Le front n'appelle pas encore l'API, donc l'appel est fait depuis la page ;
// à remplacer par un vrai scénario (clic, formulaire...) quand une fonctionnalité utilisera le back.
test('GET /api/ renvoie le statut ok', async ({ page, arrange }) => {
  await arrange({
    mock: (p) => p.route('**/api/', (route) => route.fulfill({ json: { status: 'ok' } })),
  });

  await page.goto('/');
  const body = await page.evaluate(() => fetch('/api/').then((r) => r.json()));

  expect(body).toEqual({ status: 'ok' });
});

import { randomUUID } from 'node:crypto';
import { test, expect } from './fixtures';

test('la connexion affiche une erreur lorsque le backend répond en erreur', async ({
  page,
  arrange,
}) => {
  const credentials = {
    associationName: 'Gières Volley-Ball',
    email: `playwright-${randomUUID()}@example.com`,
    password: 'motdepasse-invalide',
  };

  await arrange({
    mock: (p) =>
      p.route('**/api/auth/login', (route) =>
        route.fulfill({ status: 401, json: { message: 'Identifiants invalides' } }),
      ),
  });

  await page.goto('/connexion');
  await page.locator('#email').fill(credentials.email);
  await page.locator('#password').fill(credentials.password);

  const responsePromise = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/api/auth/login' &&
      response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Se connecter' }).click();
  const response = await responsePromise;

  expect(response.request().postDataJSON()).toEqual(credentials);
  expect(response.ok()).toBe(false);
  await expect(page.getByRole('alert')).toHaveText('E-mail ou mot de passe incorrect.');
  await expect(page).toHaveURL(/\/connexion$/);
  await expect(page.getByRole('link', { name: 'Mon compte' })).toHaveCount(0);
});

import { test, expect } from './fixtures';

test("la page d'accueil s'affiche sans erreur", async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');

  await expect(page.locator('app-root')).toBeVisible();
  expect(errors).toEqual([]);
});

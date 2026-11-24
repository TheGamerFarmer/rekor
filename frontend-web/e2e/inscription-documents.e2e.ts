import { test, expect } from './fixtures';

test('les consentements nécessitent de parcourir chaque document jusqu’en bas', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1000, height: 600 });
  await page.goto('/inscription');

  const privacyCheckbox = page.locator('[formControlName="privacyPolicy"]');
  const rulesCheckbox = page.locator('[formControlName="internalRules"]');

  await privacyCheckbox.click();
  await rulesCheckbox.click();
  await expect(privacyCheckbox).not.toBeChecked();
  await expect(rulesCheckbox).not.toBeChecked();

  const privacyPopup = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'politique de confidentialité' }).click();
  const privacyPage = await privacyPopup;
  await expect(privacyPage.getByRole('status')).toContainText('Faites défiler');
  await privacyCheckbox.click();
  await expect(privacyCheckbox).not.toBeChecked();

  await privacyPage.locator('.privacy-card').evaluate((element) => {
    element.lastElementChild?.scrollIntoView();
  });
  await expect(privacyPage.getByRole('status')).toContainText('Vous avez atteint la fin');
  await expect(page.getByRole('link', { name: 'politique de confidentialité' })).toHaveClass(
    /document-link-opened/,
  );
  await privacyCheckbox.click();
  await expect(privacyCheckbox).toBeChecked();
  await expect(rulesCheckbox).not.toBeChecked();

  const rulesPopup = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'règlement intérieur' }).click();
  const rulesPage = await rulesPopup;
  await expect(rulesPage.getByRole('status')).toContainText('Faites défiler');
  await rulesCheckbox.click();
  await expect(rulesCheckbox).not.toBeChecked();

  await rulesPage.locator('.reglement-card').evaluate((element) => {
    element.lastElementChild?.scrollIntoView();
  });
  await expect(rulesPage.getByRole('status')).toContainText('Vous avez atteint la fin');
  await expect(page.getByRole('link', { name: 'règlement intérieur' })).toHaveClass(
    /document-link-opened/,
  );
  await rulesCheckbox.click();
  await expect(rulesCheckbox).toBeChecked();
});

test('la lecture ne débloque que le formulaire qui a ouvert le document', async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 1000, height: 600 });
  await page.goto('/inscription');
  const otherRegistration = await context.newPage();
  await otherRegistration.goto('/inscription');

  const popup = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'politique de confidentialité' }).click();
  const document = await popup;
  await document.locator('.privacy-card').evaluate((element) => {
    element.lastElementChild?.scrollIntoView();
  });
  await expect(document.getByRole('status')).toContainText('Vous avez atteint la fin');
  await expect(page.getByRole('link', { name: 'politique de confidentialité' })).toHaveClass(
    /document-link-opened/,
  );

  const firstCheckbox = page.locator('[formControlName="privacyPolicy"]');
  const otherCheckbox = otherRegistration.locator('[formControlName="privacyPolicy"]');
  await firstCheckbox.click();
  await otherCheckbox.click();
  await expect(firstCheckbox).toBeChecked();
  await expect(otherCheckbox).not.toBeChecked();
});

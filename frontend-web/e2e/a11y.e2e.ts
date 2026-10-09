import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';

type Violations = Awaited<ReturnType<AxeBuilder['analyze']>>['violations'];

// Une entrée par page de l'application. `ready` attend que la page ait fini de s'afficher
// avant l'analyse (sinon on analyserait un état de chargement).
const pages = [
  {
    name: "page d'accueil",
    path: '/',
    ready: (page: Page) => expect(page.getByTestId('backend-status')).toHaveText('Backend : ok'),
  },
];

for (const { name, path, ready } of pages) {
  test(`accessibilité : ${name}`, async ({ page, arrange }) => {
    await arrange({
      mock: (p) => p.route('**/api/', (route) => route.fulfill({ json: { status: 'ok' } })),
    });
    await page.goto(path);
    await ready(page);

    // WCAG 2.0 et 2.1, niveaux A et AA. Les "bonnes pratiques" d'axe (repères de page...) sont exclues.
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(violations, formatViolations(violations)).toEqual([]);
  });
}

function formatViolations(violations: Violations): string {
  return violations
    .map(
      (v) =>
        `[${v.impact}] ${v.id} : ${v.help}\n    ${v.helpUrl}\n` +
        v.nodes.map((n) => `    - ${n.target.join(' ')}`).join('\n'),
    )
    .join('\n\n');
}

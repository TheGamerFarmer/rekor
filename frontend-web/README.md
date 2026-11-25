# FrontendWeb

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.0.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Tests

Il y a trois commandes principales de test de tests

```bash
npm run test
```

Execute les tests unitaires en boite blanche

```bash
npm run test:all
```

Execute les tests unitaires en boite blanche suivi les test d'interfaces en boite noir

```bash
npm run verify
```

Cherche des potentiels erreurs ou des mauvaises pratiques avnat de lancer les tests unitaires en boite blanche suivi les test d'interfaces en boite noir.

### Trois commandes de test d'interface à connaître

```bash
npx playwright test --ui
```

interface qui rejoue chaque étape.

```bash
npx playwright codegen http://localhost:4200
```

Tu cliques dans l'app, il écrit le test.

```bash
npx playwright show-report
```

Un rapport, avec la trace complète d'un test échoué.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

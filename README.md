# Rekor

<!-- À compléter : en une ou deux phrases, le sujet de la SAE et ce que fait l'application. -->

Projet de SAE (BUT Informatique, semestre 5), réalisé en équipe.

## Équipe

<!-- À compléter : noms et rôles. -->

## Architecture

| Dossier         | Rôle               | Technologies              |
| --------------- | ------------------ | ------------------------- |
| `backend/`      | API REST           | Node.js, Express, MongoDB |
| `frontend-web/` | Application web    | Angular                   |
| `frontend-app/` | Application mobile | Flutter                   |

Le back décrit son API dans `backend/openapi.js` (schémas Zod). À partir de ce **contrat** sont générés `backend/openapi.json` et les clients Angular et Dart (voir « Contrat d'API »). La documentation interactive est servie par le back sur `/api-docs`.

## Prérequis

| Outil          | Version                                                                                           | Pour quoi                             |
| -------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Docker Desktop | récent (Compose v2)                                                                               | lancer la stack complète              |
| Node.js        | 20.19 ou plus pour le back ; 22.22.3 ou plus, 24.15 ou plus, ou 26 pour le front web (Angular 22) | back et front web                     |
| Flutter        | 3.47.6 (la version utilisée par la CI)                                                            | l'application mobile                  |
| Java           | 17 ou plus (Java 8 ne suffit pas)                                                                 | générer les clients depuis le contrat |

## Lancer la stack

1. Crée le fichier `.env` à la racine, à partir du modèle, et change le mot de passe :
   - PowerShell : `Copy-Item .env.example .env`
   - Fais-le **avant le premier démarrage** : MongoDB ne crée son compte administrateur qu'à ce moment-là.
2. Démarre tout :
   ```
   docker compose up -d --build
   ```
3. Les adresses :
   - application web : http://localhost:8080
   - API : http://localhost:3000, documentation : http://localhost:3000/api-docs
   - MongoDB : `127.0.0.1:27017` (ouvert uniquement sur ta machine)

`docker compose down` arrête la stack en gardant les données. `docker compose down -v` supprime aussi la base.

## Développer

### Back (`backend/`)

```
npm install
node index.js
```

Sans la variable `MONGODB_URI`, le back démarre sans base de données. Pour travailler avec le MongoDB du compose, lance `docker compose up -d db`, puis définis `MONGODB_URI=mongodb://127.0.0.1:27017`, `MONGODB_DB`, `MONGODB_USER` et `MONGODB_PASSWORD` (les valeurs du `.env`) avant `node index.js`.

### Front web (`frontend-web/`)

```
npm install
npm start -- --proxy-config proxy.conf.json
```

Le proxy redirige `/api` vers le back sur le port 3000. Dans Docker, c'est nginx qui joue ce rôle.

### Application mobile (`frontend-app/`)

```
flutter pub get
flutter run
```

L'application vise le back sur `http://10.0.2.2:3000`, adresse de ta machine vue depuis l'émulateur Android. Sur un vrai téléphone : `flutter run --dart-define=API_URL=http://<IP de ton PC>:3000`.

## Tests

| Où              | Tests unitaires et d'intégration          | Qualité du code                                                 |
| --------------- | ----------------------------------------- | --------------------------------------------------------------- |
| `backend/`      | `npm test`, `npm run test:coverage`       | `npm run lint`, `npm run format:check`                          |
| `frontend-web/` | `npm test`, `npm run test:coverage`       | `npm run lint`, `npm run format:check`                          |
| `frontend-app/` | `flutter test`, `flutter test --coverage` | `flutter analyze`, `dart format lib test integration_test tool` |

- **Seuils de couverture** : 80 % de lignes au minimum (70 % de branches pour le back et le front web). Les commandes `test:coverage` échouent en dessous.
- **Tests fonctionnels du front web** : `npx playwright install chromium` une fois, puis `npx playwright test`. Chaque test tourne deux fois : avec un faux back (`mock`), puis avec le vrai (`real`, lancé depuis `backend/`, après un `npm install` dedans). `npx playwright test --ui` ouvre une interface pour suivre un test pas à pas. Un test d'accessibilité (axe) vérifie chaque page.
- **Tests fonctionnels de l'application** : `flutter test integration_test` sur un émulateur ou un téléphone branché. `--dart-define=BACKEND=mock` ne lance que le mode simulé, sans back. Un test d'accessibilité vérifie la taille des zones tactiles, les libellés et le contraste.
- **Les tests du back** utilisent un `mongod` temporaire : `npm install` le télécharge une fois.

## Contrat d'API

Le contrat est la source unique de l'API. **Ne modifie jamais** `frontend-web/src/app/api/`, `frontend-app/api_client/` ni `backend/openapi.json` à la main : ils sont générés.

Quand tu ajoutes ou changes une route :

1. Modifie `backend/openapi.js` (schémas et routes).
2. Écris la route dans `backend/` et ses tests.
3. Régénère le contrat et les clients, depuis `backend/` : `npm run clients:generate`. Il faut Java.
4. Commite le résultat avec le reste.

La CI vérifie que les fichiers générés sont à jour, et qu'une PR ne casse pas le contrat existant. Pour casser le contrat volontairement, ajoute le label `breaking-change` à la PR et explique pourquoi.

## Formatage

Le formatage est vérifié par la CI. Avant de commiter :

- `backend/` et `frontend-web/` : `npm run format`
- `frontend-app/` : `dart format lib test integration_test tool`

Utilise la même version de Flutter que la CI (3.47.6) : `dart format` varie légèrement d'une version à l'autre.

### Formatage automatique avant chaque commit (facultatif)

Un hook Git formate à ta place les fichiers de ton commit. À activer une fois par clone :

```
git config core.hooksPath .githooks
```

Il demande d'avoir lancé `npm install` dans `backend/` et `frontend-web/`, et d'avoir `dart` dans le PATH ; sinon il prévient et ne formate pas. Si un fichier du commit a aussi des modifications non ajoutées, il n'y touche pas. `git commit --no-verify` le contourne exceptionnellement.

## Intégration continue

| Workflow                | Rôle                                                                    |
| ----------------------- | ----------------------------------------------------------------------- |
| `Backend CI`            | lint, tests et couverture du back ; sur `main`, publie l'image Docker   |
| `Frontend Web CI`       | lint, tests, couverture et build du front ; sur `main`, publie l'image  |
| `Frontend App CI`       | analyse, tests, couverture, APK, build iOS, tests sur émulateur Android |
| `E2E`                   | tests Playwright du front web, en modes `mock` et `real`                |
| `Contract`              | clients générés à jour, et pas de rupture du contrat                    |
| `Format`                | vérifie le formatage (Prettier et `dart format`)                        |
| `Main docker construct` | publie le compose complet comme package `rekor`                         |
| `Mirror to GRICAD`      | copie chaque push vers le dépôt GitLab de l'IUT                         |

CodeQL analyse la sécurité du code, et Dependabot propose chaque semaine les mises à jour de dépendances.

Pour fusionner dans `main`, une PR doit passer tous les checks obligatoires et être approuvée par un autre membre de l'équipe. Les images sont publiées sur `ghcr.io/thegamerfarmer/rekor/…` ; pour lancer la version publiée :

```
docker compose -f oci://ghcr.io/thegamerfarmer/rekor:latest up
```

avec `DB_USER`, `DB_PASSWORD` et `DB_NAME` définis dans l'environnement.

## Contribuer

1. Crée une branche à partir de `main` : `feature/<ticket>-<description>` ou `fix/<ticket>-<description>`.
2. Commite par petits pas, avec des messages clairs.
3. Ouvre une PR vers `main` en suivant le modèle, avec le ticket Jira dans le titre.
4. Corrige ce que la CI et la relecture demandent, puis fusionne une fois approuvée.

Ne fusionne jamais une PR de Dependabot dont les checks sont rouges : ils signalent une vraie incompatibilité.

## Problèmes fréquents

- **`failed to connect to the docker API`** : Docker Desktop n'est pas lancé.
- **Le back est refusé par MongoDB (authentification)** : la base a été créée avant le `.env`. Supprime son volume (`docker compose down -v`) et relance.
- **`UnsupportedClassVersionError` à la génération des clients** : ton `java` est trop ancien (8). Pointe vers un JDK 17 ou plus.
- **Un port est déjà utilisé (3000, 8080, 27017)** : un ancien conteneur tourne encore. `docker ps` pour le trouver, `docker stop <nom>` pour l'arrêter.
- **La CI de formatage échoue** : lance les commandes de la section « Formatage » et commite le résultat.

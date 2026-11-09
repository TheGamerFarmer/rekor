# Guide de l'équipe : outils, automatisations et façon de travailler

Ce guide explique tout ce qui a été mis en place autour du code de Rekor : ce qu'il faut installer, comment s'en servir, ce qui se lance tout seul, et surtout **pourquoi**. Il s'adresse à toute l'équipe, y compris à ceux qui n'ont jamais utilisé Docker, GitHub Actions ou des tests automatiques.

**Comment le lire**

- **Tu démarres aujourd'hui** : parties 1 et 2, puis la partie 10 (une journée type) et l'aide-mémoire de l'annexe A.
- **Tu veux comprendre le système** : lis dans l'ordre. Chaque partie s'appuie sur la précédente.
- **Quelque chose est rouge ou ne marche pas** : va directement à la partie 11 (dépannage).

Les commandes sont écrites pour PowerShell (Windows). Sur macOS et Linux, ce sont les mêmes, sauf la copie de fichier (`cp` à la place de `Copy-Item`).

## Sommaire

- [1. Vue d'ensemble](#1-vue-densemble)
  - [1.1 Ce qu'on construit](#11-ce-quon-construit)
  - [1.2 Un seul dépôt pour trois applications](#12-un-seul-dépôt-pour-trois-applications)
  - [1.3 Pourquoi autant d'automatisation ?](#13-pourquoi-autant-dautomatisation-)
  - [1.4 Le cycle d'une modification](#14-le-cycle-dune-modification)
  - [1.5 Glossaire](#15-glossaire)
- [2. Installer son poste](#2-installer-son-poste)
  - [2.1 Les outils](#21-les-outils)
  - [2.2 Cloner et préparer](#22-cloner-et-préparer)
  - [2.3 Le fichier `.env`](#23-le-fichier-env)
  - [2.4 Lancer toute la stack](#24-lancer-toute-la-stack)
  - [2.5 Travailler sur une seule application](#25-travailler-sur-une-seule-application)
  - [2.6 Vérifier que tout marche](#26-vérifier-que-tout-marche)
- [3. Comprendre les briques](#3-comprendre-les-briques)
  - [3.1 Docker et Docker Compose](#31-docker-et-docker-compose)
  - [3.2 Le backend](#32-le-backend)
  - [3.3 Le web (Angular)](#33-le-web-angular)
  - [3.4 L'app mobile (Flutter)](#34-lapp-mobile-flutter)
- [4. Le contrat d'API](#4-le-contrat-dapi)
  - [4.1 Le problème](#41-le-problème)
  - [4.2 La solution : un contrat unique](#42-la-solution--un-contrat-unique)
  - [4.3 Ce qui en est tiré](#43-ce-qui-en-est-tiré)
  - [4.4 Utiliser un client généré](#44-utiliser-un-client-généré)
  - [4.5 Modifier le contrat : la procédure](#45-modifier-le-contrat--la-procédure)
  - [4.6 Les changements qui cassent le contrat](#46-les-changements-qui-cassent-le-contrat)
- [5. Les tests](#5-les-tests)
  - [5.1 Pourquoi et quels niveaux](#51-pourquoi-et-quels-niveaux)
  - [5.2 Faux back et vrai back](#52-faux-back-et-vrai-back)
  - [5.3 Les tests du back](#53-les-tests-du-back)
  - [5.4 Les tests unitaires du web (Vitest)](#54-les-tests-unitaires-du-web-vitest)
  - [5.5 Les tests fonctionnels du web (Playwright)](#55-les-tests-fonctionnels-du-web-playwright)
  - [5.6 Les tests de l'app (Flutter)](#56-les-tests-de-lapp-flutter)
  - [5.7 L'accessibilité](#57-laccessibilité)
  - [5.8 La couverture de tests](#58-la-couverture-de-tests)
  - [5.9 Écrire un bon test](#59-écrire-un-bon-test)
- [6. La qualité du code](#6-la-qualité-du-code)
  - [6.1 Trois notions à ne pas confondre](#61-trois-notions-à-ne-pas-confondre)
  - [6.2 Le formatage](#62-le-formatage)
  - [6.3 Le hook Git : le formatage automatique](#63-le-hook-git--le-formatage-automatique)
  - [6.4 CodeQL : l'analyse de sécurité](#64-codeql--lanalyse-de-sécurité)
  - [6.5 Dependabot : les mises à jour de dépendances](#65-dependabot--les-mises-à-jour-de-dépendances)
- [7. Git au quotidien](#7-git-au-quotidien)
  - [7.1 Les branches](#71-les-branches)
  - [7.2 Les commits](#72-les-commits)
  - [7.3 Ouvrir une pull request](#73-ouvrir-une-pull-request)
  - [7.4 La relecture](#74-la-relecture)
  - [7.5 Garder sa branche à jour](#75-garder-sa-branche-à-jour)
  - [7.6 Les règles de protection de `main`](#76-les-règles-de-protection-de-main)
- [8. La CI en détail](#8-la-ci-en-détail)
  - [8.1 Le vocabulaire de GitHub Actions](#81-le-vocabulaire-de-github-actions)
  - [8.2 Quand ça se déclenche](#82-quand-ça-se-déclenche)
  - [8.3 Les workflows du projet](#83-les-workflows-du-projet)
  - [8.4 Ce qui se passe sur une PR](#84-ce-qui-se-passe-sur-une-pr)
  - [8.5 Lire un échec](#85-lire-un-échec)
  - [8.6 Les artefacts](#86-les-artefacts)
- [9. Après la fusion sur `main`](#9-après-la-fusion-sur-main)
  - [9.1 Les images Docker](#91-les-images-docker)
  - [9.2 La stack complète](#92-la-stack-complète)
  - [9.3 L'application mobile](#93-lapplication-mobile)
  - [9.4 Le miroir GRICAD](#94-le-miroir-gricad)
- [10. Une journée type : ajouter un champ](#10-une-journée-type--ajouter-un-champ)
- [11. Dépannage](#11-dépannage)
- [12. Ce qui reste à faire](#12-ce-qui-reste-à-faire)
- [Annexe A : aide-mémoire des commandes](#annexe-a--aide-mémoire-des-commandes)
- [Annexe B : la carte des fichiers de configuration](#annexe-b--la-carte-des-fichiers-de-configuration)

## 1. Vue d'ensemble

### 1.1 Ce qu'on construit

Un seul dépôt GitHub contient trois applications qui se parlent :

```text
   frontend-web/  ───┐
   (Angular)         │
                     ├──►  backend/  ───►  MongoDB
   frontend-app/  ───┘     (API REST)
   (Flutter)
```

- `backend/` : une API REST en Node.js (Express) qui stocke ses données dans MongoDB.
- `frontend-web/` : l'application web, en Angular, qui tourne dans un navigateur.
- `frontend-app/` : l'application mobile, en Flutter, pour Android et iOS.

Les deux applications clientes ne parlent jamais à la base de données : elles passent toujours par l'API.

### 1.2 Un seul dépôt pour trois applications

On appelle ça un **monorepo**. Ses avantages pour nous :

- Une même modification peut changer l'API **et** les deux clients, dans une seule PR, relue d'un bloc.
- Une seule CI, une seule histoire Git, un seul endroit où chercher.
- Impossible d'oublier de mettre à jour un client : la CI vérifie qu'ils sont tous d'accord avec l'API.

### 1.3 Pourquoi autant d'automatisation ?

À huit personnes, les problèmes arrivent vite. Chaque outil de ce guide répond à l'un d'eux :

| Problème                                                       | Ce qui l'évite                                                 |
| -------------------------------------------------------------- | -------------------------------------------------------------- |
| Quelqu'un change l'API et casse le web ou l'app sans le savoir | Le contrat d'API, les clients générés, la détection de rupture |
| « Ça marche chez moi »                                         | La CI, qui rejoue tout sur une machine neutre                  |
| Du code cassé arrive sur `main`                                | Les PR obligatoires, les tests et les checks bloquants         |
| Chacun écrit avec son style, les diffs sont illisibles         | Prettier, `dart format`, le hook Git                           |
| Une faille de sécurité passe inaperçue                         | CodeQL                                                         |
| Les dépendances vieillissent                                   | Dependabot                                                     |
| On ne sait pas ce qui est testé                                | La couverture avec un seuil minimum                            |
| L'interface est inutilisable au clavier ou au lecteur d'écran  | Les tests d'accessibilité                                      |

Le principe : **la machine vérifie le répétitif, pour que les relectures portent sur le fond.**

### 1.4 Le cycle d'une modification

```text
 1. Branche       on crée une branche depuis main
 2. Code          on code, avec les tests, en local
 3. Commit        le hook Git formate les fichiers
 4. Push + PR     GitHub lance les vérifications (la CI)
 5. Relecture     un coéquipier lit le code et approuve
 6. Fusion        dans main, si tout est vert
 7. Publication   images Docker, release de l'app, miroir GRICAD (automatique)
```

On ne pousse **jamais** directement sur `main`.

### 1.5 Glossaire

| Terme                         | Ce que ça veut dire                                                                                 |
| ----------------------------- | --------------------------------------------------------------------------------------------------- |
| **Monorepo**                  | Un dépôt Git qui contient plusieurs applications                                                    |
| **API REST**                  | Un programme qui répond à des requêtes HTTP (`GET /users`) en renvoyant du JSON                     |
| **Contrat d'API**             | La description officielle de l'API : routes, formats d'entrée et de sortie. Ici, au format OpenAPI  |
| **Client généré**             | Du code écrit automatiquement à partir du contrat, que le web et l'app utilisent pour appeler l'API |
| **PR (pull request)**         | La demande de fusion d'une branche dans `main`, avec relecture                                      |
| **CI (intégration continue)** | Des vérifications lancées automatiquement à chaque push et chaque PR                                |
| **Check**                     | Une de ces vérifications, qui sort en vert (OK) ou en rouge (échec)                                 |
| **Test unitaire**             | Vérifie un petit morceau de code isolé                                                              |
| **Test fonctionnel (E2E)**    | Vérifie un scénario complet, comme un utilisateur : on ouvre l'appli et on clique                   |
| **Mock (faux back)**          | Un back simulé qui renvoie des réponses prévues d'avance                                            |
| **Couverture**                | Le pourcentage de lignes de code exécutées par les tests                                            |
| **Lint**                      | Un outil qui repère les erreurs et les mauvaises pratiques dans le code                             |
| **Formatage**                 | La mise en page du code (espaces, guillemets, retours à la ligne), faite automatiquement            |
| **Hook Git**                  | Un script que Git lance tout seul à un moment précis, par exemple avant un commit                   |
| **Image Docker**              | Un paquet qui contient une application et tout ce qu'il lui faut pour tourner                       |
| **Registre (GHCR)**           | L'endroit où l'on publie les images Docker : GitHub Container Registry                              |

## 2. Installer son poste

### 2.1 Les outils

| Outil          | Version                                                  | Pour quoi                             | Vérifier            |
| -------------- | -------------------------------------------------------- | ------------------------------------- | ------------------- |
| Git            | récent                                                   | tout                                  | `git --version`     |
| Docker Desktop | récent (Compose v2)                                      | lancer la base et la stack complète   | `docker --version`  |
| Node.js        | 20.19+ pour le back ; 22.22.3+, 24.15+ ou 26 pour le web | back et web                           | `node --version`    |
| Flutter        | **3.47.6** exactement                                    | l'application mobile                  | `flutter --version` |
| Java           | 17 ou plus (le 8 ne suffit pas)                          | générer les clients depuis le contrat | `java -version`     |

Pourquoi **Flutter 3.47.6 exactement** ? Le formatage du code Dart change légèrement d'une version à l'autre. Si ta version est différente de celle de la CI, ton `dart format` donnera un résultat que la CI refusera.

Pour le web, si ta version de Node est trop ancienne, Angular refuse de démarrer et l'indique clairement.

### 2.2 Cloner et préparer

À faire **une seule fois** par personne :

```powershell
git clone https://github.com/TheGamerFarmer/rekor.git
cd rekor

# Active le formatage automatique avant chaque commit (voir 6.3)
git config core.hooksPath .githooks

# Dépendances du back et du web
cd backend; npm install; cd ..
cd frontend-web; npm install; cd ..

# Dépendances de l'app mobile
cd frontend-app; flutter pub get; cd ..

# Navigateur utilisé par les tests Playwright (une seule fois)
cd frontend-web; npx playwright install chromium; cd ..
```

Le `npm install` du back télécharge aussi un vrai serveur MongoDB temporaire, utilisé par les tests. C'est normal que ce soit long la première fois.

### 2.3 Le fichier `.env`

Les mots de passe ne sont **jamais** écrits dans le code ni commités. Ils vivent dans un fichier `.env` à la racine, que Git ignore.

```powershell
Copy-Item .env.example .env
```

Ouvre `.env` et change les trois valeurs : `DB_USER`, `DB_PASSWORD` et `DB_NAME`.

> **Fais-le avant le premier démarrage de la base.** MongoDB ne crée son compte administrateur qu'au tout premier lancement. Si tu changes le mot de passe après, la base garde l'ancien : il faut alors supprimer son volume (voir 11).

### 2.4 Lancer toute la stack

```powershell
docker compose up -d --build
```

Trois conteneurs démarrent : la base MongoDB, le back, et le web (servi par nginx). Les adresses :

| Quoi                               | Adresse                                              |
| ---------------------------------- | ---------------------------------------------------- |
| Application web                    | http://localhost:8080                                |
| API                                | http://localhost:3000                                |
| Documentation interactive de l'API | http://localhost:3000/api-docs                       |
| MongoDB                            | `127.0.0.1:27017` (ouvert uniquement sur ta machine) |

Pour arrêter :

- `docker compose down` arrête tout **en gardant les données**.
- `docker compose down -v` arrête tout et **supprime la base**.

Si tout va bien, la page web affiche « Backend : ok » : c'est la preuve que le navigateur, nginx, le back et le contrat fonctionnent ensemble.

### 2.5 Travailler sur une seule application

Pour développer, on lance souvent une application à la main plutôt que via Docker.

**Back** (dans `backend/`) :

```powershell
node index.js
```

Sans la variable `MONGODB_URI`, le back démarre **sans base** : les routes qui en ont besoin répondent 503, la route `/` répond toujours. Pour utiliser la base du compose, lance `docker compose up -d db`, puis définis `MONGODB_URI=mongodb://127.0.0.1:27017`, `MONGODB_DB`, `MONGODB_USER` et `MONGODB_PASSWORD` (les valeurs de ton `.env`) avant `node index.js`.

**Web** (dans `frontend-web/`) :

```powershell
npm start -- --proxy-config proxy.conf.json
```

Le proxy redirige les appels `/api` vers le back sur le port 3000. Dans Docker, c'est nginx qui joue ce rôle.

**App** (dans `frontend-app/`) :

```powershell
flutter run
```

Sur l'émulateur Android, l'app vise le back à l'adresse `http://10.0.2.2:3000` : c'est la façon dont l'émulateur désigne ta machine. Sur un vrai téléphone, donne l'adresse de ton PC : `flutter run --dart-define=API_URL=http://<IP de ton PC>:3000`.

### 2.6 Vérifier que tout marche

| Vérification                                 | Résultat attendu                    |
| -------------------------------------------- | ----------------------------------- |
| http://localhost:8080                        | « Backend : ok »                    |
| http://localhost:3000/api-docs               | la documentation de l'API s'affiche |
| `npm run test:coverage` dans `backend/`      | tous les tests passent              |
| `npm run test:coverage` dans `frontend-web/` | tous les tests passent              |
| `flutter test` dans `frontend-app/`          | tous les tests passent              |

Si l'une de ces étapes échoue, regarde la partie 11 avant de demander de l'aide.

## 3. Comprendre les briques

### 3.1 Docker et Docker Compose

- Une **image** est un paquet figé : une application plus tout ce qu'il lui faut pour tourner. Un **conteneur** est une image en cours d'exécution.
- Un **Dockerfile** explique comment fabriquer une image. Chaque dossier d'application en a un (`backend/Dockerfile`, `frontend-web/Dockerfile`).
- **Docker Compose** lance plusieurs conteneurs ensemble, décrits dans un fichier YAML. On en a deux :
  - `docker-compose.yml` **fabrique** les images à partir du code local : c'est celui du développement.
  - `docker-compose.prod.yml` **télécharge** les images déjà publiées sur GHCR : c'est celui qu'on utilise pour lancer la version publiée, sans le code.
- Les **healthchecks** disent à Docker si un conteneur est vraiment prêt. Le back ne démarre que quand MongoDB est prêt (`depends_on` avec `service_healthy`), ce qui évite les erreurs de connexion au lancement.
- Les données de MongoDB vivent dans un **volume**, qui survit à `docker compose down` mais pas à `docker compose down -v`.
- Le back tourne sous un utilisateur non administrateur (`USER node`) dans son conteneur : c'est une précaution de sécurité.

### 3.2 Le backend

| Fichier           | Rôle                                                                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `index.js`        | assemble l'application : documentation, validateur, routes, gestion des erreurs                                                           |
| `openapi.js`      | le **contrat** : schémas et routes (voir partie 4)                                                                                        |
| `db.js`           | connexion à MongoDB (`connect`, `getDb`, `close`) ; renvoie une erreur 503 si la base n'est pas connectée                                 |
| `schema.js`       | `ensureSchema()` : crée la collection `users`, son validateur et l'index unique sur `email`, à chaque démarrage (sans effet si déjà fait) |
| `routes/users.js` | les routes `/users`                                                                                                                       |
| `scripts/`        | `export-openapi.js` et `generate-clients.js`                                                                                              |
| `test/`           | tous les tests du back                                                                                                                    |

Le chemin d'une requête :

```text
requête ─► validateur OpenAPI ─► limite de requêtes ─► route ─► MongoDB
             (400 si invalide)      (429 si trop)         │
réponse ◄───── validateur (vérifie aussi la réponse) ◄────┘
```

À retenir :

- **Le validateur vérifie les requêtes ET les réponses** contre le contrat. Si le code renvoie quelque chose qui ne correspond pas au contrat, la réponse est une erreur 500. C'est voulu : le contrat reste vrai.
- Toutes les erreurs sont en JSON, sous la forme `{ "message": "..." }` : 400 (requête invalide), 404 (introuvable), 409 (e-mail déjà utilisé), 429 (trop de requêtes), 503 (base indisponible).
- **Limite de requêtes** : 100 par minute et par adresse IP sur `/users`. Sans elle, n'importe qui pourrait saturer la base en répétant les appels (c'est ce que CodeQL avait signalé).
- Dans Docker, le back ne voit que l'adresse de nginx. La variable `TRUST_PROXY=1` (déjà dans les deux compose) lui dit de lire la vraie adresse du client dans l'en-tête `X-Forwarded-For`. Sans elle, tous les visiteurs partageraient la même limite.
- La documentation interactive (`/api-docs`) est générée à partir du contrat : on peut y essayer les routes directement.

### 3.3 Le web (Angular)

- Le dossier `src/app/api/` est **généré** (voir partie 4). On l'utilise, on ne le modifie jamais.
- `app.config.ts` déclare le client avec `provideApi('/api')` : tous les appels vont vers `/api/...`.
- Cette adresse `/api` est routée différemment selon le contexte : par `proxy.conf.json` avec `ng serve` en développement, et par `nginx.conf` dans le conteneur Docker. Dans les deux cas, ça arrive sur le back, port 3000.
- Au démarrage, l'application appelle la route de santé du back et affiche le résultat dans un élément repéré par `data-testid="backend-status"`. C'est ce que les tests vérifient.

### 3.4 L'app mobile (Flutter)

- `api_client/` est un paquet Dart **généré** (`rekor_api`), déclaré dans `pubspec.yaml` comme dépendance locale.
- `lib/api/api_client.dart` est un petit enrobage écrit à la main, qui expose `ApiClient.instance`. Les écrans passent par lui, par exemple `ApiClient.instance.health()`.
- L'adresse du back se règle avec `--dart-define=API_URL=...`. Par défaut : `http://10.0.2.2:3000` (l'émulateur Android).
- Sur Android, la permission `INTERNET` est déclarée dans `AndroidManifest.xml` : sans elle, l'app ne peut pas appeler le réseau.

## 4. Le contrat d'API

C'est la pièce centrale du projet. Si tu ne dois comprendre qu'une partie à fond, c'est celle-ci.

### 4.1 Le problème

Sans règle commune, le back, le web et l'app finissent par avoir chacun leur propre idée de l'API : un champ renommé d'un côté, un type différent de l'autre, et tout casse à l'exécution, souvent le jour de la démo.

### 4.2 La solution : un contrat unique

L'API est décrite **une seule fois**, dans `backend/openapi.js`, avec la bibliothèque Zod. Voici, par exemple, comment est décrit un utilisateur :

```js
const User = z
  .object({
    id: UserId,
    email: z.email(),
    name: z.string(),
  })
  .openapi("User");
```

Puis chaque route est enregistrée avec ses réponses possibles :

```js
registry.registerPath({
  method: "post",
  path: "/users",
  operationId: "createUser",
  request: { body: { required: true, content: json(UserInput) } },
  responses: {
    201: { description: "Utilisateur créé", content: json(User) },
    400: failure("Requête invalide"),
    409: failure("Un utilisateur avec cet e-mail existe déjà"),
    // ...
  },
});
```

Le format s'appelle **OpenAPI** : c'est un standard, compris par beaucoup d'outils.

### 4.3 Ce qui en est tiré

```text
backend/openapi.js
      │   npm run clients:generate
      ├──►  backend/openapi.json          le contrat, en JSON
      ├──►  frontend-web/src/app/api/    client TypeScript pour Angular
      └──►  frontend-app/api_client/     client Dart pour Flutter
```

Le même contrat sert aussi à :

- **valider** chaque requête et chaque réponse dans le back ;
- **afficher** la documentation interactive `/api-docs` ;
- **vérifier** dans les tests que `openapi.json` correspond au code.

Les trois dossiers générés sont versionnés dans Git (la CI en a besoin). Mais on ne les édite **jamais** à la main : la prochaine génération écraserait la modification.

### 4.4 Utiliser un client généré

Dans Angular, on injecte un service généré et on appelle sa méthode :

```ts
private readonly health = inject(HealthService);
// ...
this.health.getHealth()
```

Dans Flutter, on passe par l'enrobage :

```dart
final response = await ApiClient.instance.health();
```

Les noms des méthodes viennent des `operationId` du contrat : `createUser` donne une méthode du même nom. Ils sont donc prévisibles et identiques d'un client à l'autre.

### 4.5 Modifier le contrat : la procédure

1. Modifie `backend/openapi.js` (schémas et routes).
2. Écris la route dans `backend/routes/` et ses tests.
3. Dans `backend/`, lance **`npm run clients:generate`** (il faut Java).
4. Commite **tout** : le code, `openapi.json` et les clients régénérés.

Le check `Contract - check` de la CI refait la génération et compare : si un fichier généré diffère de celui que tu as commité, il échoue et te dit de relancer la commande.

Si tu as un **conflit Git** sur un fichier généré, ne le résous pas à la main : prends l'une ou l'autre version, puis relance `npm run clients:generate`, qui produit la bonne.

### 4.6 Les changements qui cassent le contrat

Sur chaque PR, l'outil **oasdiff** compare ton contrat à celui de `main`.

| Cassant (échec de la CI)                  | Non cassant (accepté)                        |
| ----------------------------------------- | -------------------------------------------- |
| Supprimer ou renommer un champ de réponse | Ajouter une nouvelle route                   |
| Rendre un champ de requête obligatoire    | Ajouter un champ **facultatif**              |
| Supprimer une route                       | Ajouter un code de réponse (par exemple 429) |
| Changer le type d'un champ                | Ajouter une valeur à une liste de réponses   |

Pourquoi c'est cassant : l'app mobile déjà installée sur un téléphone ne sait pas qu'on a renommé un champ.

Une rupture est parfois voulue (tout le monde est d'accord et les clients sont mis à jour dans la même PR). On ajoute alors le label **`breaking-change`** à la PR, et on explique pourquoi dans sa description.

## 5. Les tests

### 5.1 Pourquoi et quels niveaux

Un test est un petit programme qui vérifie que ton code fait ce qu'il doit. Il protège contre les régressions : quelqu'un modifie un fichier, un test rougit, on le voit tout de suite.

```text
            /\
           /  \        Fonctionnels (E2E) : peu nombreux, lents,
          /----\       proches de ce que fait un utilisateur
         /      \
        /--------\     Intégration : le back avec une vraie base
       /          \
      /------------\   Unitaires : nombreux, rapides, isolés
```

On en a de chaque sorte, plus un test de **contrat** qui est vérifié par la CI (voir 4.5).

### 5.2 Faux back et vrai back

Les tests fonctionnels du web et de l'app tournent **deux fois**, avec le même scénario :

| Mode   | Le back est...                                   | Avantage                                           |
| ------ | ------------------------------------------------ | -------------------------------------------------- |
| `mock` | simulé, il renvoie des réponses prévues d'avance | rapide, stable, ne dépend de rien                  |
| `real` | le vrai, avec sa vraie base                      | prouve que le client et l'API s'entendent vraiment |

Si un test en mode `mock` appelle une route qu'on n'a pas simulée, il échoue avec le message « Mock manquant » (code 501), au lieu de passer sans rien vérifier. Quand tu vois ce message, il manque une réponse simulée dans ton test.

### 5.3 Les tests du back

Ils sont dans `backend/test/`, avec les outils intégrés à Node (`node:test`) et `supertest`, qui envoie de vraies requêtes HTTP à l'application sans ouvrir de port.

| Fichier                   | Ce qu'il vérifie                                                    |
| ------------------------- | ------------------------------------------------------------------- |
| `app.test.js`             | `GET /` répond `ok`                                                 |
| `swagger.test.js`         | la documentation est servie                                         |
| `db.test.js`              | la connexion à MongoDB (réussite et échec)                          |
| `contract.test.js`        | `openapi.json` correspond à `openapi.js`                            |
| `users.test.js`           | les routes `/users` avec un **vrai** MongoDB temporaire             |
| `users-sans-base.test.js` | les routes répondent 503 sans base, la route `/` répond toujours    |
| `rate-limit.test.js`      | la limite de requêtes (429) et son fonctionnement derrière un proxy |

Le test le plus simple, en entier :

```js
const test = require("node:test");
const assert = require("node:assert");
const request = require("supertest");
const app = require("../index");

test("GET / renvoie status ok", async () => {
  const res = await request(app).get("/");
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.status, "ok");
});
```

Les tests de `/users` utilisent `mongodb-memory-server` : il lance un vrai `mongod` temporaire avant les tests (`before`) et l'arrête après (`after`). Rien n'est installé sur ta machine et tes vraies données ne sont jamais touchées.

Commandes (dans `backend/`) :

```powershell
npm test                              # toute la suite, sans couverture
npm run test:coverage                 # avec la couverture et ses seuils
node --test test/users.test.js        # un seul fichier
```

### 5.4 Les tests unitaires du web (Vitest)

Ils sont à côté du code, dans des fichiers `*.spec.ts`. L'application appelle le back dès sa création ; dans les tests, on ne fait pas de vrai appel réseau : on utilise `HttpTestingController`, qui permet de répondre soi-même à la requête.

```ts
it('should show "indisponible" when the backend fails', async () => {
  const { fixture, request } = createApp();
  request.flush("panne", { status: 503, statusText: "Service Unavailable" });
  await fixture.whenStable();
  const status = fixture.nativeElement.querySelector(
    '[data-testid="backend-status"]',
  );
  expect(status?.textContent).toContain("Backend : indisponible");
});
```

Ce test simule une panne du back et vérifie que l'application l'affiche. Commandes (dans `frontend-web/`) : `npm test` et `npm run test:coverage`.

### 5.5 Les tests fonctionnels du web (Playwright)

Playwright pilote un vrai navigateur. Les tests sont dans `frontend-web/e2e/`, dans des fichiers `*.e2e.ts`. Le fichier `fixtures.ts` fournit trois outils :

- **`backend`** : `mock` ou `real`, selon le « projet » Playwright qui exécute le test ;
- **`arrange`** : prépare l'état de départ, avec une version pour chaque mode ;
- **`mockGuard`** : en mode `mock`, fait échouer tout appel `/api` non simulé (le « Mock manquant »).

Un test complet :

```ts
import { test, expect } from "./fixtures";

test("l'application affiche le statut du back", async ({ page, arrange }) => {
  await arrange({
    mock: (p) =>
      p.route("**/api/", (route) => route.fulfill({ json: { status: "ok" } })),
  });

  await page.goto("/");

  await expect(page.getByTestId("backend-status")).toHaveText("Backend : ok");
});
```

Ici, `arrange.mock` décrit la réponse simulée pour le mode `mock`. En mode `real`, il n'y a rien à préparer : c'est le vrai back qui répond « ok ». Pour mettre le vrai back dans un état précis (par exemple créer des données), on utilise `arrange.real`.

On trouve les éléments avec `getByTestId('...')` : un attribut `data-testid` n'est pas modifié par un changement de texte ou de style, donc les tests restent stables.

Commandes (dans `frontend-web/`) :

```powershell
npx playwright test                    # les deux modes
npx playwright test --project=mock     # un seul mode
npx playwright test --ui               # interface pour suivre un test pas à pas
npx playwright test --headed           # voir le navigateur
npx playwright show-report             # le rapport du dernier lancement
```

En local, le mode `real` démarre le back depuis `../backend` : il faut avoir fait `npm install` dans ce dossier. En CI, il démarre une image Docker du back **fabriquée à partir du code de la PR**, donc il teste bien ta modification, pas la version publiée.

### 5.6 Les tests de l'app (Flutter)

Deux dossiers :

- `test/` : tests unitaires et de widgets (`flutter_test`), rapides, sans appareil ;
- `integration_test/` : l'application complète, sur un émulateur ou un téléphone.

Les tests d'intégration réutilisent le principe mock/real : `installBackend(mode)` installe le client simulé ou réel, et `pumpUntilFound` laisse l'interface avancer jusqu'à ce qu'un texte apparaisse (le temps de la réponse réseau).

```dart
testWidgets("affiche le statut du back", (tester) async {
  installBackend(mode);
  app.main();

  await pumpUntilFound(tester, find.text('Backend : ok'));
});
```

Commandes (dans `frontend-app/`) :

```powershell
flutter test                                              # unitaires et widgets
flutter test --coverage                                   # avec couverture
flutter test integration_test                             # sur un appareil, les deux modes
flutter test integration_test --dart-define=BACKEND=mock  # uniquement le mode simulé
```

### 5.7 L'accessibilité

Une application accessible est utilisable par tous : au clavier, avec un lecteur d'écran, avec une vue faible. On le vérifie automatiquement.

- **Web** : le fichier `e2e/a11y.e2e.ts` utilise **axe-core**. Il ouvre chaque page et signale les violations des règles WCAG 2.0 et 2.1, niveaux A et AA : image sans texte alternatif, bouton sans nom, champ sans libellé, contraste insuffisant, etc. Une entrée par page dans la liste `pages` du fichier. En cas d'échec, le message donne la règle, sa gravité, un lien d'explication et l'élément fautif.
- **App** : `test/accessibility_test.dart` utilise les consignes de `flutter_test` : taille minimale des zones tactiles (48 dp sur Android, 44 pt sur iOS), libellé de chaque élément cliquable, contraste du texte.

> **Règle d'équipe : quand tu ajoutes une page ou un écran, tu ajoutes son test d'accessibilité.**

Les outils automatiques ne trouvent qu'une partie des problèmes : ils ne jugent pas si un texte alternatif est pertinent, ni si la navigation au clavier est logique. Un test vert ne veut pas dire « accessible ». Essaie aussi de naviguer avec la touche Tab.

### 5.8 La couverture de tests

La **couverture** est le pourcentage de lignes de code exécutées pendant les tests. Une ligne jamais exécutée n'est protégée par rien.

| Où   | Outil                                                  | Seuil minimum                                                     |
| ---- | ------------------------------------------------------ | ----------------------------------------------------------------- |
| Back | `c8`                                                   | 80 % de lignes, de fonctions et d'instructions ; 70 % de branches |
| Web  | Vitest (fournisseur v8)                                | 80 % de lignes, de fonctions et d'instructions ; 70 % de branches |
| App  | `flutter test --coverage` + `tool/check_coverage.dart` | 80 % de lignes                                                    |

Sous le seuil, la commande échoue, et donc la CI aussi. Quelques précisions :

- Le **code généré** n'est pas compté (le web l'exclut explicitement ; l'app ne compte que `lib/`).
- Un fichier qu'**aucun test ne charge** est compté comme non couvert (`all: true` côté back ; le script Dart côté app), pour qu'on ne puisse pas gonfler le chiffre en oubliant un fichier.
- Si ton code fait baisser la couverture sous le seuil, **écris les tests qui manquent**. On ne baisse pas le seuil.
- Pour voir ligne par ligne ce qui n'est pas couvert, ouvre le rapport HTML : `backend/coverage/lcov-report/index.html` côté back.

> Une couverture élevée ne prouve pas que les tests sont bons : elle montre seulement que le code a été exécuté, pas que le résultat a été vérifié. Un test sans `assert` couvre des lignes et ne vérifie rien.

### 5.9 Écrire un bon test

- **Un test, un comportement.** Son nom, en français, dit ce qui est vérifié : « renvoie 404 si l'utilisateur n'existe pas ».
- **Indépendant des autres** : il prépare lui-même son état et ne dépend pas de l'ordre d'exécution (c'est le rôle de `beforeEach` dans les tests du back).
- **Déterministe** : même résultat à chaque lancement. Pas d'appel réseau vers l'extérieur, pas de dépendance à l'heure.
- **Il peut échouer.** Pour t'en assurer, casse volontairement le code qu'il teste et vérifie qu'il rougit.
- **Teste aussi les cas d'erreur**, pas seulement le cas qui marche : donnée invalide, base absente, doublon.

## 6. La qualité du code

### 6.1 Trois notions à ne pas confondre

| Notion        | Question posée                                              | Outils                                        | Commande                             |
| ------------- | ----------------------------------------------------------- | --------------------------------------------- | ------------------------------------ |
| **Lint**      | Le code contient-il des erreurs ou de mauvaises pratiques ? | ESLint (back et web), `flutter analyze` (app) | `npm run lint` ; `flutter analyze`   |
| **Formatage** | La mise en page est-elle uniforme ?                         | Prettier (back et web), `dart format` (app)   | `npm run format` ; `dart format ...` |
| **Sécurité**  | Y a-t-il une faille connue ?                                | CodeQL                                        | automatique, dans la PR              |

Le lint ne vérifie **pas** la mise en page, et le formatage ne détecte **pas** les erreurs : il faut les deux.

### 6.2 Le formatage

Chacun a ses habitudes d'écriture. Sans règle commune, deux personnes qui modifient le même fichier produisent des diffs pleins de lignes changées sans rapport avec leur travail, et les relectures deviennent pénibles. Un formateur règle la question une fois pour toutes : il réécrit le fichier dans **un style unique**, sans discussion possible.

- **Back et web** : Prettier, avec lignes de 100 caractères et guillemets simples (fichier `.prettierrc`). Le fichier `.prettierignore` exclut ce qui est généré (`openapi.json`, `src/app/api/`) et les dossiers de résultats.
- **App** : `dart format`, sur les dossiers `lib`, `test`, `integration_test` et `tool`. Le code généré (`api_client/`) n'est pas concerné.

```powershell
# back et web (dans backend/ et frontend-web/)
npm run format          # réécrit les fichiers
npm run format:check    # vérifie sans rien modifier (c'est ce que fait la CI)

# app (dans frontend-app/)
dart format lib test integration_test tool
```

La CI utilise le mode « vérifier sans modifier » : si un fichier n'est pas formaté, elle échoue et t'indique lequel.

### 6.3 Le hook Git : le formatage automatique

Un **hook Git** est un petit script que Git lance seul à un moment précis. Ici, c'est `.githooks/pre-commit`, lancé quand tu fais `git commit`, **avant** que le commit soit créé : il formate les fichiers du commit et les remet dedans. Résultat : tu n'oublies plus de formater, et le check `Format` de la CI est rarement rouge.

Il s'active **une fois par clone** (c'est déjà dans la liste de la partie 2.2) :

```powershell
git config core.hooksPath .githooks
```

Son comportement :

- Il ne formate que les fichiers de ton commit.
- Si un fichier a **aussi** des modifications que tu n'as pas ajoutées au commit, il n'y touche pas et te prévient (sinon ces modifications partiraient dans le commit).
- Si `node_modules` est absent dans un dossier, ou si `dart` n'est pas dans le PATH, il prévient et ne formate pas.
- Si un fichier contient une erreur de syntaxe, le formateur échoue et **le commit est bloqué** : corrige, puis recommence.
- `git commit --no-verify` contourne le hook, à utiliser exceptionnellement.

Ce hook est un **confort**, pas une protection : il ne tourne que chez ceux qui l'ont activé. La vraie protection, c'est la CI.

Le fichier `.gitattributes` force les fins de ligne du hook en LF. Sans cela, Windows peut les transformer en CRLF et le script ne se lancerait plus.

### 6.4 CodeQL : l'analyse de sécurité

CodeQL est l'outil de GitHub qui lit le code à la recherche de failles connues (injection, absence de limite de requêtes, etc.). Il tourne sur chaque PR et **commente directement le code** quand il trouve quelque chose. On retrouve aussi toutes les alertes dans l'onglet **Security → Code scanning** du dépôt.

Une alerte comporte une gravité. Une règle du dépôt (« Require code scanning results ») bloque la fusion si une alerte atteint le seuil fixé, en général « High » et au-dessus.

Que faire face à une alerte :

1. Clique sur « Show more details » : le message explique le risque et montre le chemin du problème dans le code.
2. **Corrige le code.** Une alerte qui disparaît se ferme toute seule à la prochaine analyse.
3. Ne ferme l'alerte à la main (« Dismiss ») que si c'est vraiment un faux positif, et écris pourquoi.

Un exemple vécu : CodeQL a signalé que les routes de `/users` accédaient à la base sans limite de requêtes. Le correctif a été d'ajouter une limite par adresse IP (voir 3.2), pas de fermer l'alerte.

### 6.5 Dependabot : les mises à jour de dépendances

Les bibliothèques que l'on utilise sortent de nouvelles versions, parfois pour corriger des failles. **Dependabot** surveille chaque semaine le back, le web, l'app et les images Docker, et ouvre lui-même des PR de mise à jour (configuration dans `.github/dependabot.yml`).

- Les mises à jour mineures sont regroupées en une PR, pour ne pas en recevoir quarante.
- Les paquets Angular sont regroupés : ils doivent monter ensemble.
- TypeScript n'est volontairement pas mis à jour automatiquement : Angular impose sa propre plage de versions, qui change avec `ng update`.

Face à une PR de Dependabot :

- **Tous les checks sont verts** : relis ce qui change, puis fusionne.
- **Un check est rouge** : **ne fusionne pas**. Il signale une vraie incompatibilité. Lis l'erreur, ou ferme la PR si ce n'est pas le moment.

## 7. Git au quotidien

### 7.1 Les branches

On ne travaille jamais directement sur `main`. Pour chaque tâche, une branche :

```powershell
git switch main
git pull
git switch -c feature/SAE-42-pseudo-utilisateur
```

Convention proposée (à valider ensemble) : `feature/<ticket>-<description>` pour une fonctionnalité, `fix/<ticket>-<description>` pour une correction, `docs/` pour la documentation, `chore/` pour l'outillage. `<ticket>` est la clé du ticket Jira.

### 7.2 Les commits

- Un commit regroupe **un changement logique** : « Ajoute le champ pseudo au contrat », pas « divers ».
- Le message dit ce que fait le commit, en français, à l'impératif (convention proposée).
- Ne commite jamais `.env`, `node_modules`, ni de mot de passe. Le `.gitignore` en protège une partie, pas tout.
- Les fichiers générés se commitent **ensemble avec** la modification du contrat (voir 4.5).

### 7.3 Ouvrir une pull request

```powershell
git push -u origin feature/SAE-42-pseudo-utilisateur
```

GitHub propose alors un bouton pour ouvrir la PR. Le **modèle de PR** s'affiche, avec une liste à cocher :

- décris ce que change la PR et pourquoi ;
- mets la clé du ticket Jira dans le titre et dans le champ prévu ;
- coche seulement ce que tu as réellement fait ;
- ajoute une capture d'écran si l'interface change.

Si la PR n'est pas prête, ouvre-la en **brouillon (Draft)** : la CI tourne, mais personne n'est invité à relire. Garde les PR petites : une PR de quelques dizaines de lignes est relue en dix minutes, une PR de deux mille lignes ne l'est pas vraiment.

### 7.4 La relecture

La relecture est le moment où l'on regarde ce qu'une machine ne voit pas. **Quand tu relis :**

1. Regarde d'abord que la CI est verte : inutile de relire du code qui ne passe pas les tests.
2. Le code est-il lisible, et fait-il ce que la PR annonce ?
3. Les cas d'erreur sont-ils gérés et testés ?
4. Si le contrat change : les clients sont-ils régénérés, et le changement est-il cassant ?
5. Pas de secret, pas de fichier de débogage oublié.
6. Si l'interface change : y a-t-il son test d'accessibilité ?

Tu approuves quand tu serais prêt à ce que ce code soit à ton nom. Sinon, tu demandes des changements, **avec des remarques précises et courtoises**. On ne peut pas approuver sa propre PR.

### 7.5 Garder sa branche à jour

Pendant que tu travailles, d'autres PR sont fusionnées dans `main`. Pour récupérer leurs changements :

```powershell
git fetch origin
git merge origin/main
```

En cas de **conflit** :

- sur un fichier normal, ouvre-le, choisis le bon contenu, puis `git add` et `git commit` ;
- sur un **fichier généré** (`openapi.json`, `api/`, `api_client/`), ne résous rien à la main : prends n'importe quelle version, puis relance `npm run clients:generate`.

Relance les tests après la fusion : un conflit résolu sans erreur apparente peut quand même casser le code.

### 7.6 Les règles de protection de `main`

Ces règles sont une **configuration du dépôt sur GitHub** (Settings, puis Rules), pas du code. Elles imposent :

- de passer par une PR ;
- une approbation d'un coéquipier ;
- que les checks obligatoires soient verts ;
- pas de push forcé.

Les checks qui doivent être obligatoires sont : `Backend - test`, `Front web - test`, `E2E (mock)`, `E2E (real)`, `App - android build`, `App - android e2e`, `App - changes`, `Contract - check`, `Format - JS/TS` et `Format - Dart`. S'y ajoute la règle CodeQL (voir 6.4). **Si un workflow est ajouté ou renommé, cette liste doit être mise à jour dans les réglages**, sinon le check n'est plus attendu, ou la PR reste bloquée en attendant un check qui n'existe plus.

## 8. La CI en détail

### 8.1 Le vocabulaire de GitHub Actions

| Terme            | Sens                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------- |
| **Workflow**     | Un fichier YAML de `.github/workflows/` qui décrit des vérifications                          |
| **Événement**    | Ce qui déclenche un workflow : un `push`, une `pull_request`...                               |
| **Job**          | Un groupe d'étapes exécuté sur une machine neuve (le **runner**, par exemple `ubuntu-latest`) |
| **Étape (step)** | Une commande ou une action à l'intérieur d'un job                                             |
| **Artefact**     | Un fichier produit par un job et téléchargeable ensuite (un rapport, un APK)                  |
| **Secret**       | Une valeur confidentielle stockée dans les réglages du dépôt (par exemple un jeton)           |

Chaque job démarre sur une machine **vide** : il récupère le code, installe les dépendances, puis lance les commandes. C'est justement ce qui rend la CI fiable : si ça passe là, ça ne dépend pas de ta machine.

### 8.2 Quand ça se déclenche

- Sur un **push**, un workflow ne se lance que si des fichiers de son périmètre ont changé (par exemple `backend/**` pour le back). C'est un gain de temps.
- Sur une **pull request**, il se lance **toujours**. C'est nécessaire : un check obligatoire qui ne se lancerait pas laisserait la PR bloquée, en attente d'un résultat qui n'arrive jamais.

### 8.3 Les workflows du projet

| Workflow                      | Jobs                                                                                                                                | Ce qu'il vérifie ou fait                                                                                                      |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Backend CI**                | `Backend - test` ; `Backend - image`                                                                                                | Installe, lance le lint, puis les tests avec couverture. Sur `main` seulement : fabrique et publie l'image Docker du back     |
| **Frontend Web CI**           | `Front web - test` ; `Front web - image`                                                                                            | Lint, tests avec couverture, build. Sur `main` : publie l'image du web                                                        |
| **Frontend App CI (Flutter)** | `App - changes` ; `App - android build` ; `App - iOS build` ; `App - android e2e` ; puis `publish-packages` et `release` sur `main` | Analyse, tests et couverture, APK Android ; build iOS non signé ; tests d'intégration sur émulateur Android avec le vrai back |
| **E2E**                       | `E2E (mock)` ; `E2E (real)`                                                                                                         | Les tests Playwright du web, dans les deux modes                                                                              |
| **Contract**                  | `Contract - check`                                                                                                                  | Régénère le contrat et les clients et compare ; détecte les ruptures avec oasdiff                                             |
| **Format**                    | `Format - JS/TS` ; `Format - Dart`                                                                                                  | Vérifie le formatage sans rien modifier                                                                                       |
| **Main docker construct**     | un job                                                                                                                              | Sur `main`, publie la stack complète (compose) sur GHCR                                                                       |
| **Mirror to GRICAD**          | un job                                                                                                                              | À chaque push, copie la branche vers le dépôt GitLab de l'IUT                                                                 |

En plus, **CodeQL** (réglé dans les paramètres de sécurité du dépôt) et **Dependabot** (`.github/dependabot.yml`) tournent seuls.

Quelques points de fonctionnement :

- **`App - changes`** détermine si des fichiers de l'app ont changé. Les jobs lourds (build iOS sur macOS, émulateur Android) ne se lancent que si c'est le cas : inutile de payer dix minutes d'émulateur pour une PR qui ne touche que le back.
- **`E2E (real)`** et **`App - android e2e`** fabriquent le back **à partir du code de la PR**, pas à partir de l'image publiée. On teste donc ce qu'on est en train de fusionner.
- **`Contract - check`** n'a pas besoin de ton aide pour détecter l'oubli de `clients:generate` : il le refait et compare.
- Par défaut, chaque workflow n'a que le droit de **lire** le dépôt ; les jobs qui publient demandent explicitement les droits supplémentaires dont ils ont besoin.

### 8.4 Ce qui se passe sur une PR

```text
 push de la branche
        │
        ├──► Backend - test ─────────┐
        ├──► Front web - test ───────┤
        ├──► E2E (mock) / (real) ────┤
        ├──► App - android build ────┤   en parallèle
        ├──► App - android e2e ──────┤
        ├──► Contract - check ───────┤
        ├──► Format - JS/TS / Dart ──┤
        └──► CodeQL ─────────────────┘
                                      │
                      tout est vert ? ─┴─► + une approbation ─► fusion possible
```

Chaque nouveau push relance tout.

### 8.5 Lire un échec

1. Dans la PR, descends jusqu'à la zone **Checks** et repère la croix rouge.
2. Clique sur **Details** à côté du check : tu arrives sur le journal du job.
3. Ouvre l'étape en rouge. **L'erreur est presque toujours dans les dernières lignes.**
4. Reproduis chez toi avec la commande correspondante (tableau ci-dessous).
5. Corrige, commite, pousse : la CI se relance seule.

Le bouton **Re-run failed jobs** relance un job sans rien changer. À utiliser seulement si l'échec vient manifestement de GitHub (téléchargement impossible, machine indisponible). Si ça repasse « tout seul » alors qu'un test était en cause, c'est qu'un test est instable : à corriger, pas à ignorer.

| Check rouge                  | Reproduire chez soi                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| `Backend - test`             | `npm run lint` puis `npm run test:coverage` dans `backend/`                          |
| `Front web - test`           | `npm run lint`, `npm run test:coverage`, `npm run build` dans `frontend-web/`        |
| `E2E (mock)` ou `E2E (real)` | `npx playwright test` dans `frontend-web/` ; ajoute `--ui` pour suivre un test       |
| `App - android build`        | `flutter analyze`, `flutter test --coverage`, `dart run tool/check_coverage.dart 80` |
| `App - android e2e`          | `flutter test integration_test` sur un émulateur                                     |
| `Contract - check`           | `npm run clients:generate` dans `backend/`, puis commiter le résultat                |
| `Format - JS/TS`             | `npm run format` dans `backend/` et `frontend-web/`                                  |
| `Format - Dart`              | `dart format lib test integration_test tool` dans `frontend-app/`                    |
| Alerte CodeQL                | lire l'alerte dans la PR, corriger le code (voir 6.4)                                |

### 8.6 Les artefacts

Certains jobs gardent des fichiers utiles. Pour les récupérer : ouvre le workflow concerné, descends à la section **Artifacts**.

- `playwright-report-mock` et `playwright-report-real` : le rapport des tests Playwright (conservé 14 jours). Télécharge-le, décompresse-le et ouvre `index.html` : tu y vois chaque test, et les traces et captures de ceux qui ont échoué.
- L'**APK Android** produit par `App - android build`.

## 9. Après la fusion sur `main`

Quand une PR est fusionnée, plusieurs choses se font **sans rien faire** :

### 9.1 Les images Docker

Le back et le web sont fabriqués en images et publiés sur GitHub Container Registry, avec deux étiquettes : `latest`, et le numéro du commit (pour pouvoir retrouver une version précise).

- `ghcr.io/thegamerfarmer/rekor/backend`
- `ghcr.io/thegamerfarmer/rekor/frontend-web`

### 9.2 La stack complète

Le fichier `docker-compose.prod.yml` est publié lui aussi. N'importe qui peut lancer la version publiée, **sans avoir le code** :

```powershell
docker compose -f oci://ghcr.io/thegamerfarmer/rekor:latest up
```

Il faut seulement définir `DB_USER`, `DB_PASSWORD` et `DB_NAME` dans l'environnement. C'est pratique pour une démonstration sur une autre machine.

### 9.3 L'application mobile

L'APK Android et l'application iOS non signée (`Runner.app.zip`) sont publiés comme paquets (`frontend-app-android` et `frontend-app-ios`) et attachés à une **release GitHub**. Pour tester l'app sur un téléphone Android, télécharge l'APK de la dernière release.

### 9.4 Le miroir GRICAD

À chaque push, **sur toutes les branches**, le workflow `Mirror to GRICAD` copie le dépôt vers le GitLab de l'IUT. Il utilise un secret du dépôt, `GRICAD_TOKEN`. Si ce jeton expire, le miroir échoue : ça ne bloque pas les fusions, mais le dépôt de l'IUT n'est plus à jour.

## 10. Une journée type : ajouter un champ

On suit une tâche complète : ajouter un champ **facultatif** `pseudo` à un utilisateur. Elle touche tout ce que décrit ce guide, dans l'ordre où ça arrive.

**1. Créer la branche** (ticket `SAE-42`)

```powershell
git switch main
git pull
git switch -c feature/SAE-42-pseudo-utilisateur
```

**2. Modifier le contrat**, dans `backend/openapi.js`. On ajoute le champ aux deux schémas :

```js
const UserInput = z
  .object({
    email: z.email().openapi({ example: "ada@exemple.fr" }),
    name: z.string().min(1).openapi({ example: "Ada" }),
    pseudo: z.string().min(1).optional().openapi({ example: "ada42" }), // nouveau
  })
  .openapi("UserInput");

const User = z
  .object({
    id: UserId,
    email: z.email(),
    name: z.string(),
    pseudo: z.string().optional(), // nouveau
  })
  .openapi("User");
```

Le champ est `optional()` : les anciens clients, qui ne l'envoient pas, continuent de fonctionner. C'est un changement **non cassant** (voir 4.6).

**3. Adapter le back**, dans `backend/routes/users.js` : lire `pseudo` dans la requête, l'enregistrer, le renvoyer. Un piège à connaître : si le champ est absent de la requête, `pseudo` vaut `undefined`, et le pilote MongoDB l'enregistre alors avec la valeur **`null`**. À la lecture, `null` n'est pas une chaîne : le validateur de réponse refuserait la réponse (erreur 500). Il faut donc n'ajouter le champ que s'il existe :

```js
const { email, name, pseudo } = req.body;
const user = { email, name, ...(pseudo !== undefined && { pseudo }) };
const { insertedId } = await users().insertOne(user);
```

(C'est l'idée, à adapter au code réel.) Si le validateur MongoDB de `schema.js` liste les champs autorisés, ajoute-y `pseudo`.

**4. Écrire les tests du back**, dans `backend/test/users.test.js` :

```js
it("POST /users enregistre le pseudo", async () => {
  const res = await request(app)
    .post("/users")
    .send({ ...ada, pseudo: "ada42" });
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.pseudo, "ada42");
});

it("POST /users accepte une requête sans pseudo", async () => {
  const res = await request(app).post("/users").send(ada);
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.pseudo, undefined);
});

it("POST /users renvoie 400 si le pseudo est vide", async () => {
  const res = await request(app)
    .post("/users")
    .send({ ...ada, pseudo: "" });
  assert.strictEqual(res.status, 400);
});
```

**5. Régénérer le contrat et les clients**, dans `backend/` :

```powershell
npm run clients:generate
```

Vérifie avec `git status` : `openapi.json`, le client web et le client Dart ont changé.

**6. Utiliser le champ côté web et côté app.** Les clients générés connaissent maintenant `pseudo` : TypeScript et Dart te signalent les erreurs de type si tu l'utilises mal. Mets à jour ce qui affiche l'utilisateur, ses tests, et, si l'interface change, son test d'accessibilité.

**7. Tout vérifier en local**, avant de pousser :

```powershell
# backend/
npm run lint
npm run test:coverage

# frontend-web/
npm run lint
npm run test:coverage
npx playwright test

# frontend-app/
flutter analyze
flutter test --coverage
```

**8. Commiter.** Le hook formate tes fichiers au passage.

```powershell
git add -A
git commit -m "Ajoute le champ pseudo (facultatif) aux utilisateurs"
```

**9. Pousser et ouvrir la PR**, avec la clé du ticket dans le titre : `SAE-42 Ajoute le champ pseudo aux utilisateurs`. Remplis le modèle.

**10. Regarder la CI.** Trois cas fréquents :

- `Contract - check` rouge : tu as oublié l'étape 5, ou tu as modifié un fichier généré. Relance la génération, commite.
- `Format` rouge : le hook n'était pas actif. Lance les commandes de formatage, commite.
- Couverture sous le seuil : il manque des tests. Regarde le rapport pour voir quelles lignes.

**11. Relecture.** Un coéquipier lit, commente, approuve. Tu corriges ce qui est demandé et tu pousses : la CI se relance.

**12. Fusion.** Une fois tout vert et approuvé, tu fusionnes. Les images Docker sont reconstruites, la stack republiée et le miroir mis à jour, tout seul.

## 11. Dépannage

| Symptôme                                                   | Cause probable                                                                           | Solution                                                                                                     |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `failed to connect to the docker API`                      | Docker Desktop n'est pas lancé                                                           | Lance Docker Desktop, attends qu'il soit prêt, recommence                                                    |
| Le back est refusé par MongoDB (`Authentication failed`)   | La base a été créée avant le `.env`, ou le mot de passe a changé depuis                  | `docker compose down -v`, puis `docker compose up -d --build` (**efface les données de développement**)      |
| Un port est déjà utilisé (3000, 8080, 27017)               | Un ancien conteneur ou un autre programme l'occupe                                       | `docker ps` pour le trouver, `docker stop <nom>`                                                             |
| La page web affiche « Backend : indisponible »             | Le back est arrêté ou en erreur                                                          | `docker compose ps`, puis `docker compose logs backend`                                                      |
| `502 Bad Gateway` sur http://localhost:8080                | nginx n'arrive pas à joindre le back (pas encore démarré, ou planté)                     | `docker compose logs backend` ; attends que le back soit prêt                                                |
| `429` en testant l'API                                     | Plus de 100 requêtes en une minute depuis la même adresse                                | Attends une minute                                                                                           |
| `UnsupportedClassVersionError` pendant `clients:generate`  | Ta version de Java est trop ancienne (8)                                                 | Installe un JDK 17 ou plus, vérifie `java -version`                                                          |
| `clients:generate` échoue au premier lancement             | Le générateur se télécharge la première fois : problème de réseau                        | Vérifie ta connexion, relance                                                                                |
| `Contract - check` rouge : « pas à jour »                  | Les fichiers générés n'ont pas été régénérés ou commités                                 | `npm run clients:generate` dans `backend/`, commiter                                                         |
| `Contract - check` rouge : changement cassant              | Le contrat casse l'existant                                                              | Voir 4.6 : revenir en arrière, ou ajouter le label `breaking-change` si c'est voulu                          |
| `Format - JS/TS` rouge                                     | Des fichiers ne sont pas formatés                                                        | `npm run format` dans `backend/` et `frontend-web/`, commiter                                                |
| `Format - Dart` rouge alors que tu as formaté              | Ta version de Flutter n'est pas la 3.47.6                                                | Aligne ta version, relance `dart format`                                                                     |
| « Mock manquant » dans un test Playwright (501)            | Le test appelle une route non simulée en mode `mock`                                     | Ajoute la réponse simulée dans `arrange.mock`                                                                |
| Playwright : `Executable doesn't exist`                    | Le navigateur n'est pas installé                                                         | `npx playwright install chromium`                                                                            |
| Playwright en mode `real` ne démarre pas le back           | `backend/node_modules` est absent                                                        | `npm install` dans `backend/`                                                                                |
| Les tests du back échouent au tout premier lancement       | Le `mongod` temporaire n'est pas encore téléchargé, ou le démarrage à froid est lent     | Vérifie le réseau, relance une fois                                                                          |
| Couverture sous le seuil                                   | Du code n'est pas testé                                                                  | Ouvre le rapport, écris les tests manquants (on ne baisse pas le seuil)                                      |
| `flutter analyze` signale des problèmes dans `api_client/` | L'exclusion du code généré manque dans `analysis_options.yaml`                           | Ajoute `api_client/**` à la liste `exclude` de la section `analyzer`                                         |
| Le hook de formatage ne fait rien                          | Il n'est pas activé, ou le fichier n'est pas exécutable                                  | `git config core.hooksPath` doit afficher `.githooks` ; sur macOS et Linux : `chmod +x .githooks/pre-commit` |
| Une PR reste en « Waiting for status to be reported »      | Un check obligatoire n'existe plus ou ne s'est pas lancé (nom changé, workflow supprimé) | Compare la liste des checks obligatoires (réglages du dépôt) aux noms réels des jobs                         |
| Une alerte CodeQL bloque la PR                             | Une faille potentielle a été détectée                                                    | Voir 6.4 : lis l'alerte, corrige le code                                                                     |
| Une PR de Dependabot est rouge                             | Une mise à jour est incompatible                                                         | Voir 6.5 : ne pas fusionner                                                                                  |

Si rien de tout ça ne correspond : relis l'erreur en entier (pas seulement la première ligne), cherche le message exact, et **demande dans le canal de l'équipe en collant le message d'erreur complet**.

## 12. Ce qui reste à faire

Ce que le système met en place, c'est le **cadre** : pas encore le produit. Il reste :

**Le produit**

- Les vrais schémas de données : `User` avec `email` et `name` n'est qu'un exemple.
- L'authentification : aujourd'hui, les routes sont ouvertes à tous.
- Les écrans du web et de l'app qui appellent réellement `/users` (les clients sont générés, mais aucun écran ne les utilise encore).

**À décider ensemble**

- Les conventions de branches et de messages de commit (la partie 7 en propose).
- Qui relit quoi, et sous quel délai.
- La connexion à Jira : l'application « GitHub for Jira » doit être installée par un administrateur du Jira. En attendant, on met la clé du ticket dans le titre de la PR.

**À vérifier dans les réglages du dépôt**

- Les checks obligatoires listés en 7.6, **y compris** `Format - JS/TS`, `Format - Dart` et `Contract - check`.
- La règle « Require code scanning results » pour CodeQL.
- Le label `breaking-change` existe.

**Des améliorations possibles**

- Les en-têtes de sécurité HTTP (`helmet`) pour le back.
- Le port 3000 du back est ouvert directement sur la machine : en production, il ne devrait pas l'être, seul nginx devrait être joignable.
- Aucun déploiement sur un serveur : la CI publie des images, rien ne les lance en ligne.
- La fonction de démarrage du back (`start()` dans `index.js`) n'est pas couverte par les tests.
- L'accessibilité mesurée automatiquement ne remplace pas des essais au clavier et avec un lecteur d'écran.

> **Ce guide fait partie du projet.** Quand une commande, un outil ou un nom de check change, on met ce fichier à jour dans la même PR. Un guide faux est pire que pas de guide.

## Annexe A : aide-mémoire des commandes

**Backend** (dans `backend/`)

| Commande                                  | Rôle                                              |
| ----------------------------------------- | ------------------------------------------------- |
| `npm install`                             | installer les dépendances                         |
| `node index.js`                           | lancer le back                                    |
| `npm test`                                | lancer les tests                                  |
| `npm run test:coverage`                   | tests avec couverture et seuils                   |
| `npm run lint`                            | analyse ESLint                                    |
| `npm run verify`                          | analyse ESLint + test avec couverture et seuils   |
| `npm run format` / `npm run format:check` | formater / vérifier le formatage                  |
| `npm run clients`                         | régénérer le contrat et les clients (Java requis) |
| `npm run openapi:export`                  | régénérer seulement `openapi.json`                |

**Web** (dans `frontend-web/`)

| Commande                                      | Rôle                                                      |
| --------------------------------------------- | --------------------------------------------------------- |
| `npm install`                                 | installer les dépendances                                 |
| `npm start -- --proxy-config proxy.conf.json` | lancer le web avec le proxy vers le back                  |
| `npm test` / `npm run test:coverage`          | tests unitaires / avec couverture                         |
| `npm run lint`                                | analyse ESLint                                            |
| `npm run build`                               | compiler l'application                                    |
| `npm run format` / `npm run format:check`     | formater / vérifier le formatage                          |
| `npx playwright test`                         | tests fonctionnels (`--project=mock`, `--ui`, `--headed`) |
| `npx playwright show-report`                  | ouvrir le dernier rapport                                 |

**App** (dans `frontend-app/`)

| Commande                                     | Rôle                                                                                   |
| -------------------------------------------- | -------------------------------------------------------------------------------------- |
| `flutter pub get`                            | installer les dépendances                                                              |
| `flutter run`                                | lancer l'app (`--dart-define=API_URL=...` pour changer l'adresse du back)              |
| `flutter analyze`                            | analyse statique                                                                       |
| `flutter test` / `flutter test --coverage`   | tests / avec couverture                                                                |
| `dart run tool/check_coverage.dart 80`       | vérifier le seuil de couverture                                                        |
| `flutter test integration_test`              | tests d'intégration sur un appareil (`--dart-define=BACKEND=mock` pour le mode simulé) |
| `dart format lib test integration_test tool` | formater                                                                               |

**Docker** (à la racine)

| Commande                                                         | Rôle                            |
| ---------------------------------------------------------------- | ------------------------------- |
| `docker compose up -d --build`                                   | construire et lancer la stack   |
| `docker compose ps`                                              | voir l'état des conteneurs      |
| `docker compose logs backend`                                    | lire les journaux du back       |
| `docker compose down`                                            | arrêter, en gardant les données |
| `docker compose down -v`                                         | arrêter et supprimer la base    |
| `docker compose -f oci://ghcr.io/thegamerfarmer/rekor:latest up` | lancer la version publiée       |

**Git**

| Commande                                        | Rôle                                    |
| ----------------------------------------------- | --------------------------------------- |
| `git switch -c feature/<ticket>-<description>`  | créer une branche                       |
| `git push -u origin <branche>`                  | publier la branche                      |
| `git fetch origin` puis `git merge origin/main` | récupérer `main` dans sa branche        |
| `git config core.hooksPath .githooks`           | activer le hook de formatage            |
| `git commit --no-verify`                        | contourner le hook (exceptionnellement) |

## Annexe B : la carte des fichiers de configuration

| Fichier                                                 | Rôle                                                         |
| ------------------------------------------------------- | ------------------------------------------------------------ |
| `.github/workflows/*.yml`                               | les workflows de la CI                                       |
| `.github/dependabot.yml`                                | mises à jour de dépendances                                  |
| `.github/pull_request_template.md`                      | le modèle de PR                                              |
| `.githooks/pre-commit`                                  | le hook de formatage                                         |
| `.gitattributes`                                        | force les fins de ligne du hook en LF                        |
| `docker-compose.yml`                                    | la stack de développement (construit depuis le code)         |
| `docker-compose.prod.yml`                               | la stack publiée (télécharge les images GHCR)                |
| `.env.example`                                          | modèle du `.env` (les identifiants de la base)               |
| `backend/openapi.js`                                    | **le contrat d'API**                                         |
| `backend/openapitools.json`, `backend/generator-ignore` | réglages du générateur de clients                            |
| `backend/.c8rc.json`                                    | seuils de couverture du back                                 |
| `backend/.prettierrc`, `backend/.prettierignore`        | réglages du formatage du back                                |
| `backend/eslint.config.js`                              | règles de lint du back                                       |
| `backend/Dockerfile`                                    | fabrication de l'image du back                               |
| `frontend-web/angular.json`                             | configuration d'Angular, dont les seuils de couverture       |
| `frontend-web/playwright.config.ts`                     | les deux projets de test (mock et real)                      |
| `frontend-web/proxy.conf.json`                          | proxy `/api` en développement                                |
| `frontend-web/nginx.conf`                               | proxy `/api` dans Docker, et page d'accueil de l'application |
| `frontend-web/.prettierignore`                          | exclusions du formatage (code généré)                        |
| `frontend-app/pubspec.yaml`                             | dépendances de l'app, dont le client généré                  |
| `frontend-app/analysis_options.yaml`                    | règles d'analyse de l'app (exclut le code généré)            |
| `frontend-app/tool/check_coverage.dart`                 | vérifie le seuil de couverture de l'app                      |

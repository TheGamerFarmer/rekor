// @ts-check
const { z } = require('zod');
const {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} = require('@asteasolutions/zod-to-openapi');
const { version } = require('../package.json');

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

// ---------- Schémas ----------
const HealthResponse = z
  .object({
    status: z.string().openapi({ example: 'ok' }),
  })
  .openapi('HealthResponse');

const UserId = z
  .string()
  .regex(/^[0-9a-f]{24}$/)
  .openapi({ example: '6ac8c78e50318b28d457048f' });

const Role = z.enum(['Entraineur', 'Capitaine', 'Adhérent', 'Visiteur']);
const Pronoun = z.enum(['Il', 'Elle', 'Iel', 'Autre']);

const RegisterInput = z
  .object({
    name: z.string().min(1).openapi({ example: 'Lovelace' }),
    firstName: z.string().min(1).openapi({ example: 'Ada' }),
    email: z.email().openapi({ example: 'ada@exemple.fr' }),
    password: z.string().min(1).openapi({ example: 'motdepasse' }),
    pronoun: Pronoun.openapi({ example: 'Elle' }),
    phoneNumber: z.string().optional().openapi({ example: '0612345678' }),
    birthday: z.iso.date().optional().openapi({ example: '1815-12-10' }),
  })
  .openapi('RegisterInput');

const UpdateProfileInput = z
  .object({
    name: z.string().min(1).optional(),
    firstName: z.string().min(1).optional(),
    phoneNumber: z.string().optional(),
    birthday: z.iso.date().optional(),
    pronoun: Pronoun.optional(),
  })
  .openapi('UpdateProfileInput');

const LoginInput = z
  .object({
    email: z.email().openapi({ example: 'ada@exemple.fr' }),
    password: z.string().min(1).openapi({ example: 'motdepasse' }),
  })
  .openapi('LoginInput');

const ChangePasswordInput = z
  .object({
    old_password: z.string().min(1),
    new_password: z.string().min(1),
  })
  .openapi('ChangePasswordInput');

const UserListItem = z
  .object({
    id: UserId,
    name: z.string(),
    firstName: z.string().optional(),
    email: z.email(),
  })
  .openapi('UserListItem');

const UserDetails = UserListItem.extend({
  role: Role,
  pronoun: Pronoun,
  phoneNumber: z.string().optional(),
  birthday: z.iso.datetime().optional(),
}).openapi('UserDetails');

const LoginResponse = z
  .object({
    access_token: z.string(),
  })
  .openapi('LoginResponse');

registry.registerComponent('securitySchemes', 'BearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

const ErrorResponse = z.object({ message: z.string() }).openapi('ErrorResponse');

/** @param {import('zod').ZodType} schema */
const json = (schema) => ({ 'application/json': { schema } });
/** @param {string} description */
const failure = (description) => ({ description, content: json(ErrorResponse) });

// ---------- Routes ----------
registry.registerPath({
  method: 'get',
  path: '/',
  operationId: 'getHealth',
  tags: ['Health'],
  summary: 'Health check',
  responses: {
    200: {
      description: 'Le serveur répond',
      content: { 'application/json': { schema: HealthResponse } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/users',
  operationId: 'listUsers',
  tags: ['Users'],
  summary: 'Liste les utilisateurs',
  responses: {
    200: { description: 'Les utilisateurs', content: json(z.array(UserListItem)) },
    429: failure('Trop de requêtes'),
    503: failure('Base de données indisponible'),
    500: failure('Erreur interne du serveur'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/users/me',
  operationId: 'getMyProfile',
  tags: ['Users'],
  summary: 'Récupère le profil de l’utilisateur authentifié',
  security: [{ BearerAuth: [] }],
  responses: {
    200: { description: 'Le profil utilisateur', content: json(UserDetails) },
    401: failure('Authentification requise ou token invalide'),
    404: failure('Utilisateur introuvable'),
    429: failure('Trop de requêtes'),
    503: failure('Base de données indisponible'),
    500: failure('Erreur interne du serveur'),
  },
});

registry.registerPath({
  method: 'patch',
  path: '/users/me',
  operationId: 'updateMyProfile',
  tags: ['Users'],
  summary: 'Modifie les informations du profil authentifié',
  security: [{ BearerAuth: [] }],
  request: { body: { required: true, content: json(UpdateProfileInput) } },
  responses: {
    204: { description: 'Profil modifié, sans contenu de réponse' },
    400: failure('Requête invalide'),
    401: failure('Authentification requise ou token invalide'),
    404: failure('Utilisateur introuvable'),
    429: failure('Trop de requêtes'),
    503: failure('Base de données indisponible'),
    500: failure('Erreur interne du serveur'),
  },
});

registry.registerPath({
  method: 'delete',
  path: '/users/me',
  operationId: 'deleteMyProfile',
  tags: ['Users'],
  summary: 'Supprime le compte authentifié',
  security: [{ BearerAuth: [] }],
  responses: {
    204: { description: 'Compte supprimé, sans contenu de réponse' },
    401: failure('Authentification requise ou token invalide'),
    404: failure('Utilisateur introuvable'),
    429: failure('Trop de requêtes'),
    503: failure('Base de données indisponible'),
    500: failure('Erreur interne du serveur'),
  },
});

registry.registerPath({
  method: 'put',
  path: '/users/me/password',
  operationId: 'changeMyPassword',
  tags: ['Users'],
  summary: 'Modifie le mot de passe du compte authentifié',
  security: [{ BearerAuth: [] }],
  request: { body: { required: true, content: json(ChangePasswordInput) } },
  responses: {
    204: { description: 'Mot de passe modifié, sans contenu de réponse' },
    400: failure('Requête invalide'),
    401: failure('Authentification requise ou ancien mot de passe incorrect'),
    404: failure('Utilisateur introuvable'),
    409: failure('Le mot de passe a été modifié simultanément'),
    429: failure('Trop de requêtes'),
    503: failure('Base de données indisponible'),
    500: failure('Erreur interne du serveur'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/users/{id}',
  operationId: 'getUser',
  tags: ['Users'],
  summary: 'Récupère un utilisateur par son identifiant',
  request: { params: z.object({ id: UserId }) },
  responses: {
    200: { description: "L'utilisateur", content: json(UserDetails) },
    400: failure('Identifiant invalide'),
    404: failure('Utilisateur introuvable'),
    429: failure('Trop de requêtes'),
    503: failure('Base de données indisponible'),
    500: failure('Erreur interne du serveur'),
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/register',
  operationId: 'register',
  tags: ['Authentication'],
  summary: 'Crée un compte utilisateur (rôle Visiteur attribué par le serveur)',
  request: { body: { required: true, content: json(RegisterInput) } },
  responses: {
    201: { description: 'Compte créé, sans contenu de réponse' },
    400: failure('Requête invalide'),
    409: failure('Un utilisateur avec cet e-mail existe déjà'),
    429: failure('Trop de requêtes'),
    503: failure('Base de données indisponible'),
    500: failure('Erreur interne du serveur'),
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/login',
  operationId: 'login',
  tags: ['Authentication'],
  summary: 'Vérifie les identifiants et renvoie un token JWT',
  request: { body: { required: true, content: json(LoginInput) } },
  responses: {
    200: { description: 'Utilisateur authentifié', content: json(LoginResponse) },
    400: failure('Requête invalide'),
    401: failure('E-mail ou mot de passe incorrect'),
    429: failure('Trop de requêtes'),
    503: failure('Base de données indisponible'),
    500: failure('Erreur interne ou configuration d’authentification indisponible'),
  },
});

// ---------- Génération de la spec ----------
function buildSpec() {
  return new OpenApiGeneratorV3(registry.definitions).generateDocument({
    openapi: '3.0.3',
    info: { title: 'Rekor API', version },
    servers: [{ url: '/api', description: 'API via le reverse proxy' }],
  });
}

module.exports = { z, registry, buildSpec };

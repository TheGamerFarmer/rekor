// @ts-check
const { z } = require('zod');
const {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} = require('@asteasolutions/zod-to-openapi');
const { USER_ROLE, USER_PRONOUN, EVENT_TYPE } = require('../db/enums');
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

const Role = z.enum(Object.values(USER_ROLE));
const Pronoun = z.enum(Object.values(USER_PRONOUN));

const RegisterInput = z
  .object({
    name: z.string().min(1).openapi({ example: 'Lovelace' }),
    firstName: z.string().min(1).openapi({ example: 'Ada' }),
    email: z.email().openapi({ example: 'ada@exemple.fr' }),
    password: z.string().min(1).openapi({ example: 'motdepasse' }),
    associationName: z
      .string()
      .min(1)
      .openapi({ example: 'Gières Volley-Ball', description: 'Nom de l’association' }),
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
    associationName: z
      .string()
      .min(1)
      .openapi({ example: 'Gières Volley-Ball', description: 'Nom de l’association' }),
  })
  .openapi('LoginInput');

const RefreshTokenInput = z
  .object({
    refresh_token: z.string().min(1),
  })
  .openapi('RefreshTokenInput');

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

const Association = z
  .object({
    _id: UserId,
    name: z.string(),
    address: z.string(),
  })
  .openapi('Association');

const LoginResponse = z
  .object({
    access_token: z.string(),
    refresh_token: z.string(),
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

const EventId = z
  .string()
  .regex(/^[0-9a-f]{24}$/)
  .openapi({ example: '6ac8c78e50318b28d457048f' });

const EventType = z.enum(Object.values(EVENT_TYPE)).openapi({ example: 'Entrainement' });

const EventListItem = z
  .object({
    id: EventId,
    name: z.string().openapi({ example: 'Entraînement du lundi' }),
    date: z.iso.datetime().openapi({ example: '2025-03-15T00:00:00.000Z' }),
    place: z.string().openapi({ example: 'Gymnase municipal' }),
    type: EventType,
    description: z.string().openapi({ example: 'Entraînement hebdomadaire' }),
    group: EventId,
  })
  .openapi('EventListItem');

const EventDetails = EventListItem.openapi('EventDetails');

const GroupId = z
  .string()
  .regex(/^[0-9a-f]{24}$/)
  .openapi({ example: '6ac8c78e50318b28d457048f' });

const GroupDetails = z
  .object({
    id: GroupId,
    name: z.string().openapi({ example: 'Équipe A' }),
    owner: UserId,
  })
  .openapi('GroupDetails');

const GroupInput = z
  .object({
    name: z.string().min(1).openapi({ example: 'Équipe A' }),
    owner: UserId,
  })
  .openapi('GroupInput');

const GroupPatchInput = z
  .object({
    name: z.string().min(1).optional().openapi({ example: 'Équipe B' }),
    owner: UserId.optional(),
  })
  .openapi('GroupPatchInput');

const EventInput = z
  .object({
    date: z.iso.date().openapi({ example: '2025-03-15' }),
    place: z.string().min(1).openapi({ example: 'Gymnase municipal' }),
    type: EventType,
    name: z.string().min(1).openapi({ example: 'Entraînement du lundi' }),
    description: z.string().min(1).openapi({ example: 'Entraînement hebdomadaire' }),
    group: EventId,
  })
  .openapi('EventInput');

const EventPatchInput = z
  .object({
    date: z.iso.date().optional().openapi({ example: '2025-03-15' }),
    place: z.string().min(1).optional().openapi({ example: 'Gymnase municipal' }),
    type: EventType.optional(),
    name: z.string().min(1).optional().openapi({ example: 'Entraînement du lundi' }),
    description: z.string().min(1).optional().openapi({ example: 'Entraînement hebdomadaire' }),
    group: EventId.optional(),
  })
  .openapi('EventPatchInput');

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
  path: '/association',
  operationId: 'listAssociations',
  tags: ['Associations'],
  summary: 'Liste les associations',
  responses: {
    200: { description: 'Les associations', content: json(z.array(Association)) },
    429: failure('Trop de requêtes'),
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
  summary: 'Crée un compte Visiteur et l’inscrit dans l’association indiquée',
  request: { body: { required: true, content: json(RegisterInput) } },
  responses: {
    201: { description: 'Compte créé, sans contenu de réponse' },
    400: failure('Requête invalide'),
    409: failure('E-mail déjà utilisé ou utilisateur déjà inscrit à cette association'),
    404: failure('Association introuvable'),
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
  summary: 'Authentifie l’utilisateur dans l’association indiquée et renvoie les tokens',
  request: { body: { required: true, content: json(LoginInput) } },
  responses: {
    200: { description: 'Utilisateur authentifié', content: json(LoginResponse) },
    400: failure('Requête invalide'),
    401: failure('E-mail ou mot de passe incorrect'),
    404: failure('Association introuvable'),
    429: failure('Trop de requêtes'),
    503: failure('Base de données indisponible'),
    500: failure('Erreur interne ou configuration d’authentification indisponible'),
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/refresh',
  operationId: 'refreshTokens',
  tags: ['Authentication'],
  summary: 'Renouvelle les tokens à partir d’un refresh token valide',
  request: { body: { required: true, content: json(RefreshTokenInput) } },
  responses: {
    200: { description: 'Nouvelle paire de tokens', content: json(LoginResponse) },
    400: failure('Requête invalide'),
    401: failure('Refresh token invalide ou expiré'),
    429: failure('Trop de requêtes'),
    503: failure('Base de données indisponible'),
    500: failure('Erreur interne ou configuration d’authentification indisponible'),
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/logout',
  operationId: 'logout',
  tags: ['Authentication'],
  summary: 'Révoque la session liée au refresh token',
  request: { body: { required: true, content: json(RefreshTokenInput) } },
  responses: {
    204: { description: 'Session révoquée, sans contenu de réponse' },
    400: failure('Requête invalide'),
    401: failure('Refresh token invalide ou expiré'),
    429: failure('Trop de requêtes'),
    503: failure('Base de données indisponible'),
    500: failure('Erreur interne ou configuration d’authentification indisponible'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/event',
  operationId: 'listEvents',
  tags: ['Events'],
  summary: 'Lists events belonging to groups the authenticated user is a member of',
  security: [{ BearerAuth: [] }],
  responses: {
    200: { description: 'The events', content: json(z.array(EventListItem)) },
    401: failure('Authentication required or invalid token'),
    403: failure('Insufficient permissions'),
    429: failure('Too many requests'),
    500: failure('Internal server error'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/event/{id}',
  operationId: 'getEvent',
  tags: ['Events'],
  summary: 'Retrieves an event by its identifier (user must be a member of the event group)',
  security: [{ BearerAuth: [] }],
  request: { params: z.object({ id: EventId }) },
  responses: {
    200: { description: 'The event', content: json(EventDetails) },
    400: failure('Invalid identifier'),
    401: failure('Authentication required, invalid token, or user not a member of the event group'),
    403: failure('Insufficient permissions'),
    404: failure('Event not found'),
    429: failure('Too many requests'),
    500: failure('Internal server error'),
  },
});

registry.registerPath({
  method: 'put',
  path: '/event/{id}',
  operationId: 'createEvent',
  tags: ['Events'],
  summary: 'Creates a new event (requires Entraineur role or above)',
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ id: EventId }),
    body: { required: true, content: json(EventInput) },
  },
  responses: {
    201: { description: 'Event created, no response content' },
    400: failure('Invalid request body'),
    401: failure('Authentication required or invalid token'),
    403: failure('Insufficient permissions'),
    404: failure('Group not found'),
    409: failure('Event already exists'),
    429: failure('Too many requests'),
    500: failure('Internal server error'),
  },
});

registry.registerPath({
  method: 'patch',
  path: '/event/{id}',
  operationId: 'updateEvent',
  tags: ['Events'],
  summary: 'Partially updates an event (requires Entraineur role or above)',
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ id: EventId }),
    body: { required: true, content: json(EventPatchInput) },
  },
  responses: {
    204: { description: 'Event updated, no response content' },
    400: failure('Invalid identifier'),
    401: failure('Authentication required or invalid token'),
    403: failure('Insufficient permissions'),
    404: failure('Event or group not found'),
    429: failure('Too many requests'),
    500: failure('Internal server error'),
  },
});

registry.registerPath({
  method: 'delete',
  path: '/event/{id}',
  operationId: 'deleteEvent',
  tags: ['Events'],
  summary: 'Deletes an event (requires Entraineur role or above)',
  security: [{ BearerAuth: [] }],
  request: { params: z.object({ id: EventId }) },
  responses: {
    204: { description: 'Event deleted, no response content' },
    400: failure('Invalid identifier'),
    401: failure('Authentication required or invalid token'),
    403: failure('Insufficient permissions'),
    404: failure('Event not found'),
    429: failure('Too many requests'),
    500: failure('Internal server error'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/group/{id}',
  operationId: 'getGroup',
  tags: ['Groups'],
  summary: 'Retrieves a group by its identifier (requires Adhérent role or above)',
  security: [{ BearerAuth: [] }],
  request: { params: z.object({ id: GroupId }) },
  responses: {
    200: { description: 'The group', content: json(GroupDetails) },
    400: failure('Invalid identifier'),
    401: failure('Authentication required or invalid token'),
    403: failure('Insufficient permissions'),
    404: failure('Group not found'),
    429: failure('Too many requests'),
    500: failure('Internal server error'),
  },
});

registry.registerPath({
  method: 'put',
  path: '/group/{id}',
  operationId: 'createGroup',
  tags: ['Groups'],
  summary: 'Creates a new group (requires Entraineur role or above)',
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ id: GroupId }),
    body: { required: true, content: json(GroupInput) },
  },
  responses: {
    201: { description: 'Group created, no response content' },
    400: failure('Invalid request body'),
    401: failure('Authentication required or invalid token'),
    403: failure('Insufficient permissions'),
    404: failure('Owner user not found'),
    409: failure('Group already exists'),
    429: failure('Too many requests'),
    500: failure('Internal server error'),
  },
});

registry.registerPath({
  method: 'patch',
  path: '/group/{id}',
  operationId: 'updateGroup',
  tags: ['Groups'],
  summary: 'Partially updates a group (requires Entraineur role or above)',
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ id: GroupId }),
    body: { required: true, content: json(GroupPatchInput) },
  },
  responses: {
    204: { description: 'Group updated, no response content' },
    400: failure('Invalid identifier'),
    401: failure('Authentication required or invalid token'),
    403: failure('Insufficient permissions'),
    404: failure('Group or owner user not found'),
    429: failure('Too many requests'),
    500: failure('Internal server error'),
  },
});

registry.registerPath({
  method: 'delete',
  path: '/group/{id}',
  operationId: 'deleteGroup',
  tags: ['Groups'],
  summary: 'Deletes a group (requires Entraineur role or above)',
  security: [{ BearerAuth: [] }],
  request: { params: z.object({ id: GroupId }) },
  responses: {
    204: { description: 'Group deleted, no response content' },
    400: failure('Invalid identifier'),
    401: failure('Authentication required or invalid token'),
    403: failure('Insufficient permissions'),
    404: failure('Group not found'),
    429: failure('Too many requests'),
    500: failure('Internal server error'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/group/{id}/members',
  operationId: 'listGroupMembers',
  tags: ['Groups'],
  summary: 'Lists the members of a group (requires Adhérent role or above)',
  security: [{ BearerAuth: [] }],
  request: { params: z.object({ id: GroupId }) },
  responses: {
    200: { description: 'The group members', content: json(z.array(UserDetails)) },
    400: failure('Invalid identifier'),
    401: failure('Authentication required or invalid token'),
    403: failure('Insufficient permissions'),
    404: failure('Group not found'),
    429: failure('Too many requests'),
    500: failure('Internal server error'),
  },
});

registry.registerPath({
  method: 'put',
  path: '/group/{id}/members/{userId}',
  operationId: 'addGroupMember',
  tags: ['Groups'],
  summary: 'Adds a user to a group (requires Entraineur role or above)',
  security: [{ BearerAuth: [] }],
  request: { params: z.object({ id: GroupId, userId: UserId }) },
  responses: {
    201: { description: 'User added, no response content' },
    400: failure('Invalid identifier'),
    401: failure('Authentication required or invalid token'),
    403: failure('Insufficient permissions'),
    404: failure('Group or user not found'),
    409: failure('User is already a member of the group'),
    429: failure('Too many requests'),
    500: failure('Internal server error'),
  },
});

registry.registerPath({
  method: 'delete',
  path: '/group/{id}/members/{userId}',
  operationId: 'removeGroupMember',
  tags: ['Groups'],
  summary: 'Removes a user from a group (requires Entraineur role or above)',
  security: [{ BearerAuth: [] }],
  request: { params: z.object({ id: GroupId, userId: UserId }) },
  responses: {
    204: { description: 'User removed, no response content' },
    400: failure('Invalid identifier'),
    401: failure('Authentication required or invalid token'),
    403: failure('Insufficient permissions'),
    404: failure('Group, user, or membership not found'),
    429: failure('Too many requests'),
    500: failure('Internal server error'),
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

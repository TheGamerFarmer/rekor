// @ts-check
const { z } = require('zod');
const {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} = require('@asteasolutions/zod-to-openapi');
const { version } = require('./package.json');

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

const UserInput = z
  .object({
    email: z.email().openapi({ example: 'ada@exemple.fr' }),
    name: z.string().min(1).openapi({ example: 'Ada' }),
  })
  .openapi('UserInput');

const User = z
  .object({
    id: UserId,
    email: z.email(),
    name: z.string(),
  })
  .openapi('User');

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
  method: 'post',
  path: '/users',
  operationId: 'createUser',
  tags: ['Users'],
  summary: 'Crée un utilisateur',
  request: { body: { required: true, content: json(UserInput) } },
  responses: {
    201: { description: 'Utilisateur créé', content: json(User) },
    400: failure('Requête invalide'),
    409: failure('Un utilisateur avec cet e-mail existe déjà'),
    429: failure('Trop de requêtes'),
    503: failure('Base de données indisponible'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/users',
  operationId: 'listUsers',
  tags: ['Users'],
  summary: 'Liste les utilisateurs (100 au maximum)',
  responses: {
    200: { description: 'Les utilisateurs', content: json(z.array(User)) },
    429: failure('Trop de requêtes'),
    503: failure('Base de données indisponible'),
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
    200: { description: "L'utilisateur", content: json(User) },
    400: failure('Identifiant invalide'),
    404: failure('Utilisateur introuvable'),
    429: failure('Trop de requêtes'),
    503: failure('Base de données indisponible'),
  },
});

// ---------- Génération de la spec ----------
function buildSpec() {
  return new OpenApiGeneratorV3(registry.definitions).generateDocument({
    openapi: '3.0.3',
    info: { title: 'Rekor API', version },
  });
}

module.exports = { z, registry, buildSpec };

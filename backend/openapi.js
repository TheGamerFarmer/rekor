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

// ---------- Routes ----------
registry.registerPath({
  method: 'get',
  path: '/',
  summary: 'Health check',
  responses: {
    200: {
      description: 'Le serveur répond',
      content: { 'application/json': { schema: HealthResponse } },
    },
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

const createUsersRouter = require('./users');
const createAuthRouter = require('./auth');
const createAssociationRouter = require('./association');
const createEventsRouter = require('./event');
const createGroupsRouter = require('./group');
const swaggerUi = require('swagger-ui-express');
const { buildSpec } = require('../swagger/openapi');

function registerSwagger(app) {
  const spec = buildSpec();

  // Documentation (montée avant le validateur pour ne pas être filtrée par lui)
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
  app.get('/api-docs.json', (req, res) => {
    res.json(spec);
  });
}

function registerRoutes(app) {
  app.get('/', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/auth', createAuthRouter());
  app.use('/users', createUsersRouter());
  app.use('/association', createAssociationRouter());
  app.use('/event', createEventsRouter());
  app.use('/group', createGroupsRouter());
}

module.exports = { registerSwagger, registerRoutes };

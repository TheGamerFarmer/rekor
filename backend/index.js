const express = require('express');
const OpenApiValidator = require('express-openapi-validator');
const { buildSpec } = require('./swagger/openapi');
const db = require('./db/db');
const { ensureSchema } = require('./db/schema');
const { registerRoutes, registerSwagger } = require('./controllers/routes');
const { userContext } = require('./db/plugins/audit');
const helmet = require('helmet');

const app = express();

// Behind a reverse proxy (e.g. nginx in Docker), the client IP arrives in X-Forwarded-For.
// TRUST_PROXY=1 lets express-rate-limit count each client individually rather than the proxy.
if (process.env.TRUST_PROXY) {
  app.set('trust proxy', Number(process.env.TRUST_PROXY));
}
const port = process.env.PORT || 3000;
const spec = buildSpec();

app.use(helmet());
app.use(express.json());

registerSwagger(app);

// Every request and response is validated against the spec built from openapi.js.
app.use(
  OpenApiValidator.middleware({
    apiSpec: spec,
    validateRequests: true,
    validateResponses: true,
  }),
);

app.use((req, res, next) => userContext.run({}, next));

registerRoutes(app);

// Error handler for validator errors (400/404/500) and controller errors (503).
// Express requires exactly 4 parameters to recognise an error handler — `next` must stay.
// eslint-disable-next-line no-unused-vars
function handleError(err, req, res, next) {
  if (res.headersSent) return;

  const status = err.status || 500;

  if (!err.status) console.error(err);

  res.status(status).json({
    message: err.message,
    errors: err.errors,
  });
}
app.use(handleError);

async function start() {
  if (process.env.MONGODB_URI) {
    await db.connect();
    await ensureSchema();
    console.log('Connecté à MongoDB');
  }

  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  // `docker stop` sends SIGTERM — close the HTTP server then the DB connection cleanly.
  const shutdown = () => {
    server.close(async () => {
      await db.close();
      process.exit(0);
    });
    server.closeIdleConnections();
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

// Covered by test/index-startup.test.js (subprocess — not visible to in-process c8).
/* c8 ignore next 6 */
if (require.main === module) {
  start().catch((error) => {
    console.error('Démarrage impossible :', error.message);
    process.exit(1);
  });
}

module.exports = app;
module.exports.start = start;
module.exports.handleError = handleError;

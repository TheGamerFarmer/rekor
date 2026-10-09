const express = require('express');
const swaggerUi = require('swagger-ui-express');
const OpenApiValidator = require('express-openapi-validator');
const { buildSpec } = require('./openapi');
const db = require('./db');
const { ensureSchema } = require('./schema');
const usersRouter = require('./routes/users');

const app = express();
const port = process.env.PORT || 3000;
const spec = buildSpec();

app.use(express.json());

// Documentation (montée avant le validateur pour ne pas être filtrée par lui)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
app.get('/api-docs.json', (req, res) => {
  res.json(spec);
});

// Toute requête/réponse est vérifiée contre la spec générée depuis openapi.js
app.use(
  OpenApiValidator.middleware({
    apiSpec: spec,
    validateRequests: true,
    validateResponses: true,
  }),
);

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/users', usersRouter);

// Erreurs du validateur (400 requête invalide, 404 route non documentée, 500 réponse non conforme)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res) => {
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

async function start() {
  // Sans MONGODB_URI, le back démarre sans base (utile en local et avec un faux back)
  if (process.env.MONGODB_URI) {
    await db.connect();
    await ensureSchema(db.getDb());
    console.log('Connecté à MongoDB');
  }

  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  // `docker stop` envoie SIGTERM : on ferme proprement le serveur puis la connexion à la base
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

if (require.main === module) {
  start().catch((error) => {
    console.error('Démarrage impossible :', error.message);
    process.exit(1);
  });
}

module.exports = app;

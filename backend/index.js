const express = require('express');
const swaggerUi = require('swagger-ui-express');
const OpenApiValidator = require('express-openapi-validator');
const { buildSpec } = require('./openapi');

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

// Erreurs du validateur (400 requête invalide, 404 route non documentée, 500 réponse non conforme)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res) => {
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app;
const path = require('node:path');
const swaggerJsdoc = require('swagger-jsdoc');
const { version } = require('./package.json');

module.exports = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Rekor API',
      version,
    },
  },
  apis: [path.join(__dirname, 'index.js')],
});

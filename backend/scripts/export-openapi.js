// Écrit le contrat de l'API (généré depuis openapi.js) dans openapi.json.
const fs = require('node:fs');
const path = require('node:path');
const { buildSpec } = require('../openapi');

const target = path.join(__dirname, '..', 'openapi.json');
fs.writeFileSync(target, JSON.stringify(buildSpec(), null, 2) + '\n');
console.log(`Contrat écrit dans ${path.relative(process.cwd(), target)}`);
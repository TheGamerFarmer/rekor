// Régénère openapi.json, puis les clients Angular et Dart à partir de lui.
// Nécessite Java (le générateur OpenAPI est un programme Java).
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const outputs = ['../frontend-web/src/app/api', '../frontend-app/api_client'].map((p) =>
  path.resolve(root, p),
);
const ignore = fs.readFileSync(path.join(root, 'generator-ignore'), 'utf8');

execSync('node scripts/export-openapi.js', { cwd: root, stdio: 'inherit' });

// On repart de zéro : un fichier devenu inutile doit disparaître du client.
// Le fichier d'exclusions doit être dans le dossier de sortie pour être pris en compte.
for (const dir of outputs) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, '.openapi-generator-ignore'), ignore);
}

execSync('npx openapi-generator-cli generate', { cwd: root, stdio: 'inherit' });

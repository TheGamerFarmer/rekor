const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { buildSpec } = require('../openapi');

test('openapi.json correspond à openapi.js', () => {
  const committed = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'openapi.json'), 'utf8'));
  const current = JSON.parse(JSON.stringify(buildSpec()));
  assert.deepStrictEqual(
    committed,
    current,
    'openapi.js a changé : lance `npm run clients:generate`',
  );
});

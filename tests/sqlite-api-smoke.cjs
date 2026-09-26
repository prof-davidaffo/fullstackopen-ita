// Runs the actual Part 3 lesson snippets against Express and an in-memory DB.
// No student-project dependencies are installed by this check.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const express = require('express');
const { DatabaseSync } = require('node:sqlite');
const text = fs.readFileSync(
  path.join(__dirname, '../src/content/sqlite/it/part3c.md'),
  'utf8'
);
const blocks = [...text.matchAll(/^```js\n([\s\S]*?)^```/gm)].map((m) => m[1]);
const load = (code, dependencies) => {
  const module = { exports: {} };
  new Function('require', 'module', code)(
    (name) => dependencies[name] || require(name),
    module
  );
  return module.exports;
};
const db = new DatabaseSync(':memory:');
db.exec(
  blocks
    .find((s) => s.includes('new DatabaseSync'))
    .match(/db.exec\(`([\s\S]*?)`\)/)[1]
);
const model = load(
  blocks.find((s) => s.includes('const toNote')),
  { '../db': db }
);
const router = load(
  blocks.find((s) => s.includes("require('express').Router")),
  { '../models/note': model }
);
const app = load(
  blocks.find((s) => s.includes('const app = express()')),
  { express, './controllers/notes': router }
);

(async () => {
  const server = await new Promise((resolve, reject) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
    instance.on('error', reject);
  });
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    const call = (url, method = 'GET', body) =>
      fetch(base + url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
    assert.deepEqual(await (await call('/api/notes')).json(), []);
    assert.equal(
      (await call('/api/notes', 'POST', { content: 'x' })).status,
      400
    );
    const created = await call('/api/notes', 'POST', {
      content: 'HTTP smoke test',
      important: true,
    });
    assert.equal(created.status, 201);
    const note = await created.json();
    assert.equal(typeof note.id, 'string');
    assert.equal(note.important, true);
    const updated = await call(`/api/notes/${note.id}`, 'PUT', {
      content: 'Updated over HTTP',
      important: false,
    });
    assert.equal((await updated.json()).important, false);
    assert.equal((await call(`/api/notes/${note.id}`, 'DELETE')).status, 204);
    assert.equal((await call(`/api/notes/${note.id}`)).status, 404);
    assert.equal((await call('/api/testing/reset', 'POST')).status, 404);
    console.log(
      'HTTP smoke passed: JSON, validation, create/read/update/delete, reset not exposed.'
    );
  } finally {
    await new Promise((resolve) => server.close(resolve));
    db.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

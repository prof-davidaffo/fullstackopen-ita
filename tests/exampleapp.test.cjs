const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const read = (file) =>
  fs.readFileSync(path.join(__dirname, '../static/exampleapp', file), 'utf8');

async function check(prefix) {
  const base = `https://example.test${prefix}/exampleapp/`;
  for (const [file, expectedScripts] of [
    ['index.html', []],
    ['notes/index.html', ['../main.js']],
    ['spa/index.html', ['../spa.js']],
  ]) {
    const html = read(file);
    assert.deepEqual(
      [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]),
      expectedScripts
    );
    const init = html.match(/<script>([\s\S]*?)<\/script>/)[1];
    for (const controlled of [false, true]) {
      let registrations = 0;
      let reloads = 0;
      const serviceWorker = {
        controller: controlled
          ? { scriptURL: base + 'service-worker.js' }
          : null,
        ready: Promise.resolve(),
        register: async (url, options) => {
          registrations++;
          assert.equal(url, `${prefix}/exampleapp/service-worker.js`);
          assert.equal(options.scope, `${prefix}/exampleapp/`);
          serviceWorker.controller = { scriptURL: base + 'service-worker.js' };
        },
      };
      const window = {
        location: {
          href: base + file,
          pathname: new URL(base + file).pathname,
          reload: () => reloads++,
        },
      };
      vm.runInNewContext(init, { window, navigator: { serviceWorker }, URL });
      await window.exampleAppReady;
      assert.equal(registrations, controlled ? 0 : 1);
      assert.equal(reloads, 0);
    }
  }

  const handlers = {};
  const stored = new Map();
  const context = {
    self: {
      registration: { scope: base },
      addEventListener: (name, handler) => {
        handlers[name] = handler;
      },
    },
    caches: {
      open: async () => ({
        match: async (request) => stored.get(request.url)?.clone(),
        put: async (request, response) =>
          stored.set(request.url, response.clone()),
      }),
    },
    URL,
    Request,
    Response,
    fetch: async () => {
      throw new Error('Unexpected network request');
    },
  };
  vm.runInNewContext(read('service-worker.js'), context);
  const call = (route, options) => {
    let response;
    handlers.fetch({
      request: new Request(base + route, options),
      respondWith: (value) => {
        response = value;
      },
    });
    return response;
  };
  const front = await (await call('')).text();
  assert.doesNotMatch(front, /<script/);
  assert.match(front, /number of notes created 3/);
  const formResponse = await call('new_note', {
    method: 'POST',
    body: new URLSearchParams({ note: 'Traditional note' }),
  });
  assert.equal(formResponse.status, 302);
  assert.equal(formResponse.headers.get('location'), base + 'notes/');
  const spaResponse = await call('new_note_spa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: 'SPA note' }),
  });
  assert.equal(spaResponse.status, 201);
  const notes = await (await call('data.json')).json();
  assert.equal(notes.length, 5);
  assert.equal(notes[3].content, 'Traditional note');
  assert.equal(notes[4].content, 'SPA note');
  assert.match(await (await call('')).text(), /number of notes created 5/);
}

(async () => {
  await check('');
  await check('/fullstackopen-ita');
  console.log('Example app requests, initialization and note creation: OK');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

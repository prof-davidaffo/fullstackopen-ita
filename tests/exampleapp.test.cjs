const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const prepareExampleApp = require('../src/utils/prepareExampleApp');

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
    assert.doesNotMatch(html, /<script>/);
  }

  // Both lesson scripts work without any hosting-specific globals.
  for (const file of ['main.js', 'spa.js']) {
    const requests = [];
    const window = { location: new URL(base + 'notes/') };
    function XMLHttpRequest() {
      this.open = (method, url) => requests.push([method, url]);
      this.send = () => {};
    }
    vm.runInNewContext(read(file), {
      window,
      XMLHttpRequest,
      document: { getElementById: () => ({}) },
    });
    assert.equal(requests.length, 0);
    window.onload();
    assert.deepEqual(requests, [['GET', `${prefix}/exampleapp/data.json`]]);
  }

  // The handbook waits for worker activation before navigating to an example.
  for (const installed of [false, true]) {
    let registrations = 0;
    let onClick;
    let onStateChange;
    let destination;
    const worker = {
      state: installed ? 'activated' : 'installing',
      addEventListener: (_, listener) => {
        onStateChange = listener;
      },
      removeEventListener: () => {},
    };
    const serviceWorker = {
      register: async (url, options) => {
        registrations++;
        assert.equal(url, `${prefix}/exampleapp/service-worker.js`);
        assert.equal(options.scope, `${prefix}/exampleapp/`);
        return installed ? { active: worker } : { installing: worker };
      },
      get ready() {
        throw new Error('Handbook is outside worker scope');
      },
    };
    const browser = {
      location: {
        href: `https://example.test${prefix}/it/part0`,
        origin: 'https://example.test',
        assign: (url) => {
          destination = url;
        },
      },
      console,
    };
    const document = {
      addEventListener: (name, listener) => {
        assert.equal(name, 'click');
        onClick = listener;
      },
    };
    const ready = prepareExampleApp(
      browser,
      { serviceWorker },
      document,
      `${prefix}/exampleapp/`
    );
    let prevented = false;
    const link = { href: base + 'notes/', hasAttribute: () => false };
    const event = {
      button: 0,
      target: { closest: () => link },
      preventDefault: () => {
        prevented = true;
      },
    };
    onClick({ ...event, ctrlKey: true });
    assert.equal(prevented, false);
    onClick(event);
    assert.equal(prevented, true);
    assert.equal(destination, undefined);
    await Promise.resolve();
    if (!installed) {
      assert.equal(destination, undefined);
      worker.state = 'activated';
      onStateChange();
    }
    assert.equal(await ready, true);
    assert.equal(registrations, 1);
    assert.equal(destination, base + 'notes/');
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

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { DatabaseSync } = require('node:sqlite');
const {
  coursePath,
  getCourseNavigation,
  getCourseTitle,
} = require('../src/courseTracks');
const hooks = require('../gatsby-node');

const root = path.resolve(__dirname, '..');
const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
const nodes = walk(path.join(root, 'src/content'))
  .filter((file) => file.endsWith('.md'))
  .map((file) => {
    const raw = fs.readFileSync(file, 'utf8');
    const header = raw.match(/^---\n([\s\S]*?)\n---/);
    const frontmatter = {};
    if (header)
      for (const line of header[1].split('\n')) {
        const match = line.match(/^(part|letter|lang|course):\s*(.+)$/);
        if (match)
          frontmatter[match[1]] =
            match[1] === 'part' ? Number(match[2]) : match[2].trim();
      }
    return { id: file, frontmatter, rawMarkdownBody: raw };
  });
const lesson = (part, lang = 'it') =>
  fs.readFileSync(
    path.join(root, `src/content/sqlite/${lang}/part${part}.md`),
    'utf8'
  );
const blocks = (source) =>
  [...source.matchAll(/^```js\n([\s\S]*?)^```/gm)].map((match) => match[1]);
const loadCode = (source, dependencies = {}) => {
  const module = { exports: {} };
  const localRequire = (name) =>
    Object.hasOwn(dependencies, name) ? dependencies[name] : require(name);
  new Function('require', 'module', 'exports', '__dirname', source)(
    localRequire,
    module,
    module.exports,
    __dirname
  );
  return module.exports;
};

test('track paths preserve anchors and do not alter external or example-app links', () => {
  assert.equal(
    coursePath('/it/part3/test#proxy', 'mongodb'),
    '/mongodb/it/part3/test#proxy'
  );
  assert.equal(
    coursePath('/mongodb/it/part3/test', 'sqlite'),
    '/it/part3/test'
  );
  assert.equal(coursePath('/mongodb/en', 'mongodb'), '/mongodb/en');
  assert.equal(
    coursePath('https://example.com', 'mongodb'),
    'https://example.com'
  );
  assert.equal(coursePath('//example.com', 'mongodb'), '//example.com');
  assert.equal(coursePath('/exampleapp/notes', 'mongodb'), '/exampleapp/notes');
  assert.equal(coursePath('#proxy', 'mongodb'), '#proxy');
});

test('only SQLite adds deployment after 5e', () => {
  assert.equal(Object.keys(getCourseNavigation('it', 5, 'sqlite')).at(-1), 'f');
  assert.equal(getCourseNavigation('it', 5, 'mongodb').f, undefined);
  assert.equal(
    getCourseTitle('it', 3, 'c', 'sqlite'),
    'Salvare i dati in SQLite'
  );
});

test('Gatsby routes select exact original or SQLite node, with English fallback', async () => {
  const pages = [];
  await hooks.createPages({
    actions: { createPage: (p) => pages.push(p) },
    graphql: async () => ({
      data: { allMarkdownRemark: { edges: nodes.map((node) => ({ node })) } },
    }),
  });
  assert.equal(
    new Set(pages.map((p) => p.path)).size,
    pages.length,
    'duplicate routes'
  );
  for (const lang of ['it', 'en']) {
    for (const section of [
      '3b',
      '3c',
      '3d',
      '4a',
      '4b',
      '4c',
      '4d',
      '5a',
      '5d',
      '5e',
    ]) {
      const base = pages.find(
        (p) =>
          p.context.lang === lang &&
          p.context.part === Number(section[0]) &&
          p.context.letter === section[1] &&
          p.context.course === 'sqlite'
      );
      assert(base, `${lang} ${section}`);
      assert(base.context.contentId.includes(`/sqlite/${lang}/`));
      const original = pages.find((p) => p.path === '/mongodb' + base.path);
      assert(original && !original.context.contentId.includes('/sqlite/'));
    }
  }
  assert(pages.some((p) => p.path === '/it/part5/pubblicare_lapplicazione'));
  assert(
    !pages.some((p) => p.path === '/mongodb/it/part5/pubblicare_lapplicazione')
  );
  const spanish = pages.find(
    (p) =>
      p.context.lang === 'es' &&
      p.context.part === 3 &&
      p.context.letter === 'c' &&
      p.context.course === 'sqlite'
  );
  assert(spanish.context.contentId.includes('/sqlite/en/'));
  const shared = pages.filter(
    (p) =>
      p.context.lang === 'it' &&
      p.context.part === 2 &&
      p.context.letter === 'a'
  );
  assert.equal(shared[0].context.contentId, shared[1].context.contentId);
});

test('landing-page mirrors do not recurse or mirror SQLite-only chapters', () => {
  const created = [];
  hooks.onCreatePage({
    page: { path: '/it', context: { langKey: 'it' } },
    actions: { createPage: (p) => created.push(p) },
  });
  assert.equal(created[0].path, '/mongodb/it');
  hooks.onCreatePage({
    page: created[0],
    actions: { createPage: (p) => created.push(p) },
  });
  assert.equal(created.length, 1);
});

test('file-based translated and root pages create both tracks directly', () => {
  for (const [source, expected] of [
    ['/index.it/', '/mongodb/it'],
    ['/search.en/', '/mongodb/en/search'],
    ['/', '/mongodb/'],
  ]) {
    const created = [];
    hooks.onCreatePage({
      page: { path: source, context: {} },
      actions: { deletePage: () => {}, createPage: (p) => created.push(p) },
    });
    assert(
      created.some((p) => p.path === expected),
      expected
    );
    assert.equal(created.length, 2);
  }
});

test('search indexes both tracks without duplicate or wrong-track bodies', () => {
  const config = require('../gatsby-config');
  const search = config.plugins.find((p) => p.options?.name === 'italian');
  const records = search.options.normalizer({
    data: { allMarkdownRemark: { nodes } },
  });
  assert.equal(new Set(records.map((r) => r.id)).size, records.length);
  const sqlite = records.find(
    (r) => r.part === 3 && r.letter === 'c' && r.course === 'sqlite'
  );
  const mongo = records.find(
    (r) => r.part === 3 && r.letter === 'c' && r.course === 'mongodb'
  );
  assert(sqlite.body.includes('node:sqlite'));
  assert(!sqlite.body.includes('npm install mongoose'));
  assert(mongo.body.includes('npm install mongoose'));
  assert.equal(
    records.filter((r) => r.part === 5 && r.letter === 'f').length,
    1
  );
});

test('new lessons have valid frontmatter, fences and image references', () => {
  for (const node of nodes.filter((n) => n.frontmatter.course === 'sqlite')) {
    assert(['it', 'en'].includes(node.frontmatter.lang));
    assert.equal(
      (node.rawMarkdownBody.match(/^```/gm) || []).length % 2,
      0,
      node.id
    );
    for (const [, relative] of node.rawMarkdownBody.matchAll(
      /!\[[^\]]*\]\(([^)]+)\)/g
    )) {
      assert(
        fs.existsSync(path.resolve(path.dirname(node.id), relative)),
        relative
      );
    }
    const prose = node.rawMarkdownBody.replace(
      /^```[^\n]*\n[\s\S]*?^```/gm,
      ''
    );
    assert.equal(
      (prose.match(/<div\b/g) || []).length,
      (prose.match(/<\/div>/g) || []).length,
      node.id
    );
  }
});

test('Part 3 examples execute SQL CRUD with string ids and real booleans', () => {
  for (const lang of ['it', 'en']) {
    const db = new DatabaseSync(':memory:');
    const snippets = blocks(lesson('3c', lang));
    const dbCode = snippets.find((s) => s.includes('new DatabaseSync'));
    const schema = dbCode.match(/db.exec\(`([\s\S]*?)`\)/)[1];
    db.exec(schema);
    const model = loadCode(
      snippets.find((s) => s.includes('const toNote')),
      { '../db': db }
    );
    const note = model.create({
      content: "SQL injection test: '); DROP TABLE notes; --",
      important: true,
    });
    assert.equal(typeof note.id, 'string');
    assert.equal(model.find(note.id).important, true);
    assert.equal(model.all().length, 1);
    assert.equal(
      model.update(note.id, { content: 'Updated note', important: false })
        .important,
      false
    );
    assert.throws(() => model.create({ content: 'x' }));
    assert.equal(model.remove(note.id), 1);
    assert.equal(model.find(note.id), null);
    db.close();
  }
});

test('user migration is repeatable, preserves data and enforces foreign keys', () => {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON');
  db.exec(
    blocks(lesson('3c'))
      .find((s) => s.includes('new DatabaseSync'))
      .match(/db.exec\(`([\s\S]*?)`\)/)[1]
  );
  db.prepare('INSERT INTO notes VALUES (?, ?, ?)').run(
    'old',
    'Existing note',
    1
  );
  const migration = blocks(lesson('4c')).find((s) =>
    s.includes('PRAGMA table_info')
  );
  new Function('db', migration)(db);
  new Function('db', migration)(db);
  assert.equal(
    db.prepare('SELECT content FROM notes').get().content,
    'Existing note'
  );
  db.prepare('INSERT INTO users VALUES (?, ?, ?, ?)').run(
    'u1',
    'alice',
    'Alice',
    'hash'
  );
  const model = loadCode(
    blocks(lesson('4c')).find((s) => s.includes('const toNote')),
    { '../db': db }
  );
  assert.equal(model.find('old').user, null);
  const note = model.create({
    content: 'Owned note',
    userId: 'u1',
    important: false,
  });
  assert.equal(note.user.username, 'alice');
  assert.equal(note.user.password_hash, undefined);
  assert.throws(() =>
    model.create({ content: 'Orphan note', userId: 'absent' })
  );
  assert.throws(() => db.prepare('DELETE FROM users WHERE id = ?').run('u1'));
  db.close();
});

test('complete authored CommonJS snippets parse', () => {
  for (const section of ['3c', '4c', '4d']) {
    for (const source of blocks(lesson(section))) {
      if (!source.includes('await api.') && !source.startsWith('"scripts"'))
        new vm.Script(`(function(require,module,exports){${source}\n})`);
    }
  }
});

test('test mode ignores a configured development database path', () => {
  const previous = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_PATH: process.env.DATABASE_PATH,
  };
  try {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_PATH = '/not-a-real-directory/development.db';
    const db = loadCode(
      blocks(lesson('3c')).find((s) => s.includes('new DatabaseSync'))
    );
    assert.equal(db.prepare('PRAGMA database_list').get().file, '');
    db.close();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test('authenticated note handlers preserve ownership and reject other authors', () => {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON');
  db.exec(
    blocks(lesson('3c'))
      .find((s) => s.includes('new DatabaseSync'))
      .match(/db.exec\(`([\s\S]*?)`\)/)[1]
  );
  new Function(
    'db',
    blocks(lesson('4c')).find((s) => s.includes('PRAGMA table_info'))
  )(db);
  for (const id of ['alice', 'bob'])
    db.prepare('INSERT INTO users VALUES (?, ?, ?, ?)').run(id, id, id, 'hash');
  const model = loadCode(
    blocks(lesson('4c')).find((s) => s.includes('const toNote')),
    { '../db': db }
  );
  const routes = {};
  const fakeRouter = Object.fromEntries(
    ['get', 'post', 'put', 'delete'].map((method) => [
      method,
      (url, ...handlers) => {
        routes[method + url] = handlers;
      },
    ])
  );
  const auth = () => {};
  loadCode(
    blocks(lesson('4d')).find((s) =>
      s.includes("const Note = require('../models/note')")
    ),
    {
      express: { Router: () => fakeRouter },
      '../models/note': model,
      '../utils/requireUser': auth,
    }
  );
  const invoke = (method, url, request) => {
    const response = {
      code: 200,
      body: null,
      status(code) {
        this.code = code;
        return this;
      },
      json(body) {
        this.body = body;
        return this;
      },
      end() {
        return this;
      },
    };
    routes[method + url].at(-1)(request, response);
    return response;
  };
  for (const method of ['post', 'put', 'delete'])
    assert.equal(routes[method + (method === 'post' ? '/' : '/:id')][0], auth);
  const created = invoke('post', '/', {
    user: { id: 'alice' },
    body: { content: 'An owned note', userId: 'bob' },
  });
  assert.equal(created.code, 201);
  assert.equal(created.body.user.id, 'alice');
  const id = created.body.id;
  assert.equal(
    invoke('delete', '/:id', { user: { id: 'bob' }, params: { id } }).code,
    403
  );
  assert.equal(
    invoke('put', '/:id', {
      user: { id: 'bob' },
      params: { id },
      body: { content: 'Changed text' },
    }).code,
    403
  );
  const changed = invoke('put', '/:id', {
    user: { id: 'bob' },
    params: { id },
    body: { important: true, user: { id: 'bob' } },
  });
  assert.equal(changed.body.user.id, 'alice');
  assert.equal(changed.body.important, true);
  assert.equal(
    invoke('delete', '/:id', { user: { id: 'alice' }, params: { id } }).code,
    204
  );
  assert.equal(model.find(id), null);
  db.close();
});

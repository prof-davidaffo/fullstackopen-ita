---
mainImage: ../../../images/part-4.svg
part: 4
letter: b
lang: en
course: sqlite
---

<div class="content">

### Isolated test database

db.js uses :memory: when NODE_ENV is test. Each process gets a new database, discarded when closed. Never reset your development file. DBeaver cannot open a process-local in-memory database.

Create test-env.cjs:

```js
process.env.NODE_ENV = 'test'
```

Install Supertest with npm install --save-dev supertest. Add "test": "node --require ./test-env.cjs --test" to package.json. This works across Windows, Linux and macOS.

### API integration tests

Create tests/notes.test.js:

```js
const { test, beforeEach, after } = require('node:test')
const assert = require('node:assert/strict')
const api = require('supertest')(require('../app'))
const db = require('../db')
const Note = require('../models/note')

beforeEach(() => {
  db.exec('DELETE FROM notes')
  Note.create({ content: 'An initial note', important: true })
})
test('GET returns JSON with string ids and boolean importance', async () => {
  const response = await api.get('/api/notes').expect(200).expect('Content-Type', /json/)
  assert.equal(response.body.length, 1)
  assert.equal(typeof response.body[0].id, 'string')
  assert.equal(response.body[0].important, true)
})
test('POST persists a valid note', async () => {
  await api.post('/api/notes').send({ content: 'A new note', important: false }).expect(201)
  assert.equal(Note.all().length, 2)
})
test('invalid POST does not change the database', async () => {
  await api.post('/api/notes').send({ content: 'x' }).expect(400)
  assert.equal(Note.all().length, 1)
})
test('unknown note returns 404', async () => {
  await api.get('/api/notes/nonexistent').expect(404)
})
after(() => db.close())
```

Do not run tests concurrently against the same connection. After adding authentication, create users first and log in before protected requests.

### Async and await

DatabaseSync operations are synchronous; HTTP requests and password hashing are not. Await every asynchronous operation being tested. Avoid promises that outlive the test.

### Transactions

Wrap related synchronous SQL writes in BEGIN / COMMIT and issue ROLLBACK on error. Do not leave a transaction open across await calls; other connections, including DBeaver, may be blocked.

</div>
<div class="tasks">

### Exercises 4.8–4.14

#### 4.8: Blog list tests, step 1
Test GET /api/blogs status, JSON and expected row count using an isolated database.

#### 4.9: Blog list tests, step 2
Verify each blog exposes a string id property.

#### 4.10: Blog list tests, step 3
Verify valid POST persists the correct fields and increases the count.

#### 4.11*: Blog list tests, step 4
Missing likes must default to zero. Add a test.

#### 4.12*: Blog list tests, step 5
Missing title or url must return 400 without inserting a row.

#### 4.13: Expanding the blog list, step 1
Implement and test DELETE /api/blogs/:id.

#### 4.14: Expanding the blog list, step 2
Implement and test PUT including likes. Reject negative or noninteger counts.
</div>


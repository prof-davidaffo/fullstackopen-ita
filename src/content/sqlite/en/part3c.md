---
mainImage: ../../../images/part-3.svg
part: 3
letter: c
lang: en
course: sqlite
---

<div class="content">

### SQLite

SQLite stores tables in a local file owned by the backend. React only talks to Express over HTTP, never directly to the database. No separate database server, Docker or cloud credentials are needed.

Use Node 24 LTS or later with the built-in [node:sqlite](https://nodejs.org/download/release/latest-v24.x/docs/api/sqlite.html) module. No SQLite npm package is required. In Node 24 this API is classified as a release candidate. DatabaseSync operations are synchronous: a long query blocks the event loop, so this simple approach is intended for small learning projects.

### Debugging Node applications

Keep the backend terminal open, inspect requests and use console.log or VS Code breakpoints. Check the API and database independently of React before changing frontend code.

### Project files

Continue the Part 3a notes backend. These examples use CommonJS; do not add "type": "module" to package.json. Install Express with npm install express if needed. Create db.js, models/note.js, controllers/notes.js, app.js and index.js.

### Moving db configuration to its own module

Create **db.js**:

```js
const { DatabaseSync } = require('node:sqlite')
const path = require('node:path')

const filename = process.env.NODE_ENV === 'test'
  ? ':memory:'
  : (process.env.DATABASE_PATH || path.join(__dirname, 'notes.db'))
const db = new DatabaseSync(filename)
db.exec('PRAGMA foreign_keys = ON')
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL CHECK(length(trim(content)) >= 5),
    important INTEGER NOT NULL DEFAULT 0 CHECK(important IN (0, 1))
  )
`)

module.exports = db
```

The default file lives beside db.js. A custom DATABASE_PATH directory must already exist. In tests the database is always in memory, protecting development data. CREATE TABLE IF NOT EXISTS does not migrate an existing table.

Ignore node_modules/, .env, *.db and *.db-* in Git. Keep schema scripts, not personal data, in version control.

### Connecting the backend to a database

Create **models/note.js**:

```js
const { randomUUID } = require('node:crypto')
const db = require('../db')

const toNote = row => row
  ? { id: row.id, content: row.content, important: Boolean(row.important) }
  : null

const all = () => db.prepare('SELECT * FROM notes ORDER BY rowid').all().map(toNote)
const find = id => toNote(db.prepare('SELECT * FROM notes WHERE id = ?').get(id))

const create = ({ content, important = false }) => {
  const id = randomUUID()
  db.prepare('INSERT INTO notes (id, content, important) VALUES (?, ?, ?)')
    .run(id, content, Number(important))
  return find(id)
}

const update = (id, { content, important }) => {
  const result = db.prepare('UPDATE notes SET content = ?, important = ? WHERE id = ?')
    .run(content, Number(important), id)
  return result.changes ? find(id) : null
}

const remove = id => db.prepare('DELETE FROM notes WHERE id = ?').run(id).changes

module.exports = { all, find, create, update, remove }
```

UUID identifiers remain strings, matching the frontend API. Convert SQLite integers 0/1 to JavaScript booleans. prepare creates a statement, all reads rows, get reads one row and run performs a write. Pass values through ? placeholders; never concatenate user input into SQL.

### Using database in route handlers

Create **controllers/notes.js**:

```js
const router = require('express').Router()
const Note = require('../models/note')

const valid = body => body && typeof body.content === 'string'
  && body.content.trim().length >= 5
  && (body.important === undefined || typeof body.important === 'boolean')

router.get('/', (request, response) => response.json(Note.all()))

router.get('/:id', (request, response) => {
  const note = Note.find(request.params.id)
  if (!note) return response.status(404).json({ error: 'note not found' })
  response.json(note)
})

router.post('/', (request, response) => {
  if (!valid(request.body)) {
    return response.status(400).json({ error: 'content must have at least 5 characters; important must be boolean' })
  }
  response.status(201).json(Note.create({
    content: request.body.content.trim(),
    important: request.body.important ?? false
  }))
})

router.put('/:id', (request, response) => {
  if (!valid(request.body)) return response.status(400).json({ error: 'invalid note' })
  const previous = Note.find(request.params.id)
  if (!previous) return response.status(404).json({ error: 'note not found' })
  response.json(Note.update(request.params.id, {
    content: request.body.content.trim(),
    important: request.body.important ?? previous.important
  }))
})

router.delete('/:id', (request, response) => {
  Note.remove(request.params.id)
  response.status(204).end()
})

module.exports = router
```

Create **app.js**:

```js
const express = require('express')
const app = express()

app.use(express.json())
app.use('/api/notes', require('./controllers/notes'))
app.use((request, response) => response.status(404).json({ error: 'unknown endpoint' }))
app.use((error, request, response, next) => {
  if (error.type === 'entity.parse.failed') {
    return response.status(400).json({ error: 'invalid JSON' })
  }
  console.error(error.message)
  response.status(500).json({ error: 'internal server error' })
})

module.exports = app
```

Create **index.js**:

```js
const app = require('./app')
const port = process.env.PORT || 3001
const host = process.env.HOST || '127.0.0.1'
app.listen(port, host, () => console.log(`Server on http://${host}:${port}`))
```

Add scripts "start": "node index.js" and "dev": "node --watch index.js" to package.json. Run npm run dev. GET http://localhost:3001/api/notes initially returns []. POST a JSON body such as {"content":"My persistent note","important":true} with Content-Type: application/json.

### Inspect the file

In DBeaver create a SQLite connection and select the backend's notes.db file. Download the driver if prompted. Open Tables → notes → Data and refresh after changes. There is no database host or password.

SQLite Viewer in VS Code is a read-only alternative; SQLTools with its SQLite driver can run queries. Do not leave write transactions open in another tool. Keep the active database on a local disk, not a network or synchronized folder.

### Verifying frontend and backend integration

The API still returns id, content and important. Keep the previous chapter's Vite proxy. Create a note, restart Node and verify it remains. Always inspect the exact same file in DBeaver.

### Other operations

PUT changes note content and importance. DELETE returns 204 even if the note was already removed. GET for an unknown id returns 404. These identifiers are not ObjectIds and there are no Mongoose CastErrors.

### Error handling

Register express.json before routers and the 404 and error handlers afterwards. Validate input before writing. Do not expose SQL errors, local paths or stack traces to the client.

</div>
<div class="tasks">

### Exercises 3.12–3.18

#### 3.12: Command-line database
Create persons with id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE and number TEXT NOT NULL. Write a Node command-line script to list or add people with parameterized queries. Close the connection when done.

#### 3.13: Phonebook database, step 1
Replace the in-memory list with a SELECT, keeping the frontend JSON format.

#### 3.14: Phonebook database, step 2
INSERT new people using randomUUID ids. Verify persistence after restarting and inspect the file.

#### 3.15: Phonebook database, step 3
Implement DELETE and verify the frontend removes the right person.

#### 3.16: Phonebook database, step 4
Centralize error handling. Distinguish bad input, missing resources and unexpected failures without exposing SQL details.

#### 3.17*: Phonebook database, step 5
Implement PUT to update a phone number without creating a duplicate person.

#### 3.18*: Phonebook database, step 6
Implement GET /api/persons/:id and /info. Count rows with SELECT COUNT(*) instead of loading all of them.
</div>


---
mainImage: ../../../images/part-4.svg
part: 4
letter: c
lang: en
course: sqlite
---

<div class="content">

### Users and relationships

Represent one user owning many notes with users.id and notes.user_id, a foreign key. Do not duplicate note ids in an array inside the user.

### Migrating existing data

Add this after notes table initialization in db.js:

```js
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE CHECK(length(username) >= 3),
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL
  )
`)

const columns = db.prepare('PRAGMA table_info(notes)').all()
if (!columns.some(column => column.name === 'user_id')) {
  db.exec('ALTER TABLE notes ADD COLUMN user_id TEXT REFERENCES users(id)')
}
```

The column check makes the migration repeatable. Existing notes keep a NULL author. Create an actual user and explicitly assign their id in an administrative script before Part 5:

```js
db.prepare('UPDATE notes SET user_id = ? WHERE user_id IS NULL').run(userId)
```

Choose the correct real userId; do not run automatic reassignment at every startup. Back up important data first. PRAGMA foreign_keys = ON enables relationship checks on this connection; other writers must enable them too.

### Password hashing

Install bcryptjs with npm install bcryptjs. Create controllers/users.js:

```js
const router = require('express').Router()
const bcrypt = require('bcryptjs')
const { randomUUID } = require('node:crypto')
const db = require('../db')

router.get('/', (request, response) => {
  const users = db.prepare('SELECT id, username, name FROM users').all()
  response.json(users.map(user => ({
    ...user,
    notes: db.prepare('SELECT id, content, important FROM notes WHERE user_id = ?')
      .all(user.id).map(note => ({ ...note, important: Boolean(note.important) }))
  })))
})

router.post('/', async (request, response, next) => {
  try {
    const { username, name, password } = request.body || {}
    if (typeof username !== 'string' || username.trim().length < 3
      || typeof password !== 'string' || password.length < 3
      || Buffer.byteLength(password, 'utf8') > 72
      || (name !== undefined && typeof name !== 'string')) {
      return response.status(400).json({ error: 'invalid username, name or password' })
    }
    const passwordHash = await bcrypt.hash(password, 10)
    const user = { id: randomUUID(), username: username.trim(), name: name || '' }
    try {
      db.prepare('INSERT INTO users (id, username, name, password_hash) VALUES (?, ?, ?, ?)')
        .run(user.id, user.username, user.name, passwordHash)
    } catch (error) {
      if (error.errcode === 2067) {
        return response.status(409).json({ error: 'username already exists' })
      }
      throw error
    }
    response.status(201).json({ ...user, notes: [] })
  } catch (error) {
    next(error)
  }
})

module.exports = router
```

The three-character minimum is for exercises, not a production password policy. Reject passwords exceeding bcrypt's 72-byte limit. The UNIQUE constraint prevents concurrent duplicate usernames; SQLite extended error 2067 identifies this violation.

Mount the router before the 404 handler:

```js
app.use('/api/users', require('./controllers/users'))
```

POST username, name and password to /api/users. Inspect password_hash in DBeaver, but never expose it in API responses.

### JOIN instead of populate

Replace models/note.js:

```js
const { randomUUID } = require('node:crypto')
const db = require('../db')

const select = `
  SELECT notes.*, users.username, users.name
  FROM notes LEFT JOIN users ON users.id = notes.user_id
`
const toNote = row => row ? {
  id: row.id,
  content: row.content,
  important: Boolean(row.important),
  user: row.user_id
    ? { id: row.user_id, username: row.username, name: row.name }
    : null
} : null

const all = () => db.prepare(select + ' ORDER BY notes.rowid').all().map(toNote)
const find = id => toNote(db.prepare(select + ' WHERE notes.id = ?').get(id))
const create = ({ content, important = false, userId }) => {
  const id = randomUUID()
  db.prepare('INSERT INTO notes (id, content, important, user_id) VALUES (?, ?, ?, ?)')
    .run(id, content, Number(important), userId)
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

LEFT JOIN retains old notes with user: null. After assigning old notes, every user object contains id, username and name, matching the frontend contract.

You can test this model from a script by explicitly passing userId. The next chapter gets ownership from a verified token, not client input.

### User tests

Test successful registration, duplicates, short passwords and absence of hashes from responses. Delete notes before users during setup, then create users before notes and pass userId.

GET /api/users uses one extra query per user for simplicity. Larger applications should evaluate joins or batching to avoid this pattern.
</div>


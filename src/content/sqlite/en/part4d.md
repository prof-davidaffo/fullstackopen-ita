---
mainImage: ../../../images/part-4.svg
part: 4
letter: d
lang: en
course: sqlite
---

<div class="content">

### Login and tokens

SQLite changes storage, not the frontend authentication protocol. Keep JWT authentication. Install jsonwebtoken with npm install jsonwebtoken.

Generate a secret using node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))". Put SECRET=yourGeneratedValue in .env, never in Git. Set start to node --env-file=.env index.js and dev to node --env-file=.env --watch index.js.

Before registering routers in app.js, check:

```js
if (!process.env.SECRET) throw new Error('Set SECRET before starting the application')
```

For tests add process.env.SECRET = 'test-only-secret-not-for-production' to test-env.cjs. Never use this test secret in a public application.

Create controllers/login.js:

```js
const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../db')

router.post('/', async (request, response, next) => {
  try {
    const { username, password } = request.body || {}
    if (typeof username !== 'string' || typeof password !== 'string') {
      return response.status(400).json({ error: 'username and password required' })
    }
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username)
    const valid = user && await bcrypt.compare(password, user.password_hash)
    if (!valid) return response.status(401).json({ error: 'invalid username or password' })
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.SECRET, {
      algorithm: 'HS256', expiresIn: '1h'
    })
    response.json({ token, username: user.username, name: user.name })
  } catch (error) {
    next(error)
  }
})

module.exports = router
```

Mount it before the 404 handler:

```js
app.use('/api/login', require('./controllers/login'))
```

A valid login returns token, username and name. Use the same public error for missing users and incorrect passwords.

### Protecting writes

Create utils/requireUser.js:

```js
const jwt = require('jsonwebtoken')
const db = require('../db')

const requireUser = (request, response, next) => {
  const authorization = request.get('authorization') || ''
  if (!authorization.toLowerCase().startsWith('bearer ')) {
    return response.status(401).json({ error: 'token missing' })
  }
  let payload
  try {
    payload = jwt.verify(authorization.slice(7), process.env.SECRET, {
      algorithms: ['HS256']
    })
  } catch {
    return response.status(401).json({ error: 'invalid or expired token' })
  }
  if (typeof payload.id !== 'string') {
    return response.status(401).json({ error: 'invalid token' })
  }
  const user = db.prepare('SELECT id, username, name FROM users WHERE id = ?').get(payload.id)
  if (!user) return response.status(401).json({ error: 'user no longer exists' })
  request.user = user
  next()
}

module.exports = requireUser
```

The client sends Authorization: Bearer followed by the token. Validate its signature, algorithm and expiry, and ensure the user still exists. Never trust a user id in the request body.

Replace controllers/notes.js:

```js
const router = require('express').Router()
const Note = require('../models/note')
const requireUser = require('../utils/requireUser')

router.get('/', (request, response) => response.json(Note.all()))
router.get('/:id', (request, response) => {
  const note = Note.find(request.params.id)
  if (!note) return response.status(404).json({ error: 'note not found' })
  response.json(note)
})

router.post('/', requireUser, (request, response) => {
  const { content, important = false } = request.body || {}
  if (typeof content !== 'string' || content.trim().length < 5 || typeof important !== 'boolean') {
    return response.status(400).json({ error: 'invalid note' })
  }
  response.status(201).json(Note.create({
    content: content.trim(), important, userId: request.user.id
  }))
})

router.put('/:id', requireUser, (request, response) => {
  const note = Note.find(request.params.id)
  if (!note) return response.status(404).json({ error: 'note not found' })
  const { content = note.content, important = note.important } = request.body || {}
  if (typeof content !== 'string' || content.trim().length < 5 || typeof important !== 'boolean') {
    return response.status(400).json({ error: 'invalid note' })
  }
  // Everyone logged in may change importance, but only the author edits content.
  if (content.trim() !== note.content && note.user?.id !== request.user.id) {
    return response.status(403).json({ error: 'only the author can edit content' })
  }
  response.json(Note.update(note.id, { content: content.trim(), important }))
})

router.delete('/:id', requireUser, (request, response) => {
  const note = Note.find(request.params.id)
  if (!note) return response.status(404).json({ error: 'note not found' })
  if (note.user?.id !== request.user.id) {
    return response.status(403).json({ error: 'only the author can delete this note' })
  }
  Note.remove(note.id)
  response.status(204).end()
})

module.exports = router
```

Reads are public. Creating notes and changing importance require login; only the author may change text or delete a note. Ownership cannot be changed through PUT.

### Token security

401 means missing, invalid or expired credentials; 403 means an authenticated user lacks permission. Handle expiry in the frontend by asking the user to log in again.

JWT contents are not encrypted. Removing a token from browser storage does not revoke a stolen copy. Public applications also need HTTPS, login rate limits, a real password policy and XSS protection; this is teaching code, not a complete production identity system.

### Update tests

Create a user, POST /api/login and use response.body.token. Send it with .set('Authorization', `Bearer ${token}`) on protected requests. Prepare initial notes with userId. Test that one user cannot delete another user's note.

</div>
<div class="tasks">

### Exercises 4.15–4.23

#### 4.15: Expanding the blog list, step 3
Add users with id, unique username, name and password_hash. Implement registration with hashed passwords and GET /api/users without hashes.

#### 4.16*: Expanding the blog list, step 4
Test missing/short credentials and duplicate usernames, verifying rejected requests do not change the database.

#### 4.17: Expanding the blog list, step 5
Add blogs.user_id as a foreign key. Each blog returns user: { id, username, name }; each user returns blogs with id, title and url. Use SQL, not populate. Assign an actual owner to existing blogs.

#### 4.18: Expanding the blog list, step 6
Implement JWT login.

#### 4.19: Expanding the blog list, step 7
Require a valid token to create blogs. Derive ownership from the authenticated user.

#### 4.20*: Expanding the blog list, step 8
Extract token reading into tokenExtractor, setting request.token, and use it in the authentication middleware.

#### 4.21*: Expanding the blog list, step 9
Only the creator may delete a blog. Return 401 without login and 403 for another user.

#### 4.22*: Expanding the blog list, step 10
Use reusable authentication middleware. Require login for likes too and prevent changing the owner through PUT.

#### 4.23*: Expanding the blog list, step 11
Update tests for valid/invalid login, missing/invalid tokens, authenticated creation and allowed/denied deletion. Check that hashes are not exposed.
</div>


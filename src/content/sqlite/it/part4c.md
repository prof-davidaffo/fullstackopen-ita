---
mainImage: ../../../images/part-4.svg
part: 4
letter: c
lang: it
course: sqlite
---

<div class="content">

### Utenti e relazioni

Un utente può creare più note; ogni nuova nota appartiene a un utente. In SQL rappresentiamo questa relazione con users.id e notes.user_id, una chiave esterna. Non salviamo anche un array di id delle note nell'utente: sarebbe una duplicazione da mantenere sincronizzata.

### Migrare lo schema senza cancellare le note

Aggiungi a db.js, dopo la creazione della tabella notes e prima dell'export:

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

Il controllo di table_info rende la migrazione ripetibile. Le note precedenti hanno user_id NULL: non sono cancellate, ma non hanno ancora un autore. Prima di proseguire verso la Parte 5, crea un utente e assegna esplicitamente quelle note al suo id con una query parametrizzata:

```js
db.prepare('UPDATE notes SET user_id = ? WHERE user_id IS NULL').run(userId)
```

Esegui questa operazione in uno script amministrativo, dopo aver scelto l'utente corretto; userId deve essere il suo id reale. Non farla automaticamente a ogni avvio. Fai un backup prima di migrare dati importanti.

PRAGMA foreign_keys = ON abilita il controllo delle relazioni per questa connessione. Anche eventuali altre connessioni che scrivono devono abilitarlo. Una nota non può riferirsi a un utente inesistente; un utente referenziato non può essere cancellato senza prima gestire le sue note.

### Password e creazione degli utenti

Non memorizziamo password in chiaro. Usiamo bcryptjs per calcolare un hash con salt:

```bash
npm install bcryptjs
```

Crea controllers/users.js:

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

La lunghezza minima di tre caratteri serve soltanto agli esercizi, non è una politica password adeguata per un servizio reale. Il limite di 72 byte evita la troncatura silenziosa di bcrypt. Valida la password **prima** di calcolare l'hash.

L'errore SQLite 2067 indica la violazione di un vincolo UNIQUE: in questa tabella il nome utente è l'unico campo UNIQUE non primario. Il controllo del database protegge anche da due registrazioni concorrenti.

Registra il router in app.js, prima del gestore 404:

```js
app.use('/api/users', require('./controllers/users'))
```

Invia una POST a /api/users con username, name e password. Controlla in DBeaver: vedrai password_hash, non la password. Le risposte HTTP non devono mai includere l'hash.

### JOIN al posto di populate

Sostituisci models/note.js con:

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

LEFT JOIN conserva anche le vecchie note senza autore, rappresentate con user: null. Dopo l'assegnazione dei dati precedenti ogni nota restituisce user con id, username e name: lo stesso formato atteso dal frontend.

Prima di introdurre il login puoi provare il modello in uno script passando userId esplicitamente. Nel prossimo capitolo sarà il token a determinare l'autore: non fidarti di un id scelto dal browser.

### Test degli utenti

Verifica creazione, username duplicato, password troppo corta e assenza di password_hash nelle risposte. In ogni setup cancella prima notes e poi users, rispettando la chiave esterna. Prepara gli utenti prima delle note e passa userId al modello.

La GET degli utenti usa più query per semplicità. È accettabile per la piccola esercitazione, ma in un'applicazione grande occorre valutare una JOIN o una query aggregata per evitare una query aggiuntiva per ogni utente.
</div>


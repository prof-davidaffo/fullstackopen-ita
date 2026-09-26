---
mainImage: ../../../images/part-4.svg
part: 4
letter: d
lang: it
course: sqlite
---

<div class="content">

### Login e token

Manteniamo l'autenticazione tramite JWT del percorso originale: SQLite cambia la persistenza, non il protocollo usato dal frontend. Installa:

```bash
npm install jsonwebtoken
```

Genera un segreto casuale nel terminale:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Salvalo in .env come SECRET=valoreGenerato, senza versionarlo. Configura gli script start e dev con node --env-file=.env index.js e node --env-file=.env --watch index.js. In app.js, prima dei router, verifica:

```js
if (!process.env.SECRET) {
  throw new Error('Set SECRET before starting the application')
}
```

Per i test aggiungi a test-env.cjs un segreto fisso destinato **soltanto ai test**, ad esempio process.env.SECRET = 'test-only-secret-not-for-production'. Il file non deve impostare NODE_ENV per l'avvio normale.

Crea controllers/login.js:

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

Registra /api/login in app.js prima del gestore 404:

```js
app.use('/api/login', require('./controllers/login'))
```

Una POST con username e password validi restituisce token, username e name. Non distinguere nel messaggio pubblico fra utente assente e password errata.

### Limitare la creazione di note agli utenti autenticati

Crea utils/requireUser.js:

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

Il client invia Authorization: Bearer seguito dal token. Il server verifica firma, algoritmo e scadenza e controlla che l'utente esista ancora. L'autore proviene dal token verificato, non dal corpo della richiesta.

Sostituisci controllers/notes.js con questa versione:

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

Le letture sono pubbliche. Creazione e modifica dell'importanza richiedono login. Soltanto l'autore può modificare il testo o eliminare una nota. La proprietà user non viene modificata da PUT.

### Errori e sicurezza

401 indica credenziali assenti, errate o scadute; 403 un utente autenticato senza permesso. Il frontend deve gestire la scadenza chiedendo un nuovo login.

Un JWT non cifra il proprio contenuto. Non inserirvi password o dati sensibili. Rimuoverlo dal browser al logout non revoca una copia rubata: per revoca immediata servono controlli aggiuntivi lato server. In un servizio reale servono HTTPS, limiti ai tentativi di login, una politica password adeguata e protezione da XSS. Questi esempi sono una base didattica, non un sistema di identità pronto per la produzione.

### Aggiornare i test

Crea un utente, fai POST /api/login e leggi response.body.token. Per una POST protetta usa:

```js
await api.post('/api/notes')
  .set('Authorization', `Bearer ${token}`)
  .send({ content: 'Una nota autenticata', important: true })
  .expect(201)
```

Il token non è necessario per GET. Aggiorna anche i dati iniziali delle note passando userId. Verifica che utenti diversi non possano cancellarsi le note a vicenda.

</div>
<div class="tasks">

### Esercizi 4.15–4.23

#### 4.15: Estendere la lista di blog, passo 3
Aggiungi users con id, username univoco, name e password_hash. Realizza la creazione utenti con password sottoposte a hashing e GET /api/users senza hash.

#### 4.16*: Estendere la lista di blog, passo 4
Testa username e password mancanti o troppo corti e username duplicati. Verifica che le richieste rifiutate non modifichino il database.

#### 4.17: Estendere la lista di blog, passo 5
Aggiungi blogs.user_id come chiave esterna. Restituisci per ogni blog user: { id, username, name }; restituisci per ogni utente i propri blog con id, title e url. Usa SQL, non populate. Migra gli eventuali blog già esistenti assegnando un autore reale.

#### 4.18: Estendere la lista di blog, passo 6
Implementa POST /api/login con JWT e hash delle password.

#### 4.19: Estendere la lista di blog, passo 7
Richiedi un token valido per creare blog. Assegna l'autore dall'utente autenticato, ignorando qualunque user o userId inviato nel corpo.

#### 4.20*: Estendere la lista di blog, passo 8
Estrai il recupero del token in un middleware tokenExtractor che imposti request.token. Adatta il middleware di autenticazione a usarlo.

#### 4.21*: Estendere la lista di blog, passo 9
Permetti l'eliminazione soltanto al creatore del blog. Rispondi 401 senza login e 403 se l'utente è diverso dall'autore.

#### 4.22*: Estendere la lista di blog, passo 10
Organizza la verifica dell'utente in un middleware riutilizzabile. Richiedi login anche per aggiungere like; non consentire di cambiare l'autore tramite PUT.

#### 4.23*: Estendere la lista di blog, passo 11
Aggiorna tutti i test: login valido e non valido, token mancante o errato, creazione autenticata, eliminazione autorizzata e negata. Assicurati che username e hash non vengano esposti impropriamente.
</div>


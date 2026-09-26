---
mainImage: ../../../images/part-3.svg
part: 3
letter: c
lang: it
course: sqlite
---

<div class="content">

### Il database è un file locale

SQLite conserva tabelle e righe in un file sul computer che esegue Node. Non servono account cloud, password di connessione, Docker o un server database separato. Il browser continua a parlare soltanto con Express, mai direttamente con il file.

Usiamo il modulo integrato [node:sqlite](https://nodejs.org/download/release/latest-v24.x/docs/api/sqlite.html) con Node 24 LTS o successivo. Non occorre installare un pacchetto SQLite con npm. L'API è ancora classificata come release candidate in Node 24: se compare un avviso sperimentale non significa che il database non funzioni.

Le operazioni di DatabaseSync sono sincrone: adatte a questi piccoli progetti didattici, ma una query lunga blocca l'event loop. Non confondere la semplicità dell'esempio con una soluzione universale per applicazioni ad alto traffico.

### Debugging delle applicazioni Node

Avvia il backend dal terminale e osserva gli errori. Usa console.log per verificare i dati ricevuti oppure il debugger di VS Code per fermarti su un breakpoint. Controlla separatamente API, database e frontend: se una richiesta HTTP fallisce, non partire modificando il componente React.

### Preparare il backend

Continuiamo il progetto delle note della 3a, mantenendo gli endpoint usati dal frontend. Gli esempi del backend usano CommonJS: non aggiungere `"type": "module"` al package.json. Non copiare il file package.json del sito del corso.

Installa Express nel tuo progetto, se non è già presente:

```bash
npm install express
```

Crea questa struttura. La separazione in moduli sarà approfondita nella Parte 4:

```text
backend/
  index.js
  app.js
  db.js
  models/note.js
  controllers/notes.js
```

### Spostare la configurazione del database in un modulo

Crea **db.js**:

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

La directory scelta con DATABASE_PATH deve già esistere. Senza configurazione il file notes.db si trova accanto a db.js. Il database di test è invece in memoria e non può sovrascrivere quello di sviluppo.

CREATE TABLE IF NOT EXISTS crea lo schema soltanto se manca: **non aggiorna una tabella esistente**. Le modifiche successive richiederanno una migrazione. Il vincolo CHECK protegge i dati anche quando una scrittura non passa da Express.

Aggiungi al .gitignore del backend:

```text
node_modules/\n.env\n*.db\n*.db-*
```

Versiona codice e script dello schema, non dati personali, password o il database di lavoro.

### Collegare il backend al database

Crea **models/note.js**:

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

Gli id sono UUID di tipo stringa, generati da Node, così il frontend mantiene lo stesso contratto JSON. SQLite rappresenta important con 0 o 1; il modello lo converte in un booleano JavaScript.

`prepare` prepara una query; `all` restituisce le righe, `get` una sola riga e `run` esegue una modifica. I segnaposto ? tengono separati SQL e valori: **non concatenare input utente nella query**.

Non usiamo un ORM: le query restano visibili, in collegamento con ciò che impari nella materia di database.

### Usare il database nei gestori delle rotte

Crea **controllers/notes.js**:

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

Crea **app.js**:

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

Infine **index.js**:

```js
const app = require('./app')
const port = process.env.PORT || 3001
const host = process.env.HOST || '127.0.0.1'
app.listen(port, host, () => console.log(`Server on http://${host}:${port}`))
```

Nel package.json aggiungi gli script, mantenendo le altre proprietà:

```json
"scripts": {
  "start": "node index.js",
  "dev": "node --watch index.js"
}
```

Avvia con npm run dev. GET http://localhost:3001/api/notes restituisce inizialmente un array vuoto. Invia una POST con Content-Type: application/json e questo corpo:

```json
{"content":"La prima nota persistente","important":true}
```

### Visualizzare il database

Apri DBeaver → Nuova connessione → SQLite e seleziona **il notes.db del backend**. Se richiesto scarica il driver, poi apri Tabelle → notes → Dati. Non servono host o credenziali. Aggiorna la vista dopo una modifica.

In alternativa usa SQLite Viewer in VS Code per la sola lettura, oppure SQLTools con il driver SQLite per eseguire query. Non lasciare transazioni di scrittura aperte nell'editor mentre l'applicazione scrive: potresti bloccare il database.

Tienilo su disco locale, non su una cartella di rete o sincronizzata mentre è in uso.

### Verificare l'integrazione tra frontend e backend

Il frontend continua a ricevere oggetti con id, content e important. Usa il proxy della sezione precedente. Aggiungi una nota, ferma Node e riavvialo: la nota rimane. Se apri un altro file in DBeaver vedrai un database diverso; verifica sempre il percorso.

### Altre operazioni

Le rotte PUT e DELETE sono già presenti. PUT modifica contenuto e importanza; DELETE restituisce 204, anche se la nota era già stata rimossa. GET su un id inesistente restituisce 404. Gli id non hanno il formato ObjectId: non esistono CastError di Mongoose.

### Errori e ordine dei middleware

express.json viene prima dei router; il gestore 404 e quello degli errori vengono dopo. Valida le richieste prima del modello. Non restituire al client stack trace, percorsi del filesystem o messaggi SQL interni.

</div>

<div class="tasks">

### Esercizi 3.12–3.18

#### 3.12: Database da riga di comando
Crea una tabella persons con id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE e number TEXT NOT NULL. Scrivi un programma Node che elenchi le persone o ne aggiunga una usando gli argomenti della riga di comando. Usa query parametrizzate e chiudi la connessione al termine.

#### 3.13: Database della rubrica, passo 1
Sostituisci l'array in memoria del backend con una SELECT dalla tabella persons. Mantieni lo stesso formato JSON del frontend.

#### 3.14: Database della rubrica, passo 2
Salva le nuove persone con INSERT e id generati da randomUUID. Verifica la persistenza dopo un riavvio e controlla il file con DBeaver.

#### 3.15: Database della rubrica, passo 3
Implementa DELETE e verifica che il frontend rimuova la persona corretta.

#### 3.16: Database della rubrica, passo 4
Centralizza la gestione degli errori. Distingui richieste non valide, risorse assenti ed errori interni; non mostrare dettagli SQL al browser.

#### 3.17*: Database della rubrica, passo 5
Implementa PUT per aggiornare il numero di una persona esistente. Una modifica non deve creare una seconda persona con lo stesso nome.

#### 3.18*: Database della rubrica, passo 6
Fai funzionare GET /api/persons/:id e /info usando il database. Per il conteggio usa SELECT COUNT(*) invece di caricare tutte le righe.

</div>

